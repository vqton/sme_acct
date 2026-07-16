using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.Security;

public class JwtTokenService : ITokenService
{
    private readonly string _issuer;
    private readonly string _audience;
    private readonly SymmetricSecurityKey _signingKey;
    private readonly int _accessTokenExpiryMinutes;
    private readonly int _refreshTokenExpiryDays;

    public JwtTokenService(IConfiguration configuration)
    {
        var secret = configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret not configured");
        _issuer = configuration["Jwt:Issuer"] ?? "SmeAccounting";
        _audience = configuration["Jwt:Audience"] ?? "SmeAccounting";
        _signingKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(secret));
        _accessTokenExpiryMinutes = int.TryParse(configuration["Jwt:AccessTokenExpiryMinutes"], out var a) ? a : 15;
        _refreshTokenExpiryDays = int.TryParse(configuration["Jwt:RefreshTokenExpiryDays"], out var r) ? r : 7;
    }

    public TokenResult GenerateTokens(Guid userId, string username, string email, IReadOnlyCollection<string> roles, IReadOnlyCollection<string> permissions)
    {
        var jwtId = Guid.NewGuid().ToString();
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, jwtId),
            new("username", username)
        };

        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
        claims.AddRange(permissions.Select(p => new Claim("permission", p)));

        var expiresAt = DateTime.UtcNow.AddMinutes(_accessTokenExpiryMinutes);
        var token = new JwtSecurityToken(
            _issuer, _audience, claims,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256)
        );

        return new TokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            GenerateRefreshToken(),
            expiresAt
        );
    }

    public string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }

    public Guid? ValidateToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var result = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _signingKey,
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);
            var sub = result.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            return sub != null ? Guid.Parse(sub) : null;
        }
        catch
        {
            return null;
        }
    }
}
