import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { I18nProvider } from './i18n';
import ProtectedRoute from './components/ProtectedRoute';
import CompanySelector from './components/CompanySelector';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TwoFactorSetupPage from './pages/TwoFactorSetupPage';
import TwoFactorVerifyPage from './pages/TwoFactorVerifyPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import CompanyFormPage from './pages/CompanyFormPage';
import SessionsPage from './pages/SessionsPage';
import Layout from './components/Layout';
import ChartOfAccountsPage from './pages/ChartOfAccountsPage';
import JournalEntryListPage from './pages/JournalEntryListPage';
import JournalEntryFormPage from './pages/JournalEntryFormPage';
import LedgerPage from './pages/LedgerPage';
import TrialBalancePage from './pages/TrialBalancePage';
import ModuleStub from './pages/ModuleStub';

function AppRoutes() {
  const { pendingCompanies } = useAuth();

  if (pendingCompanies.length > 0) {
    return <CompanySelector />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/2fa/verify" element={<TwoFactorVerifyPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/new" element={<CompanyFormPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/companies/:id/edit" element={<CompanyFormPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/2fa/setup" element={<TwoFactorSetupPage />} />

          {/* Accounting Core */}
          <Route path="/accounting/accounts" element={<ChartOfAccountsPage />} />
          <Route path="/accounting/journal-entries" element={<JournalEntryListPage />} />
          <Route path="/accounting/journal-entries/new" element={<JournalEntryFormPage />} />
          <Route path="/accounting/ledger" element={<LedgerPage />} />
          <Route path="/accounting/trial-balance" element={<TrialBalancePage />} />

          {/* Stub modules — next version */}
          <Route path="/accounting/contacts" element={<ModuleStub name="Danh mục đối tượng" description="Quản lý khách hàng, nhà cung cấp" />} />
          <Route path="/accounting/cash" element={<ModuleStub name="Sổ quỹ tiền mặt" description="Quản lý thu chi tiền mặt, phiếu thu, phiếu chi" />} />
          <Route path="/accounting/bank" element={<ModuleStub name="Tiền gửi ngân hàng" description="Quản lý giao dịch ngân hàng, giấy báo Nợ/Có" />} />
          <Route path="/accounting/purchasing" element={<ModuleStub name="Hóa đơn mua hàng" description="Quản lý hóa đơn mua hàng, chi phí" />} />
          <Route path="/accounting/ap" element={<ModuleStub name="Công nợ phải trả" description="Quản lý công nợ nhà cung cấp" />} />
          <Route path="/accounting/sales" element={<ModuleStub name="Hóa đơn bán hàng" description="Quản lý hóa đơn bán hàng, doanh thu" />} />
          <Route path="/accounting/ar" element={<ModuleStub name="Công nợ phải thu" description="Quản lý công nợ khách hàng, đối chiếu công nợ" />} />
          <Route path="/accounting/inventory" element={<ModuleStub name="Hàng tồn kho" description="Quản lý nhập xuất tồn, định giá hàng tồn kho" />} />
          <Route path="/accounting/fa" element={<ModuleStub name="Tài sản cố định" description="Quản lý TSCĐ, tính khấu hao" />} />
          <Route path="/accounting/ccdc" element={<ModuleStub name="Công cụ dụng cụ" description="Quản lý CCDC, phân bổ" />} />
          <Route path="/accounting/tax" element={<ModuleStub name="Thuế" description="Kê khai thuế GTGT, TNDN, TNCN" />} />
          <Route path="/accounting/einvoice" element={<ModuleStub name="Hóa đơn điện tử" description="Quản lý hóa đơn điện tử, ký số, phát hành" />} />
          <Route path="/accounting/costing" element={<ModuleStub name="Giá thành" description="Tính giá thành sản phẩm, dịch vụ" />} />
          <Route path="/accounting/payroll" element={<ModuleStub name="Tiền lương" description="Quản lý bảng lương, BHXH, BHYT, BHTN" />} />
          <Route path="/accounting/reports" element={<ModuleStub name="Báo cáo tài chính" description="B01-DN, B02-DN, B03-DN, B09-DN và báo cáo quản trị" />} />
          <Route path="/accounting/system" element={<ModuleStub name="Tham số hệ thống" description="Cấu hình hệ thống, tham số kế toán" />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#003366',
          borderRadius: 6,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
      }}
    >
      <AntApp>
        <I18nProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </I18nProvider>
      </AntApp>
    </ConfigProvider>
  );
}
