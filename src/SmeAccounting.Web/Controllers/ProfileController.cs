using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmeAccounting.Web.Data;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Web.Controllers;

[Authorize]
public class ProfileController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ApplicationDbContext _db;
    private readonly ILogger<ProfileController> _logger;

    public ProfileController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ApplicationDbContext db,
        ILogger<ProfileController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _db = db;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Index(string tab = "info")
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null) return Challenge();

        var model = new ProfileIndexViewModel
        {
            ActiveTab = tab,
            UpdateProfile = new UpdateProfileForm
            {
                FullName = user.FullName ?? user.UserName ?? "",
                Email = user.Email ?? "",
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                Address = user.Address,
                Department = user.Department,
                JobTitle = user.JobTitle,
            },
            LoginHistory = await GetLoginHistory(user),
        };

        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateProfile(UpdateProfileForm form)
    {
        if (!ModelState.IsValid)
        {
            var user = await _userManager.GetUserAsync(User);
            var invalid = new ProfileIndexViewModel
            {
                ActiveTab = "info",
                UpdateProfile = form,
                LoginHistory = user is not null ? await GetLoginHistory(user) : [],
            };
            return View("Index", invalid);
        }

        var appUser = await _userManager.GetUserAsync(User);
        if (appUser is null) return Challenge();

        appUser.FullName = form.FullName;
        appUser.Email = form.Email;
        appUser.PhoneNumber = form.PhoneNumber;
        appUser.DateOfBirth = form.DateOfBirth;
        appUser.Gender = form.Gender;
        appUser.Address = form.Address;
        appUser.Department = form.Department;
        appUser.JobTitle = form.JobTitle;

        var result = await _userManager.UpdateAsync(appUser);
        if (result.Succeeded)
        {
            TempData["SuccessMessage"] = "Profile updated successfully.";
            return RedirectToAction(nameof(Index), new { tab = "info" });
        }

        foreach (var error in result.Errors)
            ModelState.AddModelError(string.Empty, error.Description);

        var newVm = new ProfileIndexViewModel
        {
            ActiveTab = "info",
            UpdateProfile = form,
            LoginHistory = await GetLoginHistory(appUser),
        };
        return View("Index", newVm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ChangePassword(ChangePasswordForm form)
    {
        if (!ModelState.IsValid)
        {
            var user = await _userManager.GetUserAsync(User);
            var vm = new ProfileIndexViewModel
            {
                ActiveTab = "password",
                LoginHistory = user is not null ? await GetLoginHistory(user) : [],
            };
            vm.UpdateProfile.FullName = user?.FullName ?? user?.UserName ?? "";
            vm.UpdateProfile.Email = user?.Email ?? "";
            return View("Index", vm);
        }

        var appUser = await _userManager.GetUserAsync(User);
        if (appUser is null) return Challenge();

        var result = await _userManager.ChangePasswordAsync(
            appUser, form.CurrentPassword, form.NewPassword);

        if (result.Succeeded)
        {
            await _signInManager.RefreshSignInAsync(appUser);
            _logger.LogInformation("User {Username} changed password", appUser.UserName);
            TempData["SuccessMessage"] = "Password changed successfully.";
            return RedirectToAction(nameof(Index), new { tab = "password" });
        }

        foreach (var error in result.Errors)
        {
            var field = error.Code.StartsWith("Password") ? "NewPassword" : "";
            ModelState.AddModelError(field, error.Description);
        }

        var userReload = await _userManager.GetUserAsync(User);
        var resultVm = new ProfileIndexViewModel
        {
            ActiveTab = "password",
            LoginHistory = userReload is not null ? await GetLoginHistory(userReload) : [],
        };
        resultVm.UpdateProfile.FullName = userReload?.FullName ?? userReload?.UserName ?? "";
        resultVm.UpdateProfile.Email = userReload?.Email ?? "";
        return View("Index", resultVm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RevokeSession(string sessionId)
    {
        var token = await _db.Set<IdentityUserToken<string>>()
            .FirstOrDefaultAsync(t => t.Name == "RefreshToken" && t.Value == sessionId);

        if (token is not null)
            _db.Remove(token);

        await _db.SaveChangesAsync();
        TempData["SuccessMessage"] = "Session revoked.";
        return RedirectToAction(nameof(Index), new { tab = "security" });
    }

    private async Task<List<LoginHistoryEntry>> GetLoginHistory(ApplicationUser user)
    {
        var history = await _db.Set<IdentityUserLogin<string>>()
            .Where(l => l.UserId == user.Id)
            .OrderByDescending(l => l.ProviderDisplayName)
            .Take(20)
            .Select(l => new LoginHistoryEntry
            {
                IpAddress = l.ProviderKey,
                DeviceInfo = l.LoginProvider,
                AttemptedAt = DateTime.MinValue,
            })
            .ToListAsync();

        return history;
    }
}
