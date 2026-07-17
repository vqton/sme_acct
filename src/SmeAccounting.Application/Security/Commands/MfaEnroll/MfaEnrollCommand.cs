using FluentResults;
using MediatR;

namespace SmeAccounting.Application.Security.Commands.MfaEnroll;

public record MfaEnrollCommand : IRequest<Result<MfaEnrollResult>>;

public record MfaEnrollResult(string Secret, string QrCodeUri);
