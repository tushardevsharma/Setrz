using Setrz.Mobile.Shared.Services;

namespace Setrz.Mobile.Shared.Constants;

public class UserFacingMessages
{
    public static string DefaultUserSuccessMessage => LocalizationResourceManager.Instance[AppConstants.DefaultUserErrorMessageKey];
    public static string DefaultUserErrorMessage => LocalizationResourceManager.Instance[AppConstants.DefaultUserErrorMessageKey];
    
}