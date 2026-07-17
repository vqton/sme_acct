using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Web.Authorization;

namespace SmeAccounting.Web.Areas.AccountsReceivable.Controllers;

[Area("AccountsReceivable")]
[RequirePermission(AppFeatures.AR_INVOICE, FeatureAction.View)]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
