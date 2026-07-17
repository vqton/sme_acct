using System.Collections.Concurrent;
using System.Net;
using System.Net.Sockets;

namespace SmeAccounting.Web.Middleware;

public class IpWhitelistMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<IpWhitelistMiddleware> _logger;
    private readonly ConcurrentBag<(IPAddress Network, int Prefix)> _whitelist = new();

    public IpWhitelistMiddleware(RequestDelegate next, ILogger<IpWhitelistMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (_whitelist.IsEmpty)
        {
            await _next(context);
            return;
        }

        var remoteIp = context.Connection.RemoteIpAddress;
        if (remoteIp is null)
        {
            context.Response.StatusCode = 403;
            return;
        }

        if (remoteIp.AddressFamily == AddressFamily.InterNetworkV6)
        {
            remoteIp = remoteIp.MapToIPv4();
        }

        var allowed = _whitelist.Any(e => IpMatches(remoteIp, e.Network, e.Prefix));

        if (allowed)
        {
            await _next(context);
            return;
        }

        _logger.LogWarning("IP {Ip} blocked by whitelist", remoteIp);
        context.Response.StatusCode = 403;
        await context.Response.WriteAsync("Access restricted by IP policy.");
    }

    private static bool IpMatches(IPAddress ip, IPAddress network, int prefix)
    {
        var ipBytes = ip.GetAddressBytes();
        var netBytes = network.GetAddressBytes();

        if (ipBytes.Length != netBytes.Length)
            return false;

        int fullBytes = prefix / 8;
        int remainingBits = prefix % 8;

        if (!ipBytes.Take(fullBytes).SequenceEqual(netBytes.Take(fullBytes)))
            return false;

        if (remainingBits > 0)
        {
            byte mask = (byte)(0xFF << (8 - remainingBits));
            if ((ipBytes[fullBytes] & mask) != (netBytes[fullBytes] & mask))
                return false;
        }

        return true;
    }
}
