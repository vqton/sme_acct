import { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout, Menu, Button, Typography, Space, Dropdown, theme, Modal, Input, Breadcrumb, Tag
} from 'antd';
import {
  BankOutlined, TeamOutlined, SafetyOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, UserOutlined,
  AccountBookOutlined, FileTextOutlined, BookOutlined,
  DollarOutlined, ToolOutlined,
  CarOutlined, CalculatorOutlined, AuditOutlined,
  KeyOutlined, ApartmentOutlined, SearchOutlined, BarcodeOutlined,
  DatabaseOutlined, SettingOutlined, FileProtectOutlined,
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../i18n';

const { Header, Sider, Content } = Layout;

const MODULE_ROUTES: Record<string, { label: string; group: string }> = {
  '/accounting/accounts': { label: 'Hệ thống TK', group: 'Tổng hợp' },
  '/accounting/journal-entries': { label: 'Chứng từ', group: 'Tổng hợp' },
  '/accounting/journal-entries/new': { label: 'Thêm chứng từ', group: 'Tổng hợp' },
  '/accounting/ledger': { label: 'Sổ cái', group: 'Tổng hợp' },
  '/accounting/trial-balance': { label: 'Bảng CĐTK', group: 'Tổng hợp' },
  '/accounting/cash': { label: 'Sổ quỹ tiền mặt', group: 'Quỹ' },
  '/accounting/bank': { label: 'Tiền gửi NH', group: 'Ngân hàng' },
  '/accounting/sales': { label: 'Hóa đơn bán hàng', group: 'Bán hàng' },
  '/accounting/ar': { label: 'Công nợ phải thu', group: 'Bán hàng' },
  '/accounting/purchasing': { label: 'Hóa đơn mua hàng', group: 'Mua hàng' },
  '/accounting/ap': { label: 'Công nợ phải trả', group: 'Mua hàng' },
  '/accounting/fa': { label: 'Tài sản cố định', group: 'TSCĐ' },
  '/accounting/ccdc': { label: 'CCDC', group: 'CCDC' },
  '/accounting/inventory': { label: 'Hàng tồn kho', group: 'Kho' },
  '/accounting/costing': { label: 'Giá thành', group: 'Giá thành' },
  '/accounting/payroll': { label: 'Tiền lương', group: 'Tiền lương' },
  '/accounting/tax': { label: 'Thuế', group: 'Thuế' },
  '/accounting/einvoice': { label: 'Hóa đơn điện tử', group: 'HĐĐT' },
  '/accounting/contacts': { label: 'Đối tượng', group: 'Danh mục' },
  '/accounting/reports': { label: 'Báo cáo tài chính', group: 'Báo cáo' },
  '/accounting/system': { label: 'Tham số hệ thống', group: 'Hệ thống' },
  '/companies': { label: 'Công ty', group: 'Hệ thống' },
  '/sessions': { label: 'Phiên đăng nhập', group: 'Hệ thống' },
  '/2fa/setup': { label: 'Thiết lập 2FA', group: 'Hệ thống' },
};

const menuItems = [
  {
    key: 'danhmuc', icon: <DatabaseOutlined />, label: 'Danh mục',
    children: [
      { key: '/accounting/accounts', icon: <BookOutlined />, label: 'Hệ thống TK' },
      { key: '/accounting/contacts', icon: <TeamOutlined />, label: 'Đối tượng (KH, NCC)' },
    ],
  },
  {
    key: 'nghiepvu', icon: <FileTextOutlined />, label: 'Nghiệp vụ',
    children: [
      { key: '/accounting/cash', icon: <DollarOutlined />, label: 'Quỹ' },
      { key: '/accounting/bank', icon: <BankOutlined />, label: 'Ngân hàng' },
      { key: '/accounting/purchasing', icon: <ApartmentOutlined />, label: 'Mua hàng' },
      { key: '/accounting/sales', icon: <BarcodeOutlined />, label: 'Bán hàng' },
      { key: '/accounting/inventory', icon: <BarcodeOutlined />, label: 'Kho' },
      { key: '/accounting/fa', icon: <CarOutlined />, label: 'TSCĐ' },
      { key: '/accounting/ccdc', icon: <ToolOutlined />, label: 'CCDC' },
      { key: '/accounting/tax', icon: <SafetyOutlined />, label: 'Thuế' },
      { key: '/accounting/einvoice', icon: <FileProtectOutlined />, label: 'HĐĐT' },
    ],
  },
  {
    key: 'tonghop', icon: <AccountBookOutlined />, label: 'Tổng hợp',
    children: [
      { key: '/accounting/journal-entries', icon: <FileTextOutlined />, label: 'Chứng từ' },
      { key: '/accounting/ledger', icon: <CalculatorOutlined />, label: 'Sổ cái' },
      { key: '/accounting/trial-balance', icon: <AuditOutlined />, label: 'Bảng CĐTK' },
    ],
  },
  {
    key: 'baocao', icon: <AuditOutlined />, label: 'Báo cáo',
    children: [
      { key: '/accounting/reports', icon: <FileTextOutlined />, label: 'BCTC' },
      { key: '/accounting/tax', icon: <SafetyOutlined />, label: 'Báo cáo thuế' },
    ],
  },
  {
    key: 'hethong', icon: <SettingOutlined />, label: 'Hệ thống',
    children: [
      { key: '/accounting/system', icon: <SettingOutlined />, label: 'Tham số' },
      { key: '/companies', icon: <BankOutlined />, label: 'Công ty' },
      { key: '/sessions', icon: <KeyOutlined />, label: 'Phiên đ.nhập' },
      { key: '/2fa/setup', icon: <SafetyOutlined />, label: 'Xác thực 2 lớp' },
    ],
  },
];

const SEARCH_ITEMS = [
  { key: '/accounting/accounts', label: 'Hệ thống tài khoản' },
  { key: '/accounting/journal-entries', label: 'Chứng từ kế toán' },
  { key: '/accounting/contacts', label: 'Danh mục đối tượng' },
  { key: '/accounting/cash', label: 'Sổ quỹ tiền mặt' },
  { key: '/accounting/bank', label: 'Tiền gửi ngân hàng' },
  { key: '/accounting/reports', label: 'Báo cáo tài chính' },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const findRouteMeta = useCallback((path: string) => {
    const exact = MODULE_ROUTES[path];
    if (exact) return exact;
    const parent = Object.entries(MODULE_ROUTES).find(([k]) => path.startsWith(k));
    return parent?.[1] ?? null;
  }, []);

  const routeMeta = findRouteMeta(location.pathname);
  const breadcrumbItems = routeMeta
    ? [{ title: routeMeta.group }, { title: routeMeta.label }]
    : [{ title: 'Dashboard' }];

  const currentMonth = new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });

  const filteredSearch = searchQuery
    ? SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : SEARCH_ITEMS;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark"
        style={{ background: '#001529' }}>
        <div style={{ height: 40, margin: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!collapsed && (
            <Typography.Text strong style={{ color: 'white', fontSize: 16 }}>
              Kế toán SME
            </Typography.Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['tonghop']}
          items={menuItems}
          onClick={({ key }) => { navigate(key); }}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 16px', background: colorBgContainer,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 56, borderBottom: '1px solid #f0f0f0'
        }}>
          <Space size="middle">
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)} />
            <Tag color="blue" style={{ margin: 0 }}>Kỳ: T{currentMonth}</Tag>
            <Tag icon={<BankOutlined />} style={{ margin: 0 }}>
              Công ty mặc định
            </Tag>
            <Breadcrumb items={breadcrumbItems} />
          </Space>
          <Space>
            <Button type="text" icon={<SearchOutlined />}
              onClick={() => setSearchOpen(true)}
            >
              {!collapsed && 'Ctrl+K'}
            </Button>
            <Button type="text" onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')} size="small">
              {locale === 'vi' ? 'EN' : 'VI'}
            </Button>
            <Dropdown menu={{
              items: [
                { key: 'user', label: `${user?.fullName} (@${user?.username})`, disabled: true },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: t('nav.logout'), onClick: async () => { await logout(); navigate('/login'); } },
              ],
            }}>
              <Button type="text" icon={<UserOutlined />}>{user?.fullName}</Button>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 16, padding: 16, background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>

      <Modal
        title="Tìm kiếm nhanh"
        open={searchOpen}
        onCancel={() => { setSearchOpen(false); setSearchQuery(''); }}
        footer={null}
        width={480}
      >
        <Input
          placeholder="Tìm kiếm module, chức năng..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoFocus
          style={{ marginBottom: 12 }}
        />
        {filteredSearch.map(item => (
          <div
            key={item.key}
            style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => { navigate(item.key); setSearchOpen(false); setSearchQuery(''); }}
          >
            {item.label}
          </div>
        ))}
      </Modal>
    </Layout>
  );
}
