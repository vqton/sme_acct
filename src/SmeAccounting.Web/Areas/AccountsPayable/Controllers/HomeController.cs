using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.AccountsPayable.Controllers;

[Area("AccountsPayable")]
[Authorize]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
