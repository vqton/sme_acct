using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Application.Admin.Permissions.Queries;

namespace SmeAccounting.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PermissionsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var result = await _mediator.Send(new ListPermissionsQuery());
        return Ok(result.Value);
    }
}
