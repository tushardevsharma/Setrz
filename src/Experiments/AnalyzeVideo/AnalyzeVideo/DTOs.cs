namespace AnalyzeVideo;

public record AnalyzeRequest(string FileUri);
public record VideoUploadRequest(IFormFile? VideoFile, string? CustomName);