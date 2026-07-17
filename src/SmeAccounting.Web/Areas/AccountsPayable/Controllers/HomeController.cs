using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.AccountsPayable.Controllers;

[Area("AccountsPayable")]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
