import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import CompanySelector from "./components/CompanySelector";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import TwoFactorVerifyPage from "./pages/TwoFactorVerifyPage";
import TwoFactorSetupPage from "./pages/TwoFactorSetupPage";

// Core pages
import DashboardPage from "./pages/DashboardPage";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyFormPage from "./pages/CompanyFormPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import SessionsPage from "./pages/SessionsPage";

// Accounting pages
import ChartOfAccountsPage from "./pages/ChartOfAccountsPage";
import JournalEntryListPage from "./pages/JournalEntryListPage";
import JournalEntryFormPage from "./pages/JournalEntryFormPage";
import LedgerPage from "./pages/LedgerPage";
import TrialBalancePage from "./pages/TrialBalancePage";
import FinancialStatementPage from "./pages/FinancialStatementPage";
import PeriodClosePage from "./pages/PeriodClosePage";
import OpeningBalanceListPage from "./pages/OpeningBalanceListPage";
import OpeningBalanceFormPage from "./pages/OpeningBalanceFormPage";
import OpeningBalanceDetailPage from "./pages/OpeningBalanceDetailPage";

// Tax pages
import TaxListPage from "./pages/TaxListPage";
import TaxDeclarationFormPage from "./pages/TaxDeclarationFormPage";
import TaxDeclarationDetailPage from "./pages/TaxDeclarationDetailPage";
import TaxCalendarPage from "./pages/TaxCalendarPage";
import TaxPeriodManagementPage from "./pages/TaxPeriodManagementPage";

// User management pages
import UsersPage from "./pages/UsersPage";
import UserFormPage from "./pages/UserFormPage";
import UserDetailPage from "./pages/UserDetailPage";
import UserGroupsPage from "./pages/UserGroupsPage";

// Department pages
import DepartmentsPage from "./pages/DepartmentsPage";
import DepartmentDetailPage from "./pages/DepartmentDetailPage";

// Stub
import ModuleStub from "./pages/ModuleStub";

export default function App() {
  const { pendingCompanies } = useAuth();

  if (pendingCompanies.length > 0) {
    return <CompanySelector />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/2fa/verify" element={<TwoFactorVerifyPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/new" element={<CompanyFormPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/companies/:id/edit" element={<CompanyFormPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/2fa/setup" element={<TwoFactorSetupPage />} />

          {/* Accounting */}
          <Route path="/accounting/accounts" element={<ChartOfAccountsPage />} />
          <Route path="/accounting/journal-entries" element={<JournalEntryListPage />} />
          <Route path="/accounting/journal-entries/new" element={<JournalEntryFormPage />} />
          <Route path="/accounting/ledger" element={<LedgerPage />} />
          <Route path="/accounting/trial-balance" element={<TrialBalancePage />} />
          <Route path="/accounting/reports" element={<FinancialStatementPage />} />
          <Route path="/accounting/period-close" element={<PeriodClosePage />} />
          <Route path="/accounting/opening-balance" element={<OpeningBalanceListPage />} />
          <Route path="/accounting/opening-balance/new" element={<OpeningBalanceFormPage />} />
          <Route path="/accounting/opening-balance/:id" element={<OpeningBalanceDetailPage />} />

          {/* Stubs */}
          <Route path="/accounting/contacts" element={<ModuleStub name="Danh mục đối tượng" description="Quản lý khách hàng, nhà cung cấp" />} />
          <Route path="/accounting/cash" element={<ModuleStub name="Sổ quỹ tiền mặt" description="Quản lý thu chi tiền mặt" />} />
          <Route path="/accounting/bank" element={<ModuleStub name="Tiền gửi ngân hàng" description="Quản lý giao dịch ngân hàng" />} />
          <Route path="/accounting/purchasing" element={<ModuleStub name="Hóa đơn mua hàng" description="Quản lý hóa đơn mua hàng" />} />
          <Route path="/accounting/ap" element={<ModuleStub name="Công nợ phải trả" description="Quản lý công nợ NCC" />} />
          <Route path="/accounting/sales" element={<ModuleStub name="Hóa đơn bán hàng" description="Quản lý hóa đơn bán hàng" />} />
          <Route path="/accounting/ar" element={<ModuleStub name="Công nợ phải thu" description="Quản lý công nợ khách hàng" />} />
          <Route path="/accounting/inventory" element={<ModuleStub name="Hàng tồn kho" description="Quản lý nhập xuất tồn" />} />
          <Route path="/accounting/fa" element={<ModuleStub name="Tài sản cố định" description="Quản lý TSCĐ, khấu hao" />} />
          <Route path="/accounting/ccdc" element={<ModuleStub name="Công cụ dụng cụ" description="Quản lý CCDC" />} />
          <Route path="/accounting/einvoice" element={<ModuleStub name="Hóa đơn điện tử" description="Quản lý HĐĐT" />} />
          <Route path="/accounting/costing" element={<ModuleStub name="Giá thành" description="Tính giá thành" />} />
          <Route path="/accounting/payroll" element={<ModuleStub name="Tiền lương" description="Quản lý bảng lương" />} />
          <Route path="/accounting/recurring" element={<ModuleStub name="Định kỳ" description="Bút toán định kỳ" />} />
          <Route path="/accounting/system" element={<ModuleStub name="Tham số hệ thống" description="Cấu hình hệ thống" />} />

          {/* Tax */}
          <Route path="/accounting/tax" element={<TaxListPage />} />
          <Route path="/accounting/tax/new" element={<TaxDeclarationFormPage />} />
          <Route path="/accounting/tax/:id" element={<TaxDeclarationDetailPage />} />
          <Route path="/accounting/tax/calendar" element={<TaxCalendarPage />} />
          <Route path="/accounting/tax/periods" element={<TaxPeriodManagementPage />} />

          {/* Departments */}
          <Route path="/companies/:companyId/departments" element={<DepartmentsPage />} />
          <Route path="/companies/:companyId/departments/:id" element={<DepartmentDetailPage />} />

          {/* Users */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/new" element={<UserFormPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/users/:id/edit" element={<UserFormPage />} />
          <Route path="/user-groups" element={<UserGroupsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
