using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Web.Authorization;

namespace SmeAccounting.Web.Areas.Reports.Controllers;

[Area("Reports")]
[RequirePermission(AppFeatures.REPORT_GL, FeatureAction.View)]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
