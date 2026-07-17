using Microsoft.AspNetCore.Identity;

namespace SmeAccounting.Web.Models;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
}
