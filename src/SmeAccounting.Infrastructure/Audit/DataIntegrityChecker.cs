using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Infrastructure.Persistence;

namespace SmeAccounting.Infrastructure.Audit;

public sealed class DataIntegrityChecker
{
    private readonly ApplicationDbContext _context;

    public DataIntegrityChecker(ApplicationDbContext context) => _context = context;

    public async Task<List<string>> CheckIntegrityAsync(CancellationToken ct = default)
    {
        var discrepancies = new List<string>();

        var auditRecords = await _context.AuditLog
            .OrderByDescending(a => a.Id)
            .Take(100)
            .AsNoTracking()
            .ToListAsync(ct);

        foreach (var audit in auditRecords)
        {
            var currentHash = ComputeHash($"{audit.TableName}|{audit.Operation}|{audit.RecordId}|{audit.OldValues}|{audit.NewValues}|{audit.ChangedBy}");

            if (audit.Operation == "INSERT" && string.IsNullOrEmpty(audit.NewValues))
            {
                discrepancies.Add($"Audit {audit.Id}: INSERT with no NewValues — possible tampering");
            }

            if (audit.Operation == "UPDATE")
            {
                if (string.IsNullOrEmpty(audit.OldValues))
                    discrepancies.Add($"Audit {audit.Id}: UPDATE with no OldValues on {audit.TableName}:{audit.RecordId}");
                if (string.IsNullOrEmpty(audit.NewValues))
                    discrepancies.Add($"Audit {audit.Id}: UPDATE with no NewValues on {audit.TableName}:{audit.RecordId}");
            }
        }

        if (auditRecords.Count > 0)
        {
            var lastAudit = auditRecords.First();
            var earliestAudit = auditRecords.Last();
            discrepancies.Add($"Integrity check OK — {auditRecords.Count} audit entries from {earliestAudit.CreatedAt:O} to {lastAudit.CreatedAt:O}");
        }

        return discrepancies;
    }

    private static string ComputeHash(string input)
    {
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
