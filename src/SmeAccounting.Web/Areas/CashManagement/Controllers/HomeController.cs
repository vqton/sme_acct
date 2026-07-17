using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Web.Authorization;

namespace SmeAccounting.Web.Areas.CashManagement.Controllers;

[Area("CashManagement")]
[RequirePermission(AppFeatures.CASH_BANK, FeatureAction.View)]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
