using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Infrastructure.Security;

namespace SmeAccounting.IntegrationTests.Security;

public class PasswordHasherTests
{
    private readonly IPasswordHasher _sut = new PasswordHasher();

    [Fact]
    public void Hash_ReturnsNonNull()
    {
        var hash = _sut.Hash("test-password");
        hash.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void Hash_ContainsThreeParts()
    {
        var hash = _sut.Hash("test-password");
        var parts = hash.Split('.');
        parts.Should().HaveCount(3);
    }

    [Fact]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        var hash = _sut.Hash("correct-password");
        _sut.Verify("correct-password", hash).Should().BeTrue();
    }

    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        var hash = _sut.Hash("correct-password");
        _sut.Verify("wrong-password", hash).Should().BeFalse();
    }

    [Fact]
    public void Verify_InvalidFormatHash_ReturnsFalse()
    {
        _sut.Verify("password", "not-a-valid-hash").Should().BeFalse();
    }

    [Fact]
    public void Hash_UniquePerCall()
    {
        var hash1 = _sut.Hash("same-password");
        var hash2 = _sut.Hash("same-password");
        hash1.Should().NotBe(hash2);
    }

    [Fact]
    public void NeedsRehash_LowerIterations_ReturnsTrue()
    {
        var hash = _sut.Hash("password");
        var parts = hash.Split('.');
        var lowIterHash = $"{parts[0]}.{parts[1]}.1000";
        _sut.NeedsRehash(lowIterHash).Should().BeTrue();
    }

    [Fact]
    public void NeedsRehash_CurrentIterations_ReturnsFalse()
    {
        var hash = _sut.Hash("password");
        _sut.NeedsRehash(hash).Should().BeFalse();
    }

    [Fact]
    public void NeedsRehash_InvalidFormat_ReturnsTrue()
    {
        _sut.NeedsRehash("bad-format").Should().BeTrue();
    }
}
