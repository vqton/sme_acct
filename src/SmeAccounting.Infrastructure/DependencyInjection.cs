using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Infrastructure.Audit;
using SmeAccounting.Infrastructure.BackgroundJobs;
using SmeAccounting.Infrastructure.EInvoice;
using SmeAccounting.Infrastructure.ESigner;
using SmeAccounting.Infrastructure.Persistence;
using SmeAccounting.Infrastructure.Persistence.Interceptors;
using SmeAccounting.Infrastructure.Persistence.Repositories;
using SmeAccounting.Infrastructure.Security;
using SmeAccounting.Infrastructure.Biometric;
using SmeAccounting.Infrastructure.Rules;
using SmeAccounting.Infrastructure.TaxAuthority;
using SmeAccounting.Infrastructure.VNeID;
using Microsoft.Extensions.Options;

namespace SmeAccounting.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<AuditSaveChangesInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
            options.UseMySQL(
                configuration.GetConnectionString("DefaultConnection")
            ).AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>()));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<IJournalEntryRepository, JournalEntryRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IFeatureRepository, FeatureRepository>();
        services.AddScoped<IOrganizationUnitRepository, OrganizationUnitRepository>();
        services.AddScoped<ICompanyPasswordPolicyRepository, CompanyPasswordPolicyRepository>();
        services.AddScoped<IWorkflowRepository, WorkflowRepository>();
        services.AddScoped<IPermissionRepository, PermissionRepository>();

        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();

        services.AddScoped<IVNeIDService, MockVNeIDService>();
        services.AddScoped<IDigitalSignatureService, MockESignerService>();
        services.AddScoped<IEInvoiceService, MockEInvoiceService>();
        services.AddScoped<InvoiceXmlBuilder>();
        services.AddScoped<DataIntegrityChecker>();
        services.AddHostedService<DataIntegrityJob>();

        services.AddScoped<IBiometricService, BiometricService>();
        services.AddScoped<ITaxService, TaxService>();
        services.AddScoped<TaxXmlBuilder>();
        services.AddScoped<RegulatoryRuleEngine>();

        services.AddHttpClient<IVNeIDService, VNeIDService>()
            .ConfigureHttpClient(c => c.BaseAddress = new Uri(configuration.GetSection(VNeIDOptions.SectionName)["BaseUrl"] ?? "https://api.vneid.gov.vn"));

        services.Configure<VNeIDOptions>(configuration.GetSection(VNeIDOptions.SectionName));

        return services;
    }
}
