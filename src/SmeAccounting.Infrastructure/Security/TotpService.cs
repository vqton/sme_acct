using System.Net;
using System.Security.Cryptography;
using System.Text;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.Security;

public sealed class TotpService : ITotpService
{
    public string GenerateSecret()
    {
        var bytes = RandomNumberGenerator.GetBytes(20);
        return Base32Encode(bytes);
    }

    public string GenerateQrCodeUri(string secret, string email, string issuer = "SmeAccounting")
    {
        return $"otpauth://totp/{WebUtility.UrlEncode(issuer)}:{WebUtility.UrlEncode(email)}?secret={secret}&issuer={WebUtility.UrlEncode(issuer)}&algorithm=SHA1&digits=6&period=30";
    }

    public bool ValidateCode(string secret, string code, int timeStepSeconds = 30)
    {
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(code))
            return false;

        var secretBytes = Base32Decode(secret);
        var codeDigits = code.Trim();

        var window = 1;
        var currentTimeStep = DateTime.UtcNow.Ticks / TimeSpan.TicksPerSecond / timeStepSeconds;

        for (var offset = -window; offset <= window; offset++)
        {
            var computedCode = GenerateTotp(secretBytes, currentTimeStep + offset, 6);
            if (TimingSafeEquals(computedCode, codeDigits))
                return true;
        }

        return false;
    }

    private static string GenerateTotp(byte[] secret, long timeStep, int digits = 6)
    {
        var timeBytes = BitConverter.GetBytes(timeStep);
        if (BitConverter.IsLittleEndian)
            Array.Reverse(timeBytes);

#pragma warning disable CA5350 // HMAC-SHA1 required for TOTP (RFC 6238) compat with authenticator apps
        using var hmac = new HMACSHA1(secret);
        var hash = hmac.ComputeHash(timeBytes);
#pragma warning restore CA5350

        var offset = hash[^1] & 0xf;
        var binary = (hash[offset] & 0x7f) << 24
                     | (hash[offset + 1] & 0xff) << 16
                     | (hash[offset + 2] & 0xff) << 8
                     | (hash[offset + 3] & 0xff);

        var otp = binary % (int)Math.Pow(10, digits);
        return otp.ToString(new string('0', digits));
    }

    private static bool TimingSafeEquals(string a, string b)
    {
        if (a.Length != b.Length)
            return false;
        var result = 0;
        for (var i = 0; i < a.Length; i++)
            result |= a[i] ^ b[i];
        return result == 0;
    }

    private static string Base32Encode(byte[] data)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var sb = new StringBuilder();
        for (var i = 0; i < data.Length; i += 5)
        {
            var byteCount = Math.Min(5, data.Length - i);
            var buffer = new byte[8];
            var bitCount = byteCount * 8;
            Array.Copy(data, i, buffer, 0, byteCount);
            for (var j = 0; j < byteCount * 8; j += 5)
            {
                var index = (buffer[j / 8] << (j % 8)) & 0xff;
                if (j / 8 + 1 < byteCount)
                    index |= buffer[j / 8 + 1] >> (8 - j % 8);
                sb.Append(chars[(index >> 3) & 0x1f]);
            }
        }
        return sb.ToString();
    }

    private static byte[] Base32Decode(string input)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        input = input.ToUpperInvariant().TrimEnd('=');
        var bytes = new List<byte>();
        var buffer = 0;
        var bitsLeft = 0;
        foreach (var c in input)
        {
            var index = chars.IndexOf(c);
            if (index < 0) continue;
            buffer = (buffer << 5) | index;
            bitsLeft += 5;
            if (bitsLeft >= 8)
            {
                bitsLeft -= 8;
                bytes.Add((byte)(buffer >> bitsLeft));
            }
        }
        return bytes.ToArray();
    }
}
