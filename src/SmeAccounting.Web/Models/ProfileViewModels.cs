using System.ComponentModel.DataAnnotations;

namespace SmeAccounting.Web.Models;

public class ProfileIndexViewModel
{
    public UpdateProfileForm UpdateProfile { get; set; } = new();
    public ChangePasswordForm ChangePassword { get; set; } = new();
    public List<LoginHistoryEntry> LoginHistory { get; set; } = [];
    public string ActiveTab { get; set; } = "info";
}

public class UpdateProfileForm
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [DataType(DataType.Date)]
    public DateTime? DateOfBirth { get; set; }

    [StringLength(20)]
    public string? Gender { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(200)]
    public string? Department { get; set; }

    [StringLength(200)]
    public string? JobTitle { get; set; }
}

public class ChangePasswordForm
{
    [Required(ErrorMessage = "Current password is required")]
    [DataType(DataType.Password)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "New password is required")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters")]
    [DataType(DataType.Password)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$",
        ErrorMessage = "Password must contain uppercase, lowercase, digit, and special character")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [DataType(DataType.Password)]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}

public class LoginHistoryEntry
{
    public string? IpAddress { get; set; }
    public string? DeviceInfo { get; set; }
    public string Result { get; set; } = string.Empty;
    public DateTime AttemptedAt { get; set; }
}
