using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Web.Authorization;

namespace SmeAccounting.Web.Areas.GeneralLedger.Controllers;

[Area("GeneralLedger")]
[RequirePermission(AppFeatures.GL_JOURNAL, FeatureAction.View)]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
