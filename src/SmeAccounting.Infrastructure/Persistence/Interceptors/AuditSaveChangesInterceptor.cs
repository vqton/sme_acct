using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SmeAccounting.Application.Common.Interfaces;
using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Infrastructure.Persistence.Interceptors;

public sealed class AuditSaveChangesInterceptor : ISaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUser;

    public AuditSaveChangesInterceptor(ICurrentUserService currentUser)
    {
        _currentUser = currentUser;
    }

    public ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken ct = default)
    {
        var context = eventData.Context;
        if (context is null)
            return ValueTask.FromResult(result);

        var entries = context.ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && e.Entity is not AuditEntity)
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
            .ToList();

        var userId = _currentUser.UserId ?? "system";
        var ipAddress = _currentUser.IpAddress ?? "unknown";

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;
            var tableName = context.Model.FindEntityType(entity.GetType())?.GetTableName()
                ?? entity.GetType().Name;
            var recordId = entity.Id.ToString();

            var oldValues = entry.State == EntityState.Modified
                ? SerializeOldValues(entry)
                : "{}";
            var newValues = entry.State == EntityState.Deleted
                ? "{}"
                : SerializeNewValues(entry);

            var audit = new AuditEntity(tableName, entry.State.ToString(), recordId, oldValues, newValues, userId);
            context.Add(audit);
        }

        return ValueTask.FromResult(result);
    }

    internal static string SerializeOldValues(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
    {
        var data = new Dictionary<string, object?>();
        foreach (var prop in entry.Properties)
        {
            if (prop.Metadata.IsPrimaryKey()) continue;
            var originalValue = prop.OriginalValue;
            if (originalValue is not null && !Equals(originalValue, prop.CurrentValue))
                data[prop.Metadata.Name] = originalValue;
        }
        return JsonSerializer.Serialize(data);
    }

    internal static string SerializeNewValues(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
    {
        var data = new Dictionary<string, object?>();
        foreach (var prop in entry.Properties)
        {
            if (prop.Metadata.IsPrimaryKey()) continue;
            data[prop.Metadata.Name] = prop.CurrentValue;
        }
        return JsonSerializer.Serialize(data);
    }
}
