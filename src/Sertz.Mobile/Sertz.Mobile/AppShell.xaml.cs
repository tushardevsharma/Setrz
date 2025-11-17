using Sertz.Mobile.Features.Onboarding;

namespace Sertz.Mobile;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();
        Routing.RegisterRoute(nameof(StartingView), typeof(StartingView));
        Routing.RegisterRoute(nameof(OtpVerificationView), typeof(OtpVerificationView));
        
    }
}