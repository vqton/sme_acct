namespace SmeAccounting.Domain.Interfaces;

public record TokenResult(string AccessToken, string RefreshToken, DateTime ExpiresAt);

public interface ITokenService
{
    TokenResult GenerateTokens(Guid userId, string username, string email, IReadOnlyCollection<string> roles, IReadOnlyCollection<string> permissions);
    string GenerateRefreshToken();
    Guid? ValidateToken(string token);
}
