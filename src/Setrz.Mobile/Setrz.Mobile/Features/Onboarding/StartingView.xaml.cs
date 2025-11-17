using Setrz.Mobile.Shared.Views;

namespace Setrz.Mobile.Features.Onboarding;

public partial class StartingView : ContentPage
{
    public StartingView(StartingViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}