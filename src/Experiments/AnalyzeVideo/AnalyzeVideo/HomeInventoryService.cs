using Google.GenAI;
using Google.GenAI.Types;
using File = System.IO.File;
using GTypes = Google.GenAI.Types;

namespace AnalyzeVideo;

public class GeminiInventoryService(Client client)
{
    private static readonly string GeminiModel = "gemini-3-pro-preview";

    private static readonly string GeminiPrompt = """

                                                  Role: You are an expert Relocation Surveyor and Packaging Logistics Agent.
                                                  Task: Analyze the video and audio to generate a precise "Bill of Materials" and inventory list for a premium home move.

                                                  ### CRITICAL INSTRUCTIONS:

                                                  1. SPATIAL GROUNDING & DIMENSIONS: 
                                                     - Use architectural anchors (Door=203cm, Counter=90cm, Tiles=60cm) to estimate real-world scale.
                                                     - Output exact bounding box dimensions (Length x Width x Height) in cm.
                                                     - If an object is irregular (e.g., an L-shaped sofa), calculate the volume of the space it effectively occupies in a truck.

                                                  2. GEOMETRICAL ANALYSIS: Calculate Length, Width, and Height (L x W x H) in cm. For non-cuboid items, provide the 'Bounding Box' volume (the space required to box the item).
                                                  
                                                  3. PACKAGING MATERIAL LOGIC:
                                                     Estimate the exact materials required to pack each item safely. Use these rules:
                                                     - Furniture (Sofas/Chairs): Recommend 'Moving Blankets' & 'Shrink Wrap'.
                                                       * Logic: 1 Blanket per 1.5m of surface area.
                                                     - Fragile (Glass/TVs/Monitors): Recommend 'Bubble Wrap' & 'Corrugated Sheet' or 'Crate'.
                                                       * Logic: Wrap length = (2 * (Length + Width)) * 3 layers.
                                                     - Small/Loose Items (Books/Utensils): Recommend 'Cardboard Box (M)' or 'Cardboard Box (L)'.
                                                     - Mattresses: Recommend 'Mattress Cover'.

                                                  4. AUDIO ANALYSIS:
                                                     - Listen for user voice cues. If the user says "This is antique," "Be careful," or "Expensive," mark 'fragility' as 'High' and add a note.

                                                  5. LOGISTICS ATTRIBUTES:
                                                     - Stackability: Can heavy items be placed on top? (true/false)
                                                     - Disassembly: Does it require tools (hex keys/screwdrivers) to move? (true/false)

                                                  ### OUTPUT FORMAT: 
                                                  Return strictly valid JSON as an array of objects. Do not include markdown formatting.
                                                  """;

    public async Task<IResult> AnalyzeHomeVideo(AnalyzeRequest request)
    {
        try
        {
            // 4. Generate Structured Inventory
            var response = await client.Models.GenerateContentAsync(
                model: GeminiModel,
                contents:
                [
                    new Content
                    {
                        Parts =
                        [
                            new() { Text = GeminiPrompt },
                            new() { FileData = new FileData { FileUri = request.FileUri, MimeType = "video/mp4" } }
                        ]
                    }
                ],
                config: new GenerateContentConfig
                {
                    ResponseMimeType = "application/json",
                    ResponseSchema = new GTypes.Schema
                    {
                        Type = GTypes.Type.ARRAY,
                        Items = new GTypes.Schema
                        {
                            Type = GTypes.Type.OBJECT,
                            Properties = new Dictionary<string, GTypes.Schema>
                            {
                                { "item", new GTypes.Schema { Type = GTypes.Type.STRING } },
                                {
                                    "dimensions", new GTypes.Schema
                                    {
                                        Type = GTypes.Type.OBJECT,
                                        Properties = new Dictionary<string, GTypes.Schema>
                                        {
                                            { "length_cm", new GTypes.Schema { Type = GTypes.Type.NUMBER } },
                                            { "width_cm", new GTypes.Schema { Type = GTypes.Type.NUMBER } },
                                            { "height_cm", new GTypes.Schema { Type = GTypes.Type.NUMBER } }
                                        }
                                    }
                                },
                                {
                                    "packaging", new GTypes.Schema
                                    {
                                        Type = GTypes.Type.OBJECT,
                                        Properties = new Dictionary<string, GTypes.Schema>
                                        {
                                            {
                                                "primary_material_type",
                                                new GTypes.Schema
                                                {
                                                    Type = GTypes.Type.STRING,
                                                    Enum = new List<string>
                                                    {
                                                        "Bubble Wrap", "Moving Blanket", "Cardboard Box", "Shrink Wrap",
                                                        "Wooden Crate", "Mattress Cover"
                                                    }
                                                }
                                            },
                                            { "quantity_estimate", new GTypes.Schema { Type = GTypes.Type.NUMBER } },
                                            {
                                                "unit",
                                                new GTypes.Schema
                                                {
                                                    Type = GTypes.Type.STRING,
                                                    Enum = new List<string> { "Meters", "Units", "Rolls", "Kg" }
                                                }
                                            },
                                            { "packed_volume_m3", new GTypes.Schema { Type = GTypes.Type.NUMBER } }
                                        },
                                        Required = new List<string>
                                            { "primary_material_type", "quantity_estimate", "unit" }
                                    }
                                },
                                {
                                    "logistics", new GTypes.Schema
                                    {
                                        Type = GTypes.Type.OBJECT,
                                        Properties = new Dictionary<string, GTypes.Schema>
                                        {
                                            {
                                                "fragility",
                                                new GTypes.Schema
                                                {
                                                    Type = GTypes.Type.STRING,
                                                    Enum = new List<string> { "Low", "Medium", "High" }
                                                }
                                            },
                                            { "is_stackable", new GTypes.Schema { Type = GTypes.Type.BOOLEAN } },
                                            { "requires_disassembly", new GTypes.Schema { Type = GTypes.Type.BOOLEAN } }
                                        }
                                    }
                                },
                                { "notes", new GTypes.Schema { Type = GTypes.Type.STRING } }
                            }
                        }
                    }
                }
            );

            // The text will be a clean JSON string because of our config
            var jsonResult = response.Candidates?[0].Content?.Parts?[0].Text;
            return Results.Content(jsonResult, "application/json");
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    public async Task<IResult> UploadVideo(string filePath)
    {
        try
        {
            // 1. Upload to Gemini
            var upload = await client.Files.UploadAsync(filePath, new UploadFileConfig
            {
                DisplayName = $"Survey_{DateTime.UtcNow.Ticks}"
            });

            // 2. Wait for Processing (Critical step)
            // You cannot use the URI until state is 'Active'
            var file = upload;
            while (file.State == GTypes.FileState.PROCESSING)
            {
                await Task.Delay(2000);
                file = await client.Files.GetAsync(file.Name);
            }

            return file.State == GTypes.FileState.FAILED
                ? Results.Problem("Video processing failed on Google's side.")
                :
                // 3. Return the URI to the client (app) to store for this session
                Results.Ok(new { FileUri = file.Uri, Expiration = file.ExpirationTime });
        }
        finally
        {
            if (File.Exists(filePath))
                File.Delete(filePath);
        }
    }

    public async Task<List<string>> GetAvailableModels()
    {
        var models = await client.Models.ListAsync();
        var available = new List<string>();
    
        await foreach (var model in models)
        {
            // Filter for "generateContent" capable models
            if (model.SupportedActions?.Contains("generateContent") ?? false)
            {
                available.Add($"{model.Name} ({model.DisplayName})");
            }
        }
        return available;
    }
}