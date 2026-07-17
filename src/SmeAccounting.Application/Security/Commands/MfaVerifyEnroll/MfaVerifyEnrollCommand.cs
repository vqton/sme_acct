using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Security.Commands.MfaVerifyEnroll;

public record MfaVerifyEnrollCommand(string Secret, string Code) : IRequest<Result>;
