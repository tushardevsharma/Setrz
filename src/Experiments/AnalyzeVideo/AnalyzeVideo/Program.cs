using AnalyzeVideo;
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
builder.Services.AddSingleton<HomeInventoryService>();

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

app.MapPost("/api/survey/analyze", AnalyzeVideo).DisableAntiforgery();

app.Run();

static async Task<IResult> AnalyzeVideo(IFormFile? videoFile, HomeInventoryService service)
{
    if (videoFile is null || videoFile.Length == 0)
        return Results.BadRequest("Video file is missing.");

    // 1. Save locally temporarily to upload to Gemini File API
    var tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}_{videoFile.FileName}");
    await using (var stream = new FileStream(tempPath, FileMode.Create))
    {
        await videoFile.CopyToAsync(stream);
    }

    return await service.AnalyzeHomeVideo(tempPath);
}