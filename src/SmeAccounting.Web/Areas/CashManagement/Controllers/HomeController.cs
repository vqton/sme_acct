using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.CashManagement.Controllers;

[Area("CashManagement")]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
