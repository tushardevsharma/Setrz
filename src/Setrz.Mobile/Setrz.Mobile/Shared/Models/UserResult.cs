namespace Setrz.Mobile.Shared.Models;

public record UserResult<T>(T? Data, string? Message = null)
{
    public UserResult(string Message, T? Data = default) : this(Data!, Message) {}
}

public record UserResult(string Message);

public static class UserResultExt
{
    public static UserResult Success<T>(this T source, string message) => new(message);
    public static UserResult Failed<T>(this T source, string errorMessage) => new(errorMessage);
}