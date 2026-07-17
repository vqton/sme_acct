using System.Collections.Concurrent;

namespace SmeAccounting.Web.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private readonly ConcurrentDictionary<string, RateBucket> _buckets = new();

    private static readonly HashSet<string> _protectedPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/auth/login",
        "/auth/logout",
    };

    public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;
        if (path is null || !_protectedPaths.Contains(path))
        {
            await _next(context);
            return;
        }

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var key = $"{ip}:{path}";
        var now = DateTimeOffset.UtcNow;
        var bucket = _buckets.GetOrAdd(key, _ => new RateBucket());

        lock (bucket)
        {
            if (bucket.WindowStart < now.AddMinutes(-1))
            {
                bucket.WindowStart = now;
                bucket.Count = 0;
            }

            var limit = path.Contains("/login") ? 10 : 30;
            if (bucket.Count >= limit)
            {
                _logger.LogWarning("Rate limit exceeded for {Path} from {Ip}", path, ip);
                context.Response.StatusCode = 429;
                return;
            }

            bucket.Count++;
        }

        await _next(context);
    }

    private class RateBucket
    {
        public DateTimeOffset WindowStart { get; set; } = DateTimeOffset.UtcNow;
        public int Count { get; set; }
    }
}
