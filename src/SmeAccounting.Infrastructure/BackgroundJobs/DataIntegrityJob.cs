using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SmeAccounting.Infrastructure.Audit;

namespace SmeAccounting.Infrastructure.BackgroundJobs;

public sealed class DataIntegrityJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DataIntegrityJob> _logger;

    public DataIntegrityJob(IServiceScopeFactory scopeFactory, ILogger<DataIntegrityJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DataIntegrityJob started");

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var checker = scope.ServiceProvider.GetRequiredService<DataIntegrityChecker>();
                var discrepancies = await checker.CheckIntegrityAsync(stoppingToken);

                if (discrepancies.Count > 0)
                {
                    _logger.LogWarning("Data integrity check found {Count} discrepancies", discrepancies.Count);
                    foreach (var d in discrepancies)
                        _logger.LogWarning("Integrity: {Discrepancy}", d);
                }
                else
                {
                    _logger.LogInformation("Data integrity check passed — no discrepancies");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Data integrity check failed");
            }
        }
    }
}
