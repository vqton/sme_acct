using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmeAccounting.Domain.DomainEvents;

namespace SmeAccounting.Domain.Entities;

public abstract class BaseEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; protected set; }

    public DateTime CreatedAt { get; protected set; }
    public string CreatedBy { get; protected set; } = string.Empty;
    public DateTime? UpdatedAt { get; protected set; }
    public string? UpdatedBy { get; protected set; }
    public DateTime? DeletedAt { get; protected set; }
    public string? DeletedBy { get; protected set; }
    public bool IsDeleted { get; protected set; }

    private readonly List<DomainEvent> _domainEvents = new();
    public IReadOnlyCollection<DomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
    }

    protected void SetCreator(string by) => CreatedBy = by;
    protected void SetUpdater(string by) { UpdatedAt = DateTime.UtcNow; UpdatedBy = by; }
    protected void Delete(string by) { IsDeleted = true; DeletedAt = DateTime.UtcNow; DeletedBy = by; }

    protected void RaiseEvent(DomainEvent domainEvent) => _domainEvents.Add(domainEvent);
    protected void ClearEvents() => _domainEvents.Clear();
}
