using Microsoft.AspNetCore.Identity;

namespace SmeAccounting.Web.Models;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? Department { get; set; }
    public string? JobTitle { get; set; }
}

