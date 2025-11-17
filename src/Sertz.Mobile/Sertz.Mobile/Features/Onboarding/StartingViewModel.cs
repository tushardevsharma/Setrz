using System.Diagnostics;
using Sertz.Mobile.Shared.ViewModels;

namespace Sertz.Mobile.Features.Onboarding;

public class StartingViewModel : BaseViewModel
{
    public string? PhoneNumber
    {
        get;
        set => SetField(ref field, value);
    }
    
    public Command OnNextCommand { get; }
    public Command SocialLoginCommand { get; }

    public StartingViewModel()
    {
        OnNextCommand = new Command(OnNextAsync, CanGoNext);
        SocialLoginCommand = new Command<string>(SocialLogin);
        
        RegisterCanExecuteChanged(nameof(PhoneNumber), OnNextCommand);
    }
    
    private bool CanGoNext()
    {
        return !string.IsNullOrWhiteSpace(PhoneNumber) && PhoneNumber.Length >= 10;
    }

    private async void OnNextAsync()
    {
        if (!CanGoNext())
            return;
        
        await Shell.Current.GoToAsync($"{nameof(OtpVerificationView)}?{nameof(OtpVerificationViewModel.PhoneNumber)}={PhoneNumber}");
    }

    private void SocialLogin(string provider)
    {
        Debug.WriteLine($"Attempting login with {provider}");
    }
}