using FluentResults;
using MediatR;
using SmeAccounting.Application.Security.Common;

namespace SmeAccounting.Application.Security.Queries.GetCurrentUser;

public record GetCurrentUserQuery(Guid UserId) : IRequest<Result<UserDto>>;
