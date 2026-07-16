using FluentResults;
using MediatR;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.Admin.Users.Commands;

public sealed class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUserCommandHandler(IUserRepository userRepo, IRoleRepository roleRepo, IPasswordHasher passwordHasher, IUnitOfWork unitOfWork)
    {
        _userRepo = userRepo;
        _roleRepo = roleRepo;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateUserCommand command, CancellationToken ct)
    {
        if (await _userRepo.UsernameExistsAsync(command.Username, ct))
            return Result.Fail("Username already exists");

        if (await _userRepo.EmailExistsAsync(command.Email, ct))
            return Result.Fail("Email already exists");

        var hash = _passwordHasher.Hash(command.Password);
        var user = new User(command.Username, command.Email, hash, command.FirstName, command.LastName, command.CompanyId);

        if (command.RoleIds?.Count > 0)
        {
            var roles = await _roleRepo.GetAllAsync(ct);
            var selected = roles.Where(r => command.RoleIds.Contains(r.Id)).ToList();
            foreach (var role in selected)
                user.AddRole(role);
        }

        _userRepo.Add(user);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok(user.Id);
    }
}
