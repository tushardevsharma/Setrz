using AnalyzeVideo;
using Google.GenAI;
using Microsoft.AspNetCore.Http.Features;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Increase the limit for Kestrel (e.g., to 500MB)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 524288000; // 500 * 1024 * 1024 bytes
});

// Also increase the Multipart Form limit (internal .NET buffering)
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 524288000; 
});

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// App services
builder.Services.AddSingleton<Client>();
builder.Services.AddSingleton<GeminiInventoryService>();
builder.Services.AddSingleton<GeminiHealthService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // Map the Scalar API reference UI
    app.MapScalarApiReference();
    // Optional: Automatically redirect to the Scalar UI on launch
    app.MapGet("/", () => Results.Redirect("/scalar"));
}

app.UseHttpsRedirection();

app.MapPost("/api/survey/upload", UploadVideo).DisableAntiforgery().WithTags("AISurvey");
app.MapPost("/api/survey/analyze", AnalyzeVideo).WithTags("AISurvey");

app.MapPost("/api/gemini/health", CheckGeminiHealth).WithTags("Debug");
app.MapGet("/api/debug/models", async (GeminiInventoryService service) => await service.GetAvailableModels()).WithTags("Debug");

app.Run();

async Task<IResult> UploadVideo(IFormFile? videoFile, GeminiInventoryService service)
{
    if (videoFile == null) 
        return Results.BadRequest("No file.");

    var tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.mp4");
    
    await using (var stream = new FileStream(tempPath, FileMode.Create))
    {
        await videoFile.CopyToAsync(stream);
    }

    return await service.UploadVideo(tempPath);
}

async Task<IResult> AnalyzeVideo(AnalyzeRequest request, GeminiInventoryService service)
{
    return await service.AnalyzeHomeVideo(request);
}

async Task<string?> CheckGeminiHealth(GeminiHealthService service)
{
    return await service.CheckHealth();
}