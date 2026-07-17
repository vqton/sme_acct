using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.CashManagement.Controllers;

[Area("CashManagement")]
[Authorize]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
