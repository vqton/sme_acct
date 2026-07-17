using MediatR;
using Microsoft.EntityFrameworkCore;
using SmeAccounting.Application.Security.Commands.Login;
using SmeAccounting.Application.Security.Common;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Security;
using SmeAccounting.Infrastructure.Persistence;
using SmeAccounting.Infrastructure.Security;

namespace SmeAccounting.IntegrationTests.Security;

public sealed class LoginCommandHandlerTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICompanyPasswordPolicyRepository _policyRepo;
    private readonly IRequestHandler<LoginCommand, Result<TokenResponse>> _handler;

    public LoginCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite($"DataSource={Guid.NewGuid()}.db")
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _dbContext.Database.EnsureCreated();

        _userRepo = Substitute.For<IUserRepository>();
        _roleRepo = Substitute.For<IRoleRepository>();
        _tokenService = Substitute.For<ITokenService>();
        _passwordHasher = new PasswordHasher();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _policyRepo = Substitute.For<ICompanyPasswordPolicyRepository>();

        _handler = new LoginCommandHandler(_userRepo, _roleRepo, _tokenService, _passwordHasher, _unitOfWork, _policyRepo);
    }

    [Fact]
    public async Task Handle_InvalidUsername_ReturnsFail()
    {
        _userRepo.GetByUsernameAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())!.Returns((User?)null);

        var result = await _handler.Handle(new LoginCommand("nonexistent", "password"), default);

        result.IsFailed.Should().BeTrue();
        result.Errors.First().Message.Should().Be("Invalid username or password.");
    }

    [Fact]
    public async Task Handle_InactiveUser_ReturnsGenericError()
    {
        var user = new User("inactive", "inactive@test.com", _passwordHasher.Hash("password"), "In", "Active", Guid.NewGuid());
        user.Disable();
        _userRepo.GetByUsernameAsync("inactive", Arg.Any<CancellationToken>())!.Returns(user);

        var result = await _handler.Handle(new LoginCommand("inactive", "password"), default);

        result.IsFailed.Should().BeTrue();
        result.Errors.First().Message.Should().Be("Invalid username or password.");
    }

    [Fact]
    public async Task Handle_LockedUser_ReturnsLockedError()
    {
        var companyId = Guid.NewGuid();
        var user = new User("locked", "locked@test.com", _passwordHasher.Hash("password"), "Lock", "Ed", companyId);
        user.RecordFailedAttempt(3, 15);
        user.RecordFailedAttempt(3, 15);
        user.RecordFailedAttempt(3, 15);
        _userRepo.GetByUsernameAsync("locked", Arg.Any<CancellationToken>())!.Returns(user);

        var result = await _handler.Handle(new LoginCommand("locked", "password"), default);

        result.IsFailed.Should().BeTrue();
        result.Errors.First().Message.Should().Contain("locked");
    }

    [Fact]
    public async Task Handle_WrongPassword_ReturnsFail()
    {
        var companyId = Guid.NewGuid();
        var user = new User("valid", "valid@test.com", _passwordHasher.Hash("correct-password"), "Val", "Id", companyId);
        _userRepo.GetByUsernameAsync("valid", Arg.Any<CancellationToken>())!.Returns(user);
        var policy = new CompanyPasswordPolicy(companyId);
        _policyRepo.GetByCompanyIdAsync(companyId, Arg.Any<CancellationToken>())!.Returns(policy);

        var result = await _handler.Handle(new LoginCommand("valid", "wrong-password"), default);

        result.IsFailed.Should().BeTrue();
        result.Errors.First().Message.Should().Be("Invalid username or password.");
    }

    [Fact]
    public async Task Handle_ValidCredentials_ReturnsTokens()
    {
        var companyId = Guid.NewGuid();
        var role = new Role("Admin", companyId);
        var user = new User("valid", "valid@test.com", _passwordHasher.Hash("correct-password"), "Val", "Id", companyId);
        user.AddRole(role);
        _userRepo.GetByUsernameAsync("valid", Arg.Any<CancellationToken>())!.Returns(user);
        var policy = new CompanyPasswordPolicy(companyId);
        _policyRepo.GetByCompanyIdAsync(companyId, Arg.Any<CancellationToken>())!.Returns(policy);
        _roleRepo.GetUserEffectivePermissionsAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(new HashSet<string>());
        _tokenService.GenerateTokens(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<IReadOnlyCollection<string>>(), Arg.Any<IReadOnlyCollection<string>>())
            .Returns(new TokenResult("access-token", "refresh-token", DateTime.UtcNow.AddMinutes(15), DateTime.UtcNow.AddDays(7)));

        var result = await _handler.Handle(new LoginCommand("valid", "correct-password"), default);

        result.IsSuccess.Should().BeTrue();
        result.Value.AccessToken.Should().Be("access-token");
    }

    [Fact]
    public async Task Handle_MfaEnabled_NowLogsInDirectly()
    {
        var companyId = Guid.NewGuid();
        var role = new Role("Admin", companyId);
        var user = new User("mfa-user", "mfa@test.com", _passwordHasher.Hash("password"), "Mfa", "User", companyId);
        user.EnableMfa("SECRET");
        user.AddRole(role);
        _userRepo.GetByUsernameAsync("mfa-user", Arg.Any<CancellationToken>())!.Returns(user);
        var policy = new CompanyPasswordPolicy(companyId);
        _policyRepo.GetByCompanyIdAsync(companyId, Arg.Any<CancellationToken>())!.Returns(policy);
        _roleRepo.GetUserEffectivePermissionsAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(new HashSet<string>());
        _tokenService.GenerateTokens(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<IReadOnlyCollection<string>>(), Arg.Any<IReadOnlyCollection<string>>())
            .Returns(new TokenResult("mfa-token", "refresh", DateTime.UtcNow.AddMinutes(15), DateTime.UtcNow.AddDays(7)));

        var result = await _handler.Handle(new LoginCommand("mfa-user", "password"), default);

        result.IsSuccess.Should().BeTrue();
        result.Value.AccessToken.Should().Be("mfa-token");
    }

    [Fact]
    public async Task Handle_AdminCredentials_ValidLogin()
    {
        var companyId = Guid.NewGuid();
        var role = new Role("Admin", companyId);
        var user = new User("admin", "admin@test.com", _passwordHasher.Hash("Admin@123456"), "System", "Admin", companyId);
        user.AddRole(role);
        _userRepo.GetByUsernameAsync("admin", Arg.Any<CancellationToken>())!.Returns(user);
        var policy = new CompanyPasswordPolicy(companyId);
        _policyRepo.GetByCompanyIdAsync(companyId, Arg.Any<CancellationToken>())!.Returns(policy);
        _roleRepo.GetUserEffectivePermissionsAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(new HashSet<string>());
        _tokenService.GenerateTokens(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<IReadOnlyCollection<string>>(), Arg.Any<IReadOnlyCollection<string>>())
            .Returns(new TokenResult("admin-token", "refresh", DateTime.UtcNow.AddMinutes(15), DateTime.UtcNow.AddDays(7)));

        var result = await _handler.Handle(new LoginCommand("admin", "Admin@123456"), default);

        result.IsSuccess.Should().BeTrue();
        result.Value.AccessToken.Should().Be("admin-token");
    }

    [Fact]
    public async Task Handle_AdminWrongPassword_Fails()
    {
        var companyId = Guid.NewGuid();
        var user = new User("admin", "admin@test.com", _passwordHasher.Hash("Admin@123456"), "System", "Admin", companyId);
        _userRepo.GetByUsernameAsync("admin", Arg.Any<CancellationToken>())!.Returns(user);
        var policy = new CompanyPasswordPolicy(companyId);
        _policyRepo.GetByCompanyIdAsync(companyId, Arg.Any<CancellationToken>())!.Returns(policy);

        var result = await _handler.Handle(new LoginCommand("admin", "WrongPassword"), default);

        result.IsFailed.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WrongPassword_RecordsFailedAttempt()
    {
        var companyId = Guid.NewGuid();
        var user = new User("attacker", "attacker@test.com", _passwordHasher.Hash("correct-password"), "At", "Tacker", companyId);
        _userRepo.GetByUsernameAsync("attacker", Arg.Any<CancellationToken>())!.Returns(user);
        var policy = new CompanyPasswordPolicy(companyId);
        _policyRepo.GetByCompanyIdAsync(companyId, Arg.Any<CancellationToken>())!.Returns(policy);

        await _handler.Handle(new LoginCommand("attacker", "wrong-password"), default);

        user.FailedLoginAttempts.Should().Be(1);
        _userRepo.Received(1).Update(user);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }
}
