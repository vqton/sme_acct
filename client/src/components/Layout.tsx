import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Space, Dropdown, theme } from 'antd';
import {
  DashboardOutlined, BankOutlined, TeamOutlined, SafetyOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, UserOutlined,
  AccountBookOutlined, FileTextOutlined, BookOutlined,
  DollarOutlined, BarcodeOutlined, ToolOutlined,
  CarOutlined, CalculatorOutlined, AuditOutlined,
  KeyOutlined, ApartmentOutlined,
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../i18n';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: t('nav.dashboard') },
    {
      key: 'accounting', icon: <AccountBookOutlined />, label: 'Kế toán',
      children: [
        { key: '/accounting/accounts', icon: <BookOutlined />, label: 'Hệ thống TK' },
        { key: '/accounting/journal-entries', icon: <FileTextOutlined />, label: 'Chứng từ' },
        { key: '/accounting/ledger', icon: <CalculatorOutlined />, label: 'Sổ chi tiết' },
        { key: '/accounting/trial-balance', icon: <AuditOutlined />, label: 'Bảng CĐTK' },
      ],
    },
    {
      key: 'cash', icon: <DollarOutlined />, label: 'Quỹ',
      children: [
        { key: '/accounting/cash', icon: <DollarOutlined />, label: 'Sổ quỹ tiền mặt' },
        { key: '/accounting/bank', icon: <BankOutlined />, label: 'Sổ tiền gửi NH' },
      ],
    },
    {
      key: 'sales', icon: <BarcodeOutlined />, label: 'Bán hàng',
      children: [
        { key: '/accounting/sales', icon: <BarcodeOutlined />, label: 'Hóa đơn bán hàng' },
        { key: '/accounting/ar', icon: <TeamOutlined />, label: 'Công nợ phải thu' },
      ],
    },
    {
      key: 'purchasing', icon: <ApartmentOutlined />, label: 'Mua hàng',
      children: [
        { key: '/accounting/purchasing', icon: <ApartmentOutlined />, label: 'Hóa đơn mua hàng' },
        { key: '/accounting/ap', icon: <TeamOutlined />, label: 'Công nợ phải trả' },
      ],
    },
    {
      key: 'assets', icon: <CarOutlined />, label: 'TSCĐ & CCDC',
      children: [
        { key: '/accounting/fa', icon: <CarOutlined />, label: 'Tài sản cố định' },
        { key: '/accounting/ccdc', icon: <ToolOutlined />, label: 'CCDC' },
      ],
    },
    {
      key: 'inventory', icon: <BarcodeOutlined />, label: 'Kho & Giá thành',
      children: [
        { key: '/accounting/inventory', icon: <BarcodeOutlined />, label: 'Hàng tồn kho' },
        { key: '/accounting/costing', icon: <CalculatorOutlined />, label: 'Giá thành' },
      ],
    },
    {
      key: 'hr', icon: <TeamOutlined />, label: 'Lương & Thuế',
      children: [
        { key: '/accounting/payroll', icon: <UserOutlined />, label: 'Tiền lương' },
        { key: '/accounting/tax', icon: <SafetyOutlined />, label: 'Thuế' },
      ],
    },
    { key: '/companies', icon: <BankOutlined />, label: t('nav.companies') },
    { key: '/sessions', icon: <KeyOutlined />, label: t('nav.sessions') },
    { key: '/2fa/setup', icon: <SafetyOutlined />, label: t('nav.2faSetup') },
  ];

  const findSelectedKey = () => {
    const path = location.pathname;
    for (const item of menuItems) {
      if ('children' in item && item.children) {
        const child = item.children.find((c: any) => c.key === path);
        if (child) return [item.key, path];
      }
      if (item.key === path) return [path];
    }
    return ['/'];
  };

  const selectedKeys = findSelectedKey();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark"
        style={{ background: '#001529' }}>
        <div style={{ height: 32, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!collapsed && (
            <Typography.Text strong style={{ color: 'white', fontSize: 16 }}>
              SME Accounting
            </Typography.Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={['accounting']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)} />
          </Space>
          <Space>
            <Button type="text" onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}>
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
        <Content style={{ margin: 24, padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
