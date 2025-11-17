using System.Net;
using System.Text;
using System.Text.Json;
using Setrz.Mobile.Shared.Models;

namespace Setrz.Mobile.Shared.Services;

public class RestApiService(HttpClient httpClient)
{
    private readonly JsonSerializerOptions _jsonSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    // Injected by DI: HttpClient (from IHttpClientFactory) and LoadingService (Singleton)
    // Configure JSON serialization globally (e.g., camelCase for web APIs)

    // --- Core Generic HTTP Executor ---
    
    private async Task<ApiResult<TResult>> SendAsync<TData, TResult>(
        HttpMethod method, 
        string endpoint, 
        TData? data = default)
    {
        // 1. Encapsulate Loader Logic
        LoaderService.Instance.ShowLoading();

        try
        {
            
#if DEBUG
            await Task.Delay(2_000);
            return DateTime.Now.Microsecond % 2 == 0
                ? new ApiResult<TResult>(false, default!, StatusCode: HttpStatusCode.BadGateway)
                : new ApiResult<TResult>(true, default!, StatusCode: HttpStatusCode.Created);
#endif
            // Build the HttpRequestMessage
            using var request = new HttpRequestMessage(method, endpoint);

            // Add content for POST/PUT/DELETE
            if (data != null && (method == HttpMethod.Post || method == HttpMethod.Put))
            {
                var json = JsonSerializer.Serialize(data, _jsonSerializerOptions);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }
            
            // 2. Execute the Request
            using var response = await httpClient.SendAsync(request);

            // 3. Handle Success (2xx status codes)
            if (response.IsSuccessStatusCode)
            {
                TResult resultData = default;

                // Attempt to deserialize content if status is not No Content (204)
                if (response.StatusCode != HttpStatusCode.NoContent)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    if (!string.IsNullOrWhiteSpace(content))
                    {
                        resultData = JsonSerializer.Deserialize<TResult>(content, _jsonSerializerOptions);
                    }
                }
                
                return new ApiResult<TResult>(true, resultData, StatusCode: response.StatusCode);
            }
            
            // 4. Handle Failure (4xx/5xx status codes)
            var errorContent = await response.Content.ReadAsStringAsync();
            return new ApiResult<TResult>(
                false, 
                default, 
                $"API Error: {response.StatusCode}. Details: {errorContent}", 
                response.StatusCode);
        }
        catch (HttpRequestException httpEx)
        {
            // Handle network/timeout/DNS resolution errors
            return new ApiResult<TResult>(
                false, 
                default, 
                $"Network/Client Error: {httpEx.Message}");
        }
        catch (Exception ex)
        {
            // Handle serialization/unexpected errors
            return new ApiResult<TResult>(
                false, 
                default, 
                $"An unexpected error occurred: {ex.Message}");
        }
        finally
        {
            // 5. Encapsulate Loader Hiding
            LoaderService.Instance.HideLoading();
        }
    }

    // --- Public Generic CRUD Methods ---

    public Task<ApiResult<TResult>> GetAsync<TResult>(string endpoint) => 
        SendAsync<object, TResult>(HttpMethod.Get, endpoint);

    public Task<ApiResult<TResult>> PostAsync<TData, TResult>(string endpoint, TData data) => 
        SendAsync<TData, TResult>(HttpMethod.Post, endpoint, data);

    public Task<ApiResult<TResult>> PutAsync<TData, TResult>(string endpoint, TData data) => 
        SendAsync<TData, TResult>(HttpMethod.Put, endpoint, data);

    public Task<ApiResult<TResult>> DeleteAsync<TResult>(string endpoint) => 
        SendAsync<object, TResult>(HttpMethod.Delete, endpoint);
    
    // For DELETE operations that don't return content, use this overload
    public Task<ApiResult<bool>> DeleteAsync(string endpoint) => 
        SendAsync<object, bool>(HttpMethod.Delete, endpoint);
}