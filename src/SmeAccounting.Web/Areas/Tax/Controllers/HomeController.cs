using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Web.Authorization;

namespace SmeAccounting.Web.Areas.Tax.Controllers;

[Area("Tax")]
[RequirePermission(AppFeatures.TAX_DECLARE, FeatureAction.View)]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
