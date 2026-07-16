using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Application.Admin.Users.Commands;
using SmeAccounting.Application.Admin.Users.Queries;

namespace SmeAccounting.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid? companyId, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new ListUsersQuery(companyId, search, page, pageSize));
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _mediator.Send(new GetUserQuery(id));
        if (result.IsFailed) return NotFound(new { error = result.Errors.First().Message });
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailed) return BadRequest(new { error = result.Errors.First().Message });
        return CreatedAtAction(nameof(Get), new { id = result.Value }, new { id = result.Value });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserCommand command)
    {
        if (id != command.Id) return BadRequest(new { error = "Id mismatch" });
        var result = await _mediator.Send(command);
        if (result.IsFailed) return BadRequest(new { error = result.Errors.First().Message });
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteUserCommand(id));
        if (result.IsFailed) return BadRequest(new { error = result.Errors.First().Message });
        return Ok();
    }

    [HttpPost("{userId:guid}/roles/{roleId:guid}")]
    public async Task<IActionResult> AssignRole(Guid userId, Guid roleId)
    {
        var result = await _mediator.Send(new AssignRoleCommand(userId, roleId));
        if (result.IsFailed) return BadRequest(new { error = result.Errors.First().Message });
        return Ok();
    }

    [HttpDelete("{userId:guid}/roles/{roleId:guid}")]
    public async Task<IActionResult> UnassignRole(Guid userId, Guid roleId)
    {
        var result = await _mediator.Send(new UnassignRoleCommand(userId, roleId));
        if (result.IsFailed) return BadRequest(new { error = result.Errors.First().Message });
        return Ok();
    }
}
