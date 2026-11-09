import { BookOutlined, TeamOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { key: '/classes', icon: <BookOutlined />, label: <Link to="/classes">Classes</Link> },
  { key: '/teachers', icon: <TeamOutlined />, label: <Link to="/teachers">Teachers</Link> },
];

export function AppLayout() {
  const { pathname } = useLocation();
  const selectedKey = navItems.find((item) => pathname.startsWith(item.key))?.key;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header className="app-header">
        <Link to="/classes" className="app-brand" aria-label="School Admin home">
          <BookOutlined className="app-brand-icon" aria-hidden />
          <span className="app-brand-text">School Admin</span>
        </Link>
        <nav aria-label="Main" className="app-nav">
          <Menu mode="horizontal" selectedKeys={selectedKey ? [selectedKey] : []} items={navItems} />
        </nav>
      </Layout.Header>
      <Layout.Content>
        <main className="app-content">
          <Outlet />
        </main>
      </Layout.Content>
    </Layout>
  );
}
