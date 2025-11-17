namespace Setrz.Mobile;

public partial class App : Application
{
    public App()
    {
        InitializeComponent();
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        var window = new Window(new AppShell());

#if WINDOWS || MACCATALYST
        window.Height = window.MinimumHeight = window.MaximumHeight = 600;
        window.Width = window.MinimumWidth = window.MaximumWidth = 400;
#endif
        return window;
    }
}