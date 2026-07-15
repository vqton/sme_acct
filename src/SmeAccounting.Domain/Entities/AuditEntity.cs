using SmeAccounting.Domain.DomainEvents;

namespace SmeAccounting.Domain.Entities;

public class AuditEntity : BaseEntity
{
    public string TableName { get; private set; } = string.Empty;
    public string Operation { get; private set; } = string.Empty;
    public string RecordId { get; private set; } = string.Empty;
    public string OldValues { get; private set; } = string.Empty;
    public string NewValues { get; private set; } = string.Empty;
    public string ChangedBy { get; private set; } = string.Empty;
    public string IpAddress { get; private set; } = string.Empty;
    public string UserAgent { get; private set; } = string.Empty;

    private AuditEntity() { }

    public AuditEntity(string tableName, string operation, string recordId,
        string oldValues, string newValues, string changedBy)
    {
        TableName = tableName;
        Operation = operation;
        RecordId = recordId;
        OldValues = oldValues;
        NewValues = newValues;
        ChangedBy = changedBy;
    }
}
