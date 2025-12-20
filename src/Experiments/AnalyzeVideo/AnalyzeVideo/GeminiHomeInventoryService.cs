using Google.GenAI;
using Google.GenAI.Types;
using File = System.IO.File;
using GTypes = Google.GenAI.Types;

namespace AnalyzeVideo;

public class GeminiHomeInventoryService(Client client)
{
    private static readonly string GeminiModel = "gemini-flash-latest";

    private static readonly string GeminiPrompt = """

                                                  Role: You are an expert Relocation Surveyor and Packaging Logistics Agent.
                                                  Task: Analyze the video and audio to generate a precise "Bill of Materials" and inventory list for a premium home move.

                                                  ### CRITICAL INSTRUCTIONS:

                                                  1. TEMPORAL GROUNDING (NEW):
                                                  - For every distinct item identified, capture the precise timestamp range during which the item is clearly visible and being analyzed.
                                                  - Start Time: The moment the item first enters the frame or becomes the focus.
                                                  - End Time: The moment the item leaves the frame or the camera moves away.
                                                  - Format: Use "MM:SS" (Minutes:Seconds).
                                                  
                                                  2. SPATIAL GROUNDING & DIMENSIONS: 
                                                     - Use architectural anchors (Door=203cm, Counter=90cm, Tiles=60cm) to estimate real-world scale.
                                                     - Output exact bounding box dimensions (Length x Width x Height) in cm.
                                                     - If an object is irregular (e.g., an L-shaped sofa), calculate the volume of the space it effectively occupies in a truck.

                                                  3. GEOMETRICAL ANALYSIS: Calculate Length, Width, and Height (L x W x H) in cm. For non-cuboid items, provide the 'Bounding Box' volume (the space required to box the item).

                                                  4. PACKAGING MATERIAL LOGIC:
                                                     Estimate the exact materials required to pack each item safely. Use these rules:
                                                     - Furniture (Sofas/Chairs): Recommend 'Moving Blankets' & 'Shrink Wrap'.
                                                       * Logic: 1 Blanket per 1.5m of surface area.
                                                     - Fragile (Glass/TVs/Monitors): Recommend 'Bubble Wrap' & 'Corrugated Sheet' or 'Crate'.
                                                       * Logic: Wrap length = (2 * (Length + Width)) * 3 layers.
                                                     - Small/Loose Items (Books/Utensils): Recommend 'Cardboard Box (M)' or 'Cardboard Box (L)'.
                                                     - Mattresses: Recommend 'Mattress Cover'.

                                                  5. AUDIO ANALYSIS:
                                                     - Listen for user voice cues. If the user says "This is antique," "Be careful," or "Expensive," mark 'fragility' as 'High' and add a note.

                                                  6. LOGISTICS ATTRIBUTES:
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
                    ResponseSchema = new Schema
                    {
                        Type = GTypes.Type.ARRAY,
                        Items = new Schema
                        {
                            Type = GTypes.Type.OBJECT,
                            Properties = new Dictionary<string, Schema>
                            {
                                { "item", new Schema { Type = GTypes.Type.STRING } },
                                {
                                    "timestamp_start",
                                    new Schema
                                    {
                                        Type = GTypes.Type.STRING, Description = "Start time of item visibility (MM:SS)"
                                    }
                                },
                                {
                                    "timestamp_end",
                                    new Schema
                                    {
                                        Type = GTypes.Type.STRING, Description = "End time of item visibility (MM:SS)"
                                    }
                                },
                                {
                                    "dimensions", new Schema
                                    {
                                        Type = GTypes.Type.OBJECT,
                                        Properties = new Dictionary<string, Schema>
                                        {
                                            { "length_cm", new Schema { Type = GTypes.Type.NUMBER } },
                                            { "width_cm", new Schema { Type = GTypes.Type.NUMBER } },
                                            { "height_cm", new Schema { Type = GTypes.Type.NUMBER } }
                                        }
                                    }
                                },
                                {
                                    "packaging", new Schema
                                    {
                                        Type = GTypes.Type.OBJECT,
                                        Properties = new Dictionary<string, Schema>
                                        {
                                            {
                                                "primary_material_type",
                                                new Schema
                                                {
                                                    Type = GTypes.Type.STRING,
                                                    Enum =
                                                    [
                                                        "Bubble Wrap", "Moving Blanket", "Cardboard Box", "Shrink Wrap",
                                                        "Wooden Crate", "Mattress Cover"
                                                    ]
                                                }
                                            },
                                            { "quantity_estimate", new Schema { Type = GTypes.Type.NUMBER } },
                                            {
                                                "unit",
                                                new Schema
                                                {
                                                    Type = GTypes.Type.STRING,
                                                    Enum = ["Meters", "Units", "Rolls", "Kg"]
                                                }
                                            },
                                            { "packed_volume_m3", new Schema { Type = GTypes.Type.NUMBER } }
                                        },
                                        Required = ["primary_material_type", "quantity_estimate", "unit"]
                                    }
                                },
                                {
                                    "logistics", new Schema
                                    {
                                        Type = GTypes.Type.OBJECT,
                                        Properties = new Dictionary<string, Schema>
                                        {
                                            {
                                                "fragility",
                                                new Schema
                                                {
                                                    Type = GTypes.Type.STRING,
                                                    Enum = ["Low", "Medium", "High"]
                                                }
                                            },
                                            { "is_stackable", new Schema { Type = GTypes.Type.BOOLEAN } },
                                            { "requires_disassembly", new Schema { Type = GTypes.Type.BOOLEAN } }
                                        }
                                    }
                                },
                                { "notes", new Schema { Type = GTypes.Type.STRING } }
                            },
                            Required = ["item", "timestamp_start", "timestamp_end", "dimensions", "packaging", "logistics"]
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

    public async Task<IResult> UploadVideo(string filePath, string fileDisplayName)
    {
        try
        {
            // 1. Upload to Gemini
            var upload = await client.Files.UploadAsync(filePath, new UploadFileConfig
            {
                DisplayName = $"{fileDisplayName}_{DateTime.UtcNow.Ticks}"
            });

            // 2. Wait for Processing (Critical step)
            // You cannot use the URI until state is 'Active'
            var file = upload;
            while (file.State == FileState.PROCESSING)
            {
                await Task.Delay(2000);
                file = await client.Files.GetAsync(file.Name!);
            }

            return file.State == FileState.FAILED
                ? Results.Problem("Video processing failed on Google's side.")
                :
                // 3. Return the URI to the client (app) to store for this session
                Results.Ok(new { FildId = file.Name, FileUri = file.Uri, Expiration = file.ExpirationTime });
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
    
    public async Task<IResult> FindFile(string? uri = null)
    {
        var allFiles = await client.Files.ListAsync(new ListFilesConfig { PageSize = 20 });

        if (string.IsNullOrEmpty(uri))
        {
            var results = new List<object>();
            await foreach (var file in allFiles)
            {
                results.Add(new
                {
                    Id = file.Name,
                    DisplayName = file.DisplayName,
                    State = file.State.ToString(),
                    Uri = file.Uri,
                    Expires = file.ExpirationTime
                });
            }

            return Results.Ok(results);
        }
    
        await foreach (var file in allFiles)
        {
            if (string.Equals(file.Uri, uri, StringComparison.OrdinalIgnoreCase))
            {
                return Results.Ok(new
                {
                    Id = file.Name,
                    DisplayName = file.DisplayName,
                    Uri = file.Uri,
                    State = file.State.ToString(),
                    Created = file.CreateTime,
                    Expires = file.ExpirationTime
                });
            }
        }

        return Results.NotFound(new { Message = "File with that URI was not found (it may have expired)." });
    }
}