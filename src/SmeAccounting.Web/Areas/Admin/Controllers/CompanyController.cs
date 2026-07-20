using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmeAccounting.Web.Areas.Admin.Models;
using SmeAccounting.Web.Authorization;
using SmeAccounting.Web.Data;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Web.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize]
public class CompanyController : Controller
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<CompanyController> _logger;

    public CompanyController(ApplicationDbContext db, ILogger<CompanyController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Index(string tab = "info")
    {
        var userCompany = await _db.UserCompanies
            .Include(uc => uc.Company)
            .ThenInclude(c => c.Settings)
            .FirstOrDefaultAsync(uc => uc.UserId == GetUserId());

        if (userCompany?.Company is null)
            return NotFound("No company found for this user.");

        var company = userCompany.Company;
        var model = new CompanyViewModel
        {
            ActiveTab = tab,
            Info = new CompanyInfoForm
            {
                Name = company.Name,
                TaxCode = company.TaxCode,
                Address = company.Address,
                Phone = company.Phone,
                Email = company.Email,
                Website = company.Website,
                LegalRepresentative = company.LegalRepresentative,
                RepPosition = company.RepPosition,
            },
            Settings = new CompanySettingsForm
            {
                FiscalYearStartMonth = company.Settings?.FiscalYearStartMonth ?? 1,
                CurrencyCode = company.Settings?.CurrencyCode ?? "VND",
                DecimalPlaces = company.Settings?.DecimalPlaces ?? 2,
                InventoryMethod = company.Settings?.InventoryMethod,
                TaxMethod = company.Settings?.TaxMethod,
                EnableMultiCurrency = company.Settings?.EnableMultiCurrency ?? false,
                EnableDepartmentManagement = company.Settings?.EnableDepartmentManagement ?? true,
            },
        };

        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateInfo(CompanyInfoForm form)
    {
        if (!ModelState.IsValid)
        {
            var vm = await BuildViewModel("info");
            if (vm is not null) vm.Info = form;
            return View("Index", vm ?? new CompanyViewModel());
        }

        var uc = await _db.UserCompanies
            .Include(x => x.Company)
            .FirstOrDefaultAsync(x => x.UserId == GetUserId());

        if (uc?.Company is null) return NotFound();

        uc.Company.Name = form.Name;
        uc.Company.TaxCode = form.TaxCode;
        uc.Company.Address = form.Address;
        uc.Company.Phone = form.Phone;
        uc.Company.Email = form.Email;
        uc.Company.Website = form.Website;
        uc.Company.LegalRepresentative = form.LegalRepresentative;
        uc.Company.RepPosition = form.RepPosition;
        uc.Company.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        TempData["SuccessMessage"] = "Company info updated.";
        return RedirectToAction(nameof(Index), new { tab = "info" });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateSettings(CompanySettingsForm form)
    {
        if (!ModelState.IsValid)
        {
            var vm = await BuildViewModel("settings");
            if (vm is not null) vm.Settings = form;
            return View("Index", vm ?? new CompanyViewModel());
        }

        var uc = await _db.UserCompanies
            .Include(x => x.Company)
            .ThenInclude(c => c.Settings)
            .FirstOrDefaultAsync(x => x.UserId == GetUserId());

        if (uc?.Company is null) return NotFound();

        var settings = uc.Company.Settings;
        if (settings is null)
        {
            settings = new CompanySettings { CompanyId = uc.Company.Id };
            _db.CompanySettings.Add(settings);
        }

        settings.FiscalYearStartMonth = form.FiscalYearStartMonth;
        settings.CurrencyCode = form.CurrencyCode;
        settings.DecimalPlaces = form.DecimalPlaces;
        settings.InventoryMethod = form.InventoryMethod;
        settings.TaxMethod = form.TaxMethod;
        settings.EnableMultiCurrency = form.EnableMultiCurrency;
        settings.EnableDepartmentManagement = form.EnableDepartmentManagement;

        await _db.SaveChangesAsync();
        TempData["SuccessMessage"] = "Settings updated.";
        return RedirectToAction(nameof(Index), new { tab = "settings" });
    }

    private async Task<CompanyViewModel?> BuildViewModel(string activeTab)
    {
        var uc = await _db.UserCompanies
            .Include(x => x.Company)
            .ThenInclude(c => c.Settings)
            .FirstOrDefaultAsync(x => x.UserId == GetUserId());

        if (uc?.Company is null) return null;

        var c = uc.Company;
        return new CompanyViewModel
        {
            ActiveTab = activeTab,
            Info = new CompanyInfoForm
            {
                Name = c.Name, TaxCode = c.TaxCode, Address = c.Address,
                Phone = c.Phone, Email = c.Email, Website = c.Website,
                LegalRepresentative = c.LegalRepresentative, RepPosition = c.RepPosition,
            },
            Settings = new CompanySettingsForm
            {
                FiscalYearStartMonth = c.Settings?.FiscalYearStartMonth ?? 1,
                CurrencyCode = c.Settings?.CurrencyCode ?? "VND",
                DecimalPlaces = c.Settings?.DecimalPlaces ?? 2,
                InventoryMethod = c.Settings?.InventoryMethod,
                TaxMethod = c.Settings?.TaxMethod,
                EnableMultiCurrency = c.Settings?.EnableMultiCurrency ?? false,
                EnableDepartmentManagement = c.Settings?.EnableDepartmentManagement ?? true,
            },
        };
    }

    private string GetUserId() =>
        User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
}
