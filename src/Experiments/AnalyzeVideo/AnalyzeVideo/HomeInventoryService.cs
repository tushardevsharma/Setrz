using Google.GenAI;
using Google.GenAI.Types;
using File = System.IO.File;
using GTypes = Google.GenAI.Types;

namespace AnalyzeVideo;

public class HomeInventoryService
{
    private readonly string _prompt = """

                                      Role: You are a Professional Senior Logistics Surveyor and Spatial Reasoning Agent.
                                      Task: Analyze the provided video to extract precise 3D dimensions and physical attributes of all inventory for moving truck volume and packaging material planning.

                                      ### CRITICAL INSTRUCTIONS:
                                      1. SPATIAL GROUNDING: Use standard architectural references visible in the video as your 'Ground Truth' for scale. 
                                         - Standard Door Height: 203cm
                                         - Power Outlet Height: 30cm from floor
                                         - Standard Kitchen Counter Height: 90cm
                                         - Floor tiles (if visible): Assume 30x30cm or 60x60cm unless otherwise clear.
                                         Compare every object to these anchors before estimating dimensions.

                                      2. GEOMETRICAL ANALYSIS: Calculate Length, Width, and Height (L x W x H) in cm. For non-cuboid items, provide the 'Bounding Box' volume (the space required to box the item).

                                      3. LOGISTICS ATTRIBUTES:
                                         - Fragility: (Low/Medium/High)
                                         - Stackability: Can other boxes be placed on top of this item? (Boolean)
                                         - Disassembly Required: Does it need a hex key or screwdriver? (Boolean)
                                         - Packing Needs: Recommend specific materials (e.g., 'Double-walled box', 'Bubble wrap', 'TV Crate', 'Moving Blankets').

                                      4. CHAIN-OF-THOUGHT: For each item, internally calculate its volume in cubic meters (m³) before finalizing the JSON output.

                                      5. Listen to the audio. If the user mentions concerns, high value, or special handling instructions for an item, include those in the 'notes' field and set 'fragility' to 'High'.
                                      
                                      ### OUTPUT FORMAT: Return strictly valid JSON as an array of objects.

                                      """;

    public async Task<IResult> AnalyzeHomeVideo(string filePath)
    {
        try
        {
            var client = new Client();

            // 2. Upload to Gemini File API (required for high-accuracy video processing)
            var uploadResult = await client.Files.UploadAsync(filePath, new UploadFileConfig
            {
                DisplayName = "Moving_Survey_PoC"
            });

            // 3. Wait for processing (Video is sampled and indexed by Gemini)
            var file = uploadResult;
            while (file.State == FileState.PROCESSING)
            {
                await Task.Delay(2000);
                file = await client.Files.GetAsync(file.Name);
            }

            if (file.State == FileState.FAILED) return Results.Problem("Video processing failed.");

            // 4. Generate Structured Inventory
            // Gemini 2.0/3.0 Flash is faster and highly accurate for spatial tasks.
            var response = await client.Models.GenerateContentAsync(
                model: "gemini-2.0-flash-lite",
                contents: new List<Content>
                {
                    new Content
                    {
                        Parts = new List<Part>
                        {
                            new() { Text = _prompt },
                            new() { FileData = new FileData { FileUri = file.Uri, MimeType = "video/mp4" } }
                        }
                    }
                },
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
                                    "dimensions", new Schema
                                    {
                                        Type = GTypes.Type.OBJECT,
                                        Properties = new Dictionary<string, Schema>
                                        {
                                            { "length_cm", new Schema { Type = GTypes.Type.NUMBER } },
                                            { "width_cm", new Schema { Type = GTypes.Type.NUMBER } },
                                            { "height_cm", new Schema { Type = GTypes.Type.NUMBER } },
                                            { "unit", new Schema { Type = GTypes.Type.STRING } }
                                        },
                                        Required = new List<string> { "length_cm", "width_cm", "height_cm" }
                                    }
                                },
                                {
                                    "fragility",
                                    new Schema { Type = GTypes.Type.STRING, Enum = ["Low", "Medium", "High"] }
                                },
                                { "notes", new Schema { Type = GTypes.Type.STRING } }
                            }
                        }
                    }
                }
            );

            // Clean up: delete file from Google's temporary storage (Optional, stays 48h otherwise)
            await client.Files.DeleteAsync(file.Name);

            // The text will be a clean JSON string because of our config
            var jsonResult = response.Candidates?[0].Content?.Parts?[0].Text;
            return Results.Content(jsonResult, "application/json");
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
        finally
        {
            if (File.Exists(filePath))
                File.Delete(filePath);
        }
    }
}