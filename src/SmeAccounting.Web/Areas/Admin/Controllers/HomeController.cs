using Microsoft.AspNetCore.Mvc;
using SmeAccounting.Web.Authorization;

namespace SmeAccounting.Web.Areas.Admin.Controllers;

[Area("Admin")]
[RequirePermission(AppFeatures.ADMIN_USER, FeatureAction.View)]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
