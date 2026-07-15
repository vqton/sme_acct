using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.GeneralLedger;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class JournalEntryConfiguration : IEntityTypeConfiguration<JournalEntry>
{
    public void Configure(EntityTypeBuilder<JournalEntry> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.EntryNumber).HasMaxLength(50).IsRequired();
        builder.HasIndex(e => e.EntryNumber).IsUnique();
        builder.Property(e => e.Description).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.HasMany(e => e.Lines).WithOne(e => e.JournalEntry).HasForeignKey(e => e.JournalEntryId);
    }
}
