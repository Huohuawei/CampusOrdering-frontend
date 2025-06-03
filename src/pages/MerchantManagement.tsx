import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message, Space, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Merchant {
  id: number;
  storeName: string;
  ownerName: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
}

const MerchantManagement: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/merchants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setMerchants(response.data);
    } catch (error) {
      console.error('Error fetching merchants:', error);
      message.error('获取商家数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (merchantId: number, newStatus: string) => {
    Modal.confirm({
      title: '确认操作',
      icon: <ExclamationCircleOutlined />,
      content: `确定要${newStatus === 'DISABLED' ? '禁用' : '启用'}该商家吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.put(`http://localhost:8080/api/merchants/${merchantId}/status`, 
            { status: newStatus },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          message.success('状态更新成功');
          fetchMerchants();
        } catch (error) {
          console.error('Error updating merchant status:', error);
          message.error('更新商家状态失败');
        }
      }
    });
  };

  const columns = [
    {
      title: '商家ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '店铺名称',
      dataIndex: 'storeName',
      key: 'storeName',
    },
    {
      title: '店主姓名',
      dataIndex: 'ownerName',
      key: 'ownerName',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '店铺地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: { [key: string]: string } = {
          'ACTIVE': '正常营业',
          'DISABLED': '已禁用',
          'PENDING': '待审核'
        };
        return statusMap[status] || status;
      }
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Merchant) => (
        <Space size="middle">
          <Button 
            type={record.status === 'ACTIVE' ? 'default' : 'primary'}
            onClick={() => handleStatusChange(record.id, record.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')}
          >
            {record.status === 'ACTIVE' ? '禁用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="商家管理">
        <Table
          columns={columns}
          dataSource={merchants}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default MerchantManagement; 