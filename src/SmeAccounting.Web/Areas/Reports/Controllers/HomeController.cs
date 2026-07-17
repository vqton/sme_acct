using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.Reports.Controllers;

[Area("Reports")]
[Authorize]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
