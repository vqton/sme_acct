namespace SmeAccounting.Application.Security.Common;

public record LoginRequest(string Username, string Password, string? DeviceInfo = null, string? IpAddress = null);
public record RefreshTokenRequest(string AccessToken, string RefreshToken);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record TokenResponse(string AccessToken, string RefreshToken, DateTime ExpiresAt);
public record UserDto(Guid Id, string Username, string Email, string FirstName, string LastName, bool IsActive, List<string> Roles, HashSet<string> Permissions);
public record LoginResultDto(bool Success, TokenResponse? Tokens, string? Error, bool RequiresMfa);
