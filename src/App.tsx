import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import { DashboardOutlined, ShopOutlined, UserOutlined, AuditOutlined } from '@ant-design/icons';
import Login from './pages/Login';
import Dishes from './pages/Dishes';
import SalesReport from './pages/SalesReport';
import MerchantManagement from './pages/MerchantManagement';
import MerchantReview from './pages/MerchantReview';
import 'antd/dist/antd.css';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div className="logo" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<ShopOutlined />}>
            <Link to="/dishes">菜品管理</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<DashboardOutlined />}>
            <Link to="/sales-report">销售报表</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>
            <Link to="/merchants">商家管理</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<AuditOutlined />}>
            <Link to="/merchant-review">商家审核</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff' }}>
          <Title level={3} style={{ margin: '16px 0' }}>校园点餐系统后台</Title>
        </Header>
        <Content style={{ margin: '24px', padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dishes"
          element={
            <PrivateRoute>
              <AdminLayout>
                <Dishes />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales-report"
          element={
            <PrivateRoute>
              <AdminLayout>
                <SalesReport />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/merchants"
          element={
            <PrivateRoute>
              <AdminLayout>
                <MerchantManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/merchant-review"
          element={
            <PrivateRoute>
              <AdminLayout>
                <MerchantReview />
              </AdminLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
