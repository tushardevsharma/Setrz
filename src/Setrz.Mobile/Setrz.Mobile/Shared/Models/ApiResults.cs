using System.Net;

namespace Setrz.Mobile.Shared.Models;

/// <summary>
/// Encapsulates the result of an API call.
/// </summary>
/// <typeparam name="T">The expected data type on success.</typeparam>
public record ApiResult<T>(
    bool IsSuccess, 
    T Data, 
    string? Message = null, 
    HttpStatusCode? StatusCode = null);

public static class ApiResultExt
{
    public static string? ToUserMessage<T>(this ApiResult<T> apiResult) => apiResult.Message; // TODO - fetch this from resource file
}

