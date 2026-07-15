using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.TradeName).HasMaxLength(200);
        builder.Property(e => e.TaxId).HasMaxLength(50).IsRequired();
        builder.Property(e => e.RegistrationNumber).HasMaxLength(50);
        builder.Property(e => e.Phone).HasMaxLength(30);
        builder.Property(e => e.Email).HasMaxLength(100);
        builder.Property(e => e.Website).HasMaxLength(200);
        builder.Property(e => e.LogoPath).HasMaxLength(500);
        builder.OwnsOne(e => e.Address);
        builder.HasMany(e => e.FiscalYears).WithOne(e => e.Company).HasForeignKey(e => e.CompanyId);
    }
}
