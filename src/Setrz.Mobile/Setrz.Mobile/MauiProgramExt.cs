using Setrz.Mobile.Features.Onboarding;
using Setrz.Mobile.Shared.Services;

namespace Setrz.Mobile;

public static class MauiProgramExt
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddViewModels()
        {
            services.AddSingleton<StartingViewModel>();
            services.AddSingleton<OtpVerificationViewModel>();
            return services;
        }

        public IServiceCollection AddFoundationalServices()
        {
            services.AddHttpClient<RestApiService>(client =>
            {
                client.BaseAddress = new Uri("https://your-api-domain.com/api/"); // TODO - move to config
                client.Timeout = TimeSpan.FromSeconds(30); 
            });
        
            services.AddSingleton<AuthService>();
            return services;
        }
    }
}