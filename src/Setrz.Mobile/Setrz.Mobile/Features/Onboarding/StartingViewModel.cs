using System.Diagnostics;
using Setrz.Mobile.Shared.Services;
using Setrz.Mobile.Shared.ViewModels;

namespace Setrz.Mobile.Features.Onboarding;

public class StartingViewModel : BaseViewModel
{
    private readonly AuthService _authService;

    public string? PhoneNumber
    {
        get;
        set => SetField(ref field, value);
    }
    
    public Command OnNextCommand { get; }
    public Command SocialLoginCommand { get; }

    public StartingViewModel(AuthService authService)
    {
        _authService = authService;
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

        await Task.Run(() => RequestForOtp());
        await Shell.Current.GoToAsync($"{nameof(OtpVerificationView)}?{nameof(OtpVerificationViewModel.PhoneNumber)}={PhoneNumber}");
    }

    private void SocialLogin(string provider)
    {
        Debug.WriteLine($"Attempting login with {provider}");
    }

    private async Task RequestForOtp()
    {
        if (!CanGoNext())
            return;
        
        var a = await _authService.RequestForOtp(this.PhoneNumber!); // TODO - implement generic error framework; show errors in a consistent fashion
    }
}