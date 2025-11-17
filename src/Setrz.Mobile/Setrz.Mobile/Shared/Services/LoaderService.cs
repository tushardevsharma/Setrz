namespace Setrz.Mobile.Shared.Services;

public class LoaderService
{
    private int _requestCount = 0;
    
    private static readonly Lazy<LoaderService> _instance = 
        new Lazy<LoaderService>(() => new LoaderService());

    public static LoaderService Instance => _instance.Value;
    
    public event Action<bool>? IsBusyChanged;
    
    public bool IsBusy
    {
        get;
        private set
        {
            if (field != value)
            {
                field = value;
                IsBusyChanged?.Invoke(field);
            }
        }
    }

    /// <summary>
    /// Call this method before starting an API call.
    /// Increments the request counter and sets IsBusy to true.
    /// </summary>
    public void ShowLoading()
    {
        // Use a counter to prevent flashing when multiple requests are simultaneous
        _requestCount++;
        IsBusy = true;
    }

    /// <summary>
    /// Call this method after an API call has completed (success or failure).
    /// Decrements the counter and sets IsBusy to false only when the counter reaches zero.
    /// </summary>
    public void HideLoading()
    {
        _requestCount = Math.Max(0, _requestCount - 1);
        if (_requestCount == 0)
        {
            IsBusy = false;
        }
    }
}