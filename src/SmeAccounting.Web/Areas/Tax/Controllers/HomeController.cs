using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.Tax.Controllers;

[Area("Tax")]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
