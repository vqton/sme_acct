using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Web.Authorization;

namespace SmeAccounting.Web.Areas.AccountsPayable.Controllers;

[Area("AccountsPayable")]
[RequirePermission(AppFeatures.AP_INVOICE, FeatureAction.View)]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
