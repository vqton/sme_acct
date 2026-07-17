using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.FixedAssets.Controllers;

[Area("FixedAssets")]
[Authorize]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
