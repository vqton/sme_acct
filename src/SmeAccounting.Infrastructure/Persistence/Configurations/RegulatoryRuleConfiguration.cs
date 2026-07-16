using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Rules;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class RegulatoryRuleConfiguration : IEntityTypeConfiguration<RegulatoryRule>
{
    public void Configure(EntityTypeBuilder<RegulatoryRule> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.RuleCode).HasMaxLength(50).IsRequired();
        builder.Property(r => r.Name).HasMaxLength(200).IsRequired();
        builder.Property(r => r.RuleType).HasMaxLength(50).IsRequired();
        builder.Property(r => r.JsonConfig).IsRequired();
        builder.HasIndex(r => r.RuleCode).IsUnique();
    }
}
