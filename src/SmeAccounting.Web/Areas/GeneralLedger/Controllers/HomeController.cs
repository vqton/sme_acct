using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.GeneralLedger.Controllers;

[Area("GeneralLedger")]
[Authorize]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
