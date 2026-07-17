using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SmeAccounting.Web.Areas.Tax.Controllers;

[Area("Tax")]
[Authorize]
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
