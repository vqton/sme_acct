import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppLayout from './Layout';
import type { AuthState } from '../hooks/useAuth';
import type { Locale } from '../i18n';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: () => mockNavigate };
});

let mockUser: { id: string; username: string; fullName: string } | null = { id: '1', username: 'admin', fullName: 'Admin' };
let mockLocale: Locale = 'vi';
const mockSetLocale = vi.fn((l: Locale) => { mockLocale = l; });
const mockT = vi.fn((key: string) => {
  const map: Record<string, string> = {
    'nav.dashboard': 'Dashboard',
    'nav.companies': 'Công ty',
    'nav.sessions': 'Phiên đăng nhập',
    'nav.2faSetup': 'Thiết lập 2FA',
    'nav.logout': 'Đăng xuất',
  };
  return map[key] ?? key;
});

vi.mock('../hooks/useAuth', () => ({
  useAuth: (): AuthState => ({
    isAuthenticated: !!mockUser,
    user: mockUser,
    pendingCompanies: [],
    pending2FAToken: null,
    login: vi.fn(),
    selectCompany: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  }),
}));

vi.mock('../i18n', () => ({
  useTranslation: () => ({
    locale: mockLocale,
    t: mockT,
    setLocale: mockSetLocale,
  }),
}));

function renderLayout(route = '/accounting/accounts') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppLayout />
    </MemoryRouter>
  );
}

describe('AppLayout', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetLocale.mockClear();
    mockT.mockClear();
  });

  it('renders Vietnamese branding', () => {
    renderLayout();
    expect(screen.getByText('Kế toán SME')).toBeInTheDocument();
  });

  it('renders menu groups in correct VN order', () => {
    renderLayout();
    const submenuTitles = screen.getAllByRole('menuitem');
    const groupLabels = submenuTitles
      .map(el => el.textContent)
      .filter(t => t && ['Danh mục', 'Nghiệp vụ', 'Tổng hợp', 'Báo cáo', 'Hệ thống'].includes(t));
    expect(groupLabels).toEqual(['Danh mục', 'Nghiệp vụ', 'Tổng hợp', 'Báo cáo', 'Hệ thống']);
  });

  it('renders accounting sub-items under Tổng hợp', () => {
    renderLayout();
    expect(screen.getByText('Hệ thống TK')).toBeInTheDocument();
    expect(screen.getByText('Chứng từ')).toBeInTheDocument();
    expect(screen.getByText('Sổ cái')).toBeInTheDocument();
    expect(screen.getByText('Bảng CĐTK')).toBeInTheDocument();
  });

  it('renders module menu items when expanded', async () => {
    renderLayout();
    const nghiepvu = screen.getByText('Nghiệp vụ');
    await userEvent.click(nghiepvu);
    const items = ['Quỹ', 'Ngân hàng', 'Mua hàng', 'Bán hàng', 'Kho', 'TSCĐ', 'CCDC', 'Thuế', 'HĐĐT'];
    items.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('shows current period indicator in header', () => {
    renderLayout();
    expect(screen.getByText(/Kỳ:/)).toBeInTheDocument();
  });

  it('shows active company name in header', () => {
    renderLayout();
    expect(screen.getByText(/Công ty/)).toBeInTheDocument();
  });

  it('shows user name in header', () => {
    renderLayout();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('toggles search modal on Ctrl+K', async () => {
    renderLayout();
    const searchInput = screen.queryByPlaceholderText(/Tìm kiếm/);
    expect(searchInput).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    const searchAfter = screen.queryByPlaceholderText(/Tìm kiếm/);
    expect(searchAfter).toBeInTheDocument();
  });

  it('toggles language between VI and EN', async () => {
    renderLayout();
    mockLocale = 'vi';
    const enBtn = screen.getByText('EN');
    await userEvent.click(enBtn);
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('renders breadcrumb for current route', () => {
    renderLayout('/accounting/accounts');
    const totals = screen.getAllByText('Tổng hợp');
    expect(totals.length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Hệ thống TK').length).toBeGreaterThanOrEqual(1);
  });
});
