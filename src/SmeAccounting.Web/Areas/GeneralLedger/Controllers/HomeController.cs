using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.GeneralLedger.Controllers;

[Area("GeneralLedger")]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
