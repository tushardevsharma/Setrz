namespace Setrz.Mobile.Features.Onboarding;

public partial class OtpVerificationView : ContentPage
{
    public OtpVerificationView(OtpVerificationViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}