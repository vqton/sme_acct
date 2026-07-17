using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.FixedAssets.Controllers;

[Area("FixedAssets")]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
