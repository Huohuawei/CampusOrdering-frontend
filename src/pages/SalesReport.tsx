import React, { useEffect, useState } from 'react';
import { Table, Card, Space, message } from 'antd';
import axios from 'axios';

interface OrderItem {
  id: number;
  dish: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface OrderData {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  merchant: {
    storeName: string;
  };
  orderItems: OrderItem[];
}

const SalesReport: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // 添加token到请求头
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Orders response:', response.data);
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        message.error('获取订单数据格式错误');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('获取订单数据失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '商家名称',
      dataIndex: ['merchant', 'storeName'],
      key: 'merchantName',
      render: (text: string, record: OrderData) => 
        record.merchant?.storeName || '未知商家'
    },
    {
      title: '订单总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `¥${(price || 0).toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: { [key: string]: string } = {
          PENDING: '待处理',
          PROCESSING: '处理中',
          COMPLETED: '已完成',
          CANCELED: '已取消'
        };
        return statusMap[status] || status;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => time ? new Date(time).toLocaleString() : '未知时间'
    },
  ];

  const calculateTotalSales = () => {
    return orders
      .filter(order => order.status === 'COMPLETED')
      .reduce((total, order) => total + (order.totalPrice || 0), 0)
      .toFixed(2);
  };

  const expandedRowRender = (record: OrderData) => {
    const itemColumns = [
      {
        title: '菜品名称',
        dataIndex: ['dish', 'name'],
        key: 'dishName',
        render: (text: string, record: OrderItem) => 
          record.dish?.name || '未知菜品'
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        key: 'quantity',
      },
      {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        render: (price: number) => `¥${(price || 0).toFixed(2)}`,
      },
      {
        title: '小计',
        key: 'subtotal',
        render: (text: any, record: OrderItem) => 
          `¥${((record.price || 0) * (record.quantity || 0)).toFixed(2)}`,
      },
    ];

    return (
      <Table
        columns={itemColumns}
        dataSource={record.orderItems || []}
        pagination={false}
        rowKey="id"
      />
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card title="销售统计">
          <h3>总销售额: ¥{calculateTotalSales()}</h3>
        </Card>

        <Card title="订单明细">
          <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            rowKey="id"
            expandable={{
              expandedRowRender,
              defaultExpandAllRows: false,
            }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default SalesReport; 