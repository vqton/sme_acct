using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.Reports.Controllers;

[Area("Reports")]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
