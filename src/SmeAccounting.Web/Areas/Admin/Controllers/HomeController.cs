using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.Admin.Controllers;

[Area("Admin")]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
