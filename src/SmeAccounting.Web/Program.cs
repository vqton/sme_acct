using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmeAccounting.Web.Authorization;
using SmeAccounting.Web.Data;
using SmeAccounting.Web.Middleware;
using SmeAccounting.Web.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireDigit = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.User.RequireUniqueEmail = true;
})
.AddClaimsPrincipalFactory<PermissionClaimsFactory>()
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

var jwtKey = builder.Configuration["Jwt:Secret"] ?? "SuperSecretKeyThatIsAtLeast32BytesLong!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "SmeAccounting";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "SmeAccounting";

builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Auth/Login";
    options.LogoutPath = "/Auth/Logout";
    options.AccessDeniedPath = "/Auth/AccessDenied";
    options.SlidingExpiration = true;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
});

builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddControllersWithViews();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();

    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('acc.AspNetUsers') AND name = 'AvatarUrl')
            ALTER TABLE acc.AspNetUsers ADD AvatarUrl nvarchar(512) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('acc.AspNetUsers') AND name = 'DateOfBirth')
            ALTER TABLE acc.AspNetUsers ADD DateOfBirth datetime2 NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('acc.AspNetUsers') AND name = 'Gender')
            ALTER TABLE acc.AspNetUsers ADD Gender nvarchar(20) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('acc.AspNetUsers') AND name = 'Address')
            ALTER TABLE acc.AspNetUsers ADD Address nvarchar(500) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('acc.AspNetUsers') AND name = 'Department')
            ALTER TABLE acc.AspNetUsers ADD Department nvarchar(200) NULL;
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('acc.AspNetUsers') AND name = 'JobTitle')
            ALTER TABLE acc.AspNetUsers ADD JobTitle nvarchar(200) NULL;
    ");

    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.Companies'))
        BEGIN
            CREATE TABLE acc.Companies (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                Name nvarchar(400) NOT NULL,
                TaxCode nvarchar(100) NULL,
                Address nvarchar(500) NULL,
                Phone nvarchar(100) NULL,
                Email nvarchar(256) NULL,
                Website nvarchar(200) NULL,
                LegalRepresentative nvarchar(200) NULL,
                RepPosition nvarchar(200) NULL,
                LogoUrl nvarchar(512) NULL,
                IsActive bit NOT NULL DEFAULT 1,
                CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
                UpdatedAt datetime2 NULL
            );
            CREATE UNIQUE INDEX IX_Companies_TaxCode ON acc.Companies(TaxCode) WHERE TaxCode IS NOT NULL;
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.CompanySettings'))
        BEGIN
            CREATE TABLE acc.CompanySettings (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                FiscalYearStartMonth int NOT NULL DEFAULT 1,
                CurrencyCode nvarchar(10) NOT NULL DEFAULT 'VND',
                DecimalPlaces int NOT NULL DEFAULT 2,
                InventoryMethod nvarchar(100) NULL,
                TaxMethod nvarchar(100) NULL,
                EnableMultiCurrency bit NOT NULL DEFAULT 0,
                EnableDepartmentManagement bit NOT NULL DEFAULT 1
            );
            CREATE UNIQUE INDEX IX_CompanySettings_CompanyId ON acc.CompanySettings(CompanyId);
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.UserCompanies'))
        BEGIN
            DROP TABLE IF EXISTS acc.UserCompany;
            CREATE TABLE acc.UserCompanies (
                UserId nvarchar(450) NOT NULL REFERENCES acc.AspNetUsers(Id) ON DELETE CASCADE,
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                IsActive bit NOT NULL DEFAULT 1,
                JoinedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
                Role nvarchar(50) NULL,
                PRIMARY KEY (UserId, CompanyId)
            );
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.LegalRepresentatives'))
        BEGIN
            CREATE TABLE acc.LegalRepresentatives (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                FullName nvarchar(200) NOT NULL,
                VNeIDNumber nvarchar(12) NULL,
                Position nvarchar(200) NOT NULL,
                IsPrimary bit NOT NULL DEFAULT 0,
                AuthorizationScope nvarchar(500) NULL,
                DigitalCertSerial nvarchar(200) NULL,
                DigitalCertProvider nvarchar(200) NULL,
                DigitalCertExpiry datetime2 NULL,
                VNeIDVerifiedAt datetime2 NULL,
                FromDate datetime2 NOT NULL DEFAULT GETUTCDATE(),
                ToDate datetime2 NULL,
                IsActive bit NOT NULL DEFAULT 1
            );
            CREATE UNIQUE INDEX IX_LegalRepresentatives_CompanyId_VNeIDNumber ON acc.LegalRepresentatives(CompanyId, VNeIDNumber) WHERE VNeIDNumber IS NOT NULL;
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.BusinessLines'))
        BEGIN
            CREATE TABLE acc.BusinessLines (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                VsicCode nvarchar(10) NOT NULL,
                VsicLevel int NOT NULL DEFAULT 4,
                Name nvarchar(500) NOT NULL,
                IsPrimary bit NOT NULL DEFAULT 0,
                StartDate datetime2 NOT NULL,
                EndDate datetime2 NULL,
                LicenseReference nvarchar(200) NULL
            );
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.CapitalContributors'))
        BEGIN
            CREATE TABLE acc.CapitalContributors (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                ContributorType int NOT NULL,
                FullName nvarchar(200) NULL,
                OrganizationName nvarchar(200) NULL,
                IdNumber nvarchar(15) NULL,
                ContributionType nvarchar(50) NOT NULL DEFAULT 'Member',
                CapitalContribution decimal(18,2) NOT NULL,
                OwnershipRatio decimal(5,2) NOT NULL,
                ContributionDate datetime2 NOT NULL,
                ContributionCertificate nvarchar(200) NULL,
                IsFounder bit NOT NULL DEFAULT 0
            );
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.CompanyBankAccounts'))
        BEGIN
            CREATE TABLE acc.CompanyBankAccounts (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                AccountNumber nvarchar(50) NOT NULL,
                AccountName nvarchar(200) NOT NULL,
                BankName nvarchar(200) NOT NULL,
                BankBranch nvarchar(200) NULL,
                SwiftCode nvarchar(20) NULL,
                CurrencyCode nvarchar(3) NOT NULL DEFAULT 'VND',
                IsPrimaryTaxPayment bit NOT NULL DEFAULT 0,
                IsActive bit NOT NULL DEFAULT 1,
                OpenedDate datetime2 NOT NULL DEFAULT GETUTCDATE()
            );
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.Branches'))
        BEGIN
            CREATE TABLE acc.Branches (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                BranchType int NOT NULL,
                Name nvarchar(400) NOT NULL,
                Address nvarchar(500) NULL,
                TaxCode nvarchar(15) NULL,
                Phone nvarchar(100) NULL,
                ManagerName nvarchar(200) NULL,
                Status nvarchar(50) NOT NULL DEFAULT 'Active',
                DateOpened datetime2 NOT NULL,
                DateClosed datetime2 NULL
            );
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.CompanyLicenses'))
        BEGIN
            CREATE TABLE acc.CompanyLicenses (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                LicenseType int NOT NULL,
                LicenseNumber nvarchar(100) NOT NULL,
                IssuedBy nvarchar(200) NOT NULL,
                DateIssued datetime2 NOT NULL,
                DateExpiry datetime2 NULL,
                FileUrl nvarchar(1000) NULL,
                Notes nvarchar(1000) NULL
            );
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.CompanySeals'))
        BEGIN
            CREATE TABLE acc.CompanySeals (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                SealRegistrationNumber nvarchar(50) NULL,
                SealImageUrl nvarchar(1000) NULL,
                IssuedBy nvarchar(200) NULL,
                DateRegistered datetime2 NULL,
                Notes nvarchar(1000) NULL
            );
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.CompanyDocuments'))
        BEGIN
            CREATE TABLE acc.CompanyDocuments (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                DocumentType int NOT NULL,
                FileName nvarchar(500) NOT NULL,
                FileUrl nvarchar(1000) NOT NULL,
                FileSize bigint NOT NULL DEFAULT 0,
                ContentType nvarchar(100) NOT NULL,
                ExpiryDate datetime2 NULL,
                UploadedAt datetime2 NOT NULL DEFAULT GETUTCDATE()
            );
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.FormerNames'))
        BEGIN
            CREATE TABLE acc.FormerNames (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                Name nvarchar(400) NOT NULL,
                FromDate datetime2 NOT NULL,
                ToDate datetime2 NULL
            );
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.AuditAssignments'))
        BEGIN
            CREATE TABLE acc.AuditAssignments (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                AuditFirmName nvarchar(200) NOT NULL,
                AuditFirmTaxCode nvarchar(15) NULL,
                AuditFirmAddress nvarchar(500) NULL,
                AssignmentYear int NOT NULL,
                EngagementPartner nvarchar(200) NULL,
                AuditStartDate datetime2 NULL,
                AuditEndDate datetime2 NULL,
                AuditReportReference nvarchar(200) NULL,
                Status int NOT NULL DEFAULT 1
            );
        END

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE object_id = OBJECT_ID('acc.StatusChangeLogs'))
        BEGIN
            CREATE TABLE acc.StatusChangeLogs (
                Id uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
                CompanyId uniqueidentifier NOT NULL REFERENCES acc.Companies(Id) ON DELETE CASCADE,
                OldStatus int NOT NULL,
                NewStatus int NOT NULL,
                Reason nvarchar(1000) NOT NULL,
                ChangedByUserId nvarchar(450) NULL,
                ChangedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
                EffectiveDate datetime2 NOT NULL,
                DocumentRef nvarchar(200) NULL
            );
        END
    ");

    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    if (!await roleManager.RoleExistsAsync("Admin"))
        await roleManager.CreateAsync(new IdentityRole("Admin"));

    if (!await roleManager.RoleExistsAsync("User"))
        await roleManager.CreateAsync(new IdentityRole("User"));

    var admin = await userManager.FindByNameAsync("admin");
    if (admin is null)
    {
        admin = new ApplicationUser
        {
            UserName = "admin",
            Email = "admin@smeaccounting.com",
            FullName = "System Administrator"
        };
        var result = await userManager.CreateAsync(admin, "Admin@123");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "Admin");
    }

    if (!await db.Companies.AnyAsync())
    {
        var company = new Company
        {
            Name = "My Company",
            TaxCode = "0000000000",
            Address = "Hanoi, Vietnam",
            Phone = "0123456789",
            Email = "info@mycompany.com",
            IsActive = true,
            Settings = new CompanySettings()
        };
        db.Companies.Add(company);
        await db.SaveChangesAsync();

        db.UserCompanies.Add(new UserCompany { UserId = admin.Id, CompanyId = company.Id });
        await db.SaveChangesAsync();
    }
    else if (!await db.UserCompanies.AnyAsync(uc => uc.UserId == admin.Id))
    {
        var company = await db.Companies.FirstAsync();
        db.UserCompanies.Add(new UserCompany { UserId = admin.Id, CompanyId = company.Id });
        await db.SaveChangesAsync();
    }
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseRouting();

app.UseAuthentication();
app.UseMiddleware<IpWhitelistMiddleware>();
app.UseMiddleware<RateLimitingMiddleware>();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "areas",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();
