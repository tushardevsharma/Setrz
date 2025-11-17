using Setrz.Mobile.Shared.ViewModels;

namespace Setrz.Mobile.Features.Onboarding;

[QueryProperty(nameof(PhoneNumber), nameof(PhoneNumber))]
public class OtpVerificationViewModel : BaseViewModel
{
    public string? DisplayPhoneNumber
    {
        get;
        set => SetField(ref field, value);
    }
    
    public string? PhoneNumber
    {
        get;
        set
        {
            if (SetField(ref field, value))
            {
                DisplayPhoneNumber = MaskPhoneNumber(value);
                VerificationMessage = $"A 6-digit code has been sent to {DisplayPhoneNumber}";
            }
        }
    }
    
    public string? VerificationMessage
    {
        get;
        set => SetField(ref field, value);
    }
    
    public string? OtpCode
    {
        get;
        set => SetField(ref field, value);
    }
    
    public Command VerifyOtpCommand { get; }
    public Command ResendOtpCommand { get; }

    public OtpVerificationViewModel()
    {
        VerifyOtpCommand = new Command(VerifyOtpAsync, CanExecuteVerifyOtp);
        ResendOtpCommand = new Command(ResendOtpAsync);
        RegisterCanExecuteChanged(nameof(OtpCode), VerifyOtpCommand);
    }
    
    private bool CanExecuteVerifyOtp()
    {
        return !string.IsNullOrWhiteSpace(OtpCode) && OtpCode.Length == 6;
    }

    private async void VerifyOtpAsync()
    {
        
        if (OtpCode == "123456") // Placeholder logic
        {
            await Shell.Current.DisplayAlertAsync("Success", "Verification successful! Proceeding to home page or registration page", "OK");
            // Successful verification -> Navigate to the next screen (QuotePage)
            await Shell.Current.GoToAsync($"{nameof(StartingView)}");
        }
        else
        {
            await Shell.Current.DisplayAlertAsync("Error", "Invalid OTP. Please try again.", "OK");
        }
    }

    private async void ResendOtpAsync()
    {
        await Shell.Current.DisplayAlertAsync("Resend", $"Resending OTP to {PhoneNumber}.", "OK");
        // Business Logic: Call service to resend the code
    }
    
    private string MaskPhoneNumber(string number)
    {
        if (string.IsNullOrEmpty(number) || number.Length <= 4)
        {
            return number;
        }
        
        string start = number.Substring(0, 2);
        string end = number.Substring(number.Length - 2);
        
        int maskLength = number.Length - 4;
        
        return $"{start}{new string('*', maskLength)}{end}";
    }
}