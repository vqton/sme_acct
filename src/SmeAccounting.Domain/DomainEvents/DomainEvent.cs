namespace SmeAccounting.Domain.DomainEvents;

public abstract record DomainEvent
{
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}