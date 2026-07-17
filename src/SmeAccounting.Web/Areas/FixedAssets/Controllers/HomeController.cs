using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Web.Authorization;

namespace SmeAccounting.Web.Areas.FixedAssets.Controllers;

[Area("FixedAssets")]
[RequirePermission(AppFeatures.FIXED_ASSET, FeatureAction.View)]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
