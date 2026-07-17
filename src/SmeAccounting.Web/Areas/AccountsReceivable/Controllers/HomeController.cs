using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.AccountsReceivable.Controllers;

[Area("AccountsReceivable")]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
