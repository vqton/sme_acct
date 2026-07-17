namespace SmeAccounting.Domain.Interfaces;

public interface ITotpService
{
    string GenerateSecret();
    string GenerateQrCodeUri(string secret, string email, string issuer = "SmeAccounting");
    bool ValidateCode(string secret, string code, int timeStepSeconds = 30);
}
