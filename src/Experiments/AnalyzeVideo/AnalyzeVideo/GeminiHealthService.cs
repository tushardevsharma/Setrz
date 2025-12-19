using Google.GenAI;
using Google.GenAI.Types;

namespace AnalyzeVideo;

public class GeminiHealthService
{
    public async Task<string?> CheckHealth()
    {
        try
        {
            var client = new Client();

            var response = await client.Models.GenerateContentAsync(
                model: "gemini-2.5-flash",
                contents:
                [
                    new Content()
                    {
                        Parts = [new() { Text = "Just checking if you can hear me through the API?" }]
                    }
                ]);
        
            return response.Candidates?[0].Content?.Parts?[0].Text;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    private static async Task CheckModels(Client client)
    {
        var models = await client.Models.ListAsync();

        await foreach (var model in models)
        {
            Console.WriteLine(model.Name);
        }
    }
}