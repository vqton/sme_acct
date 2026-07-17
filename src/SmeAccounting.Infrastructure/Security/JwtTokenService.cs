using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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

    public JwtTokenService(IConfiguration configuration, ILogger<JwtTokenService> logger)
    {
        var secret = configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret not configured");
        _issuer = configuration["Jwt:Issuer"] ?? "SmeAccounting";
        _audience = configuration["Jwt:Audience"] ?? "SmeAccounting";
        _signingKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(secret));
        _accessTokenExpiryMinutes = int.TryParse(configuration["Jwt:AccessTokenExpiryMinutes"], out var a) ? a : 15;
        _refreshTokenExpiryDays = int.TryParse(configuration["Jwt:RefreshTokenExpiryDays"], out var r) ? r : 7;
        _logger = logger;
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
        var refreshExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenExpiryDays);
        var token = new JwtSecurityToken(
            _issuer, _audience, claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256)
        );

        return new TokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            GenerateRefreshToken(),
            expiresAt,
            refreshExpiresAt
        );
    }

    public string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }

    private readonly ILogger<JwtTokenService> _logger;

    public Guid? ValidateToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            handler.InboundClaimTypeMap.Clear();
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
            if (sub is null)
            {
                var allClaims = string.Join(", ", result.Claims.Select(c => $"'{c.Type}'='{c.Value}'"));
                _logger.LogWarning("No 'sub' claim found. Available claims: {Claims}", allClaims);
            }
            return sub != null ? Guid.Parse(sub) : null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "JWT validation failed for token: {TokenPrefix}", token[..Math.Min(50, token.Length)]);
            return null;
        }
    }
}
