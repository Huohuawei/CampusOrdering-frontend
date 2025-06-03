import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message, Space, Modal, Typography, Descriptions } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

interface MerchantChange {
  id: number;
  merchantId: number;
  storeName: string;
  ownerName: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
  oldData: {
    storeName: string;
    ownerName: string;
    phone: string;
    address: string;
  };
  newData: {
    storeName: string;
    ownerName: string;
    phone: string;
    address: string;
  };
}

const MerchantReview: React.FC = () => {
  const [changes, setChanges] = useState<MerchantChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [currentChange, setCurrentChange] = useState<MerchantChange | null>(null);

  useEffect(() => {
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/merchants/changes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setChanges(response.data);
    } catch (error) {
      console.error('Error fetching merchant changes:', error);
      message.error('获取商家变更申请失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (changeId: number, approved: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/merchants/changes/${changeId}/review`,
        { approved },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      message.success(approved ? '已通过申请' : '已驳回申请');
      fetchChanges();
    } catch (error) {
      console.error('Error reviewing merchant change:', error);
      message.error('审核操作失败');
    }
  };

  const showDetails = (record: MerchantChange) => {
    setCurrentChange(record);
    setDetailsVisible(true);
  };

  const renderDiff = (oldValue: string, newValue: string) => {
    if (oldValue === newValue) return newValue;
    return (
      <Space direction="vertical">
        <Text delete type="secondary">{oldValue}</Text>
        <Text type="success">{newValue}</Text>
      </Space>
    );
  };

  const columns = [
    {
      title: '申请ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '商家ID',
      dataIndex: 'merchantId',
      key: 'merchantId',
    },
    {
      title: '店铺名称',
      dataIndex: 'storeName',
      key: 'storeName',
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: { [key: string]: string } = {
          'PENDING': '待审核',
          'APPROVED': '已通过',
          'REJECTED': '已驳回'
        };
        return statusMap[status] || status;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: MerchantChange) => (
        <Space size="middle">
          <Button type="link" onClick={() => showDetails(record)}>
            查看详情
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleReview(record.id, true)}
              >
                通过
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReview(record.id, false)}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="商家审核">
        <Table
          columns={columns}
          dataSource={changes}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="变更详情"
        visible={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {currentChange && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="店铺名称">
              {renderDiff(currentChange.oldData.storeName, currentChange.newData.storeName)}
            </Descriptions.Item>
            <Descriptions.Item label="店主姓名">
              {renderDiff(currentChange.oldData.ownerName, currentChange.newData.ownerName)}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {renderDiff(currentChange.oldData.phone, currentChange.newData.phone)}
            </Descriptions.Item>
            <Descriptions.Item label="店铺地址">
              {renderDiff(currentChange.oldData.address, currentChange.newData.address)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MerchantReview; 