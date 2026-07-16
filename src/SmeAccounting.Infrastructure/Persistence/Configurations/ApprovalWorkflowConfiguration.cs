using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Workflow;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class ApprovalWorkflowConfiguration : IEntityTypeConfiguration<ApprovalWorkflow>
{
    public void Configure(EntityTypeBuilder<ApprovalWorkflow> builder)
    {
        builder.HasKey(w => w.Id);
        builder.Property(w => w.EntityType).HasMaxLength(100).IsRequired();
        builder.Property(w => w.Status).HasConversion<int>().IsRequired();
        builder.Property(w => w.ThresholdAmount).HasColumnType("decimal(18,2)");
        builder.HasIndex(w => w.EntityId).IsUnique();

        builder.OwnsMany(w => w.Steps, steps =>
        {
            steps.WithOwner().HasForeignKey("WorkflowId");
            steps.HasKey(s => s.Id);
            steps.Property(s => s.Comment).HasMaxLength(500);
        });
    }
}
