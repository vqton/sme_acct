namespace SmeAccounting.Web.Middleware;

public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        if (string.IsNullOrEmpty(context.Response.Headers["Content-Security-Policy"]))
        {
            context.Response.Headers["Content-Security-Policy"] =
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data:; " +
                "font-src 'self'; " +
                "form-action 'self'; " +
                "frame-ancestors 'none'; " +
                "base-uri 'self'";
        }

        if (string.IsNullOrEmpty(context.Response.Headers["X-Frame-Options"]))
            context.Response.Headers["X-Frame-Options"] = "DENY";

        if (string.IsNullOrEmpty(context.Response.Headers["X-Content-Type-Options"]))
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";

        if (string.IsNullOrEmpty(context.Response.Headers["Referrer-Policy"]))
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        if (string.IsNullOrEmpty(context.Response.Headers["X-Permitted-Cross-Domain-Policies"]))
            context.Response.Headers["X-Permitted-Cross-Domain-Policies"] = "none";

        if (string.IsNullOrEmpty(context.Response.Headers["Cross-Origin-Resource-Policy"]))
            context.Response.Headers["Cross-Origin-Resource-Policy"] = "same-origin";

        if (string.IsNullOrEmpty(context.Response.Headers["Permissions-Policy"]))
            context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

        await _next(context);
    }
}
