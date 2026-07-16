using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Application.Admin.Roles.Commands;
using SmeAccounting.Application.Admin.Roles.Queries;

namespace SmeAccounting.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RolesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid? companyId)
    {
        var result = await _mediator.Send(new ListRolesQuery(companyId));
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _mediator.Send(new GetRoleQuery(id));
        if (result.IsFailed) return NotFound(new { error = result.Errors.First().Message });
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoleCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailed) return BadRequest(new { error = result.Errors.First().Message });
        return CreatedAtAction(nameof(Get), new { id = result.Value }, new { id = result.Value });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleCommand command)
    {
        if (id != command.Id) return BadRequest(new { error = "Id mismatch" });
        var result = await _mediator.Send(command);
        if (result.IsFailed) return BadRequest(new { error = result.Errors.First().Message });
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteRoleCommand(id));
        if (result.IsFailed) return BadRequest(new { error = result.Errors.First().Message });
        return Ok();
    }

    [HttpPost("{roleId:guid}/permissions/{permissionId:guid}")]
    public async Task<IActionResult> AssignPermission(Guid roleId, Guid permissionId)
    {
        var result = await _mediator.Send(new AssignPermissionCommand(roleId, permissionId));
        if (result.IsFailed) return BadRequest(new { error = result.Errors.First().Message });
        return Ok();
    }

    [HttpDelete("{roleId:guid}/permissions/{permissionId:guid}")]
    public async Task<IActionResult> RemovePermission(Guid roleId, Guid permissionId)
    {
        var result = await _mediator.Send(new RemovePermissionCommand(roleId, permissionId));
        if (result.IsFailed) return BadRequest(new { error = result.Errors.First().Message });
        return Ok();
    }
}
