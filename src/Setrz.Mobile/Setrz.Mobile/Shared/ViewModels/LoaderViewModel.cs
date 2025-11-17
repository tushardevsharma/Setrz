using Setrz.Mobile.Shared.Services;

namespace Setrz.Mobile.Shared.ViewModels;

public class LoaderViewModel : BaseViewModel
{
    public bool IsGlobalBusy
    {
        get;
        set => SetField(ref field, value);
    }

    public LoaderViewModel() 
    {
        LoaderService.Instance.IsBusyChanged += OnIsBusyChanged;
        IsGlobalBusy = LoaderService.Instance.IsBusy;
    }

    private void OnIsBusyChanged(bool isBusy)
    {
        // This method runs when the service state changes
        IsGlobalBusy = isBusy;
    }
}