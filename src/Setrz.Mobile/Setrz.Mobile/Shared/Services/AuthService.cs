using Setrz.Mobile.Shared.Constants;
using Setrz.Mobile.Shared.Models;

namespace Setrz.Mobile.Shared.Services;

public class AuthService(RestApiService apiService)
{
    public async Task<UserResult> RequestForOtp(string phoneNumber)
    {
        var otpRequestEndPoint = "api/v1/otp";
        
        var response = await apiService.GetAsync<bool>(otpRequestEndPoint);

        return response.IsSuccess
            ? this.Success(response.ToUserMessage() ?? UserFacingMessages.DefaultUserSuccessMessage)
            : this.Failed(response.ToUserMessage() ?? UserFacingMessages.DefaultUserErrorMessage);
    }
}