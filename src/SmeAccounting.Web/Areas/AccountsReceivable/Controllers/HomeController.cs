using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.AccountsReceivable.Controllers;

[Area("AccountsReceivable")]
[Authorize]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
