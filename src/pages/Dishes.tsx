import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Switch,
  message,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Card,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  imageUrl: string;
  estimatedWaitTime: number;
}

const { Option } = Select;

const Dishes: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState<Dish[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/dishes');
      setDishes(response.data);
    } catch (error) {
      message.error('获取菜品列表失败！');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      await axios.patch(`http://localhost:8080/api/dishes/${id}/toggle-availability`);
      message.success('状态更新成功！');
      fetchDishes();
    } catch (error) {
      message.error('状态更新失败！');
    }
  };

  const handleBatchToggleAvailability = async (available: boolean) => {
    try {
      await Promise.all(
        selectedRows.map((dish) =>
          axios.patch(`http://localhost:8080/api/dishes/${dish.id}/toggle-availability`)
        )
      );
      message.success('批量更新状态成功！');
      fetchDishes();
      setSelectedRows([]);
    } catch (error) {
      message.error('批量更新状态失败！');
    }
  };

  const handleAdd = async (values: any) => {
    try {
      await axios.post('http://localhost:8080/api/dishes', values);
      message.success('添加菜品成功！');
      setIsModalVisible(false);
      form.resetFields();
      fetchDishes();
    } catch (error) {
      message.error('添加菜品失败！');
    }
  };

  const columns: ColumnsType<Dish> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price) => `¥${price.toFixed(2)}`,
    },
    {
      title: '预计等待时间',
      dataIndex: 'estimatedWaitTime',
      key: 'estimatedWaitTime',
      render: (time) => `${time}分钟`,
    },
    {
      title: '状态',
      dataIndex: 'available',
      key: 'available',
      render: (available, record) => (
        <Switch
          checked={available}
          onChange={() => handleToggleAvailability(record.id, available)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => {
            form.setFieldsValue(record);
            setIsModalVisible(true);
          }}>
            编辑
          </Button>
          <Button type="link" danger onClick={async () => {
            try {
              await axios.delete(`http://localhost:8080/api/dishes/${record.id}`);
              message.success('删除成功！');
              fetchDishes();
            } catch (error) {
              message.error('删除失败！');
            }
          }}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="菜品管理" style={{ margin: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索菜品名称"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          添加菜品
        </Button>
        {selectedRows.length > 0 && (
          <>
            <Button onClick={() => handleBatchToggleAvailability(true)}>
              批量上架
            </Button>
            <Button onClick={() => handleBatchToggleAvailability(false)}>
              批量下架
            </Button>
          </>
        )}
      </Space>

      <Table
        columns={columns}
        dataSource={dishes}
        rowKey="id"
        loading={loading}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />

      <Modal
        title={form.getFieldValue('id') ? '编辑菜品' : '添加菜品'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item
            name="name"
            label="菜品名称"
            rules={[{ required: true, message: '请输入菜品名称！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格！' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="estimatedWaitTime"
            label="预计等待时间（分钟）"
            rules={[{ required: true, message: '请输入预计等待时间！' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="available"
            label="是否上架"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Dishes; 