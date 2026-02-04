import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Input, Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MagnifyingGlassIcon, GiftIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface GiftCard {
  key: string;
  recipient: string;
  cardTitle: string;
  createdDate: string;
  giftAmount: number;
  marketingTag: string;
  status: 'NOT SENT' | 'RECEIVED' | 'PENDING';
}

const GiftManagement: React.FC = () => {
  const router = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('created');
  const [searchValue, setSearchValue] = useState<string>('');

  const createdGifts: GiftCard[] = [
    {
      key: '1',
      recipient: 'Ray Widwan',
      cardTitle: 'Greeting',
      createdDate: 'Jan 20, 2025',
      giftAmount: 500,
      marketingTag: 'Employee Welcome',
      status: 'NOT SENT',
    },
    {
      key: '2',
      recipient: 'Daisy Widwan',
      cardTitle: 'Yay, New Job',
      createdDate: 'Jan 10, 2024',
      giftAmount: 1000,
      marketingTag: 'Good Job',
      status: 'RECEIVED',
    },
    {
      key: '3',
      recipient: 'J.J',
      cardTitle: 'Happy Beeday',
      createdDate: 'Jan 1, 2023',
      giftAmount: 1000,
      marketingTag: 'Birthday',
      status: 'RECEIVED',
    },
  ];

  const receivedGifts: GiftCard[] = [
    {
      key: '1',
      recipient: 'You',
      cardTitle: 'Welcome Gift',
      createdDate: 'Feb 1, 2025',
      giftAmount: 250,
      marketingTag: 'Welcome',
      status: 'RECEIVED',
    },
  ];

  const columns: ColumnsType<GiftCard> = [
    {
      title: 'Recipient',
      dataIndex: 'recipient',
      key: 'recipient',
      render: (text: string) => <span className="text-gray-700 font-medium">{text}</span>,
    },
    {
      title: 'Card Title',
      dataIndex: 'cardTitle',
      key: 'cardTitle',
      render: (text: string) => <span className="text-purple-600">{text}</span>,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: 'Gift Amount',
      dataIndex: 'giftAmount',
      key: 'giftAmount',
      render: (amount: number) => <span className="text-gray-700">{amount.toLocaleString()}</span>,
    },
    {
      title: 'Marketing Tag',
      dataIndex: 'marketingTag',
      key: 'marketingTag',
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          className={`font-medium ${
            status === 'NOT SENT' ? 'text-gray-500' : status === 'RECEIVED' ? 'text-gray-500' : 'text-yellow-600'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.status === 'NOT SENT' && (
            <Button
              type="primary"
              size="middle"
              className="rounded-full font-semibold text-xs uppercase tracking-wide px-6"
              style={{
                background: 'linear-gradient(135deg, #e879a8 0%, #d4a5ff 100%)',
                border: 'none',
                borderRadius: '20px',
                height: '32px',
              }}
            >
              Send
            </Button>
          )}
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  const filteredData = (activeTab === 'created' ? createdGifts : receivedGifts).filter(
    (gift) =>
      gift.recipient.toLowerCase().includes(searchValue.toLowerCase()) ||
      gift.cardTitle.toLowerCase().includes(searchValue.toLowerCase()) ||
      gift.marketingTag.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Card Container */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('created')}
                className={`flex-1 py-4 px-6 text-center text-lg font-semibold transition-all relative ${
                  activeTab === 'created'
                    ? 'text-gray-800 bg-white'
                    : 'text-gray-400 bg-gray-50 hover:text-gray-600'
                }`}
              >
                Created
                {activeTab === 'created' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('received')}
                className={`flex-1 py-4 px-6 text-center text-lg font-semibold transition-all relative ${
                  activeTab === 'received'
                    ? 'text-gray-800 bg-white'
                    : 'text-gray-400 bg-gray-50 hover:text-gray-600'
                }`}
              >
                Received
                {activeTab === 'received' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 md:p-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Send A Gift Button */}
              <Button
                type="primary"
                size="large"
                icon={<GiftIcon className="w-5 h-5" />}
                className="flex items-center gap-2 h-11 px-6 rounded-full font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #e879a8 0%, #d4a5ff 100%)',
                  border: 'none',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => router("/sendgift")}
              >
                Send A Gift
              </Button>

              {/* Search Input */}
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Search Cards"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  prefix={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
                  className="h-11 rounded-full border-gray-200 hover:border-purple-300 focus:border-purple-400"
                  style={{ borderRadius: '24px' }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                dataSource={filteredData}
                pagination={false}
                className="gift-table"
                rowClassName={(_, index) => (index % 2 === 0 ? 'bg-gray-50' : 'bg-white')}
              />
            </div>

            {/* Show More Link */}
            <div className="mt-4">
              <button className="text-purple-500 hover:text-purple-600 font-medium text-sm flex items-center gap-1 transition-colors">
                Show More
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .gift-table .ant-table {
          background: transparent;
        }
        
        .gift-table .ant-table-thead > tr > th {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb;
          color: #6b7280;
          font-weight: 600;
          font-size: 13px;
          padding: 12px 16px;
        }
        
        .gift-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6;
          padding: 16px;
          font-size: 14px;
        }
        
        .gift-table .ant-table-tbody > tr:hover > td {
          background: #faf5ff !important;
        }
        
        .gift-table .ant-table-tbody > tr.bg-gray-50 > td {
          background: #f9fafb;
        }
        
        .gift-table .ant-table-tbody > tr.bg-white > td {
          background: white;
        }
        
        .ant-input {
          border-radius: 24px !important;
        }
        
        .ant-input-affix-wrapper {
          border-radius: 24px !important;
          padding-left: 16px;
        }
        
        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          border-color: #d4a5ff !important;
          box-shadow: 0 0 0 2px rgba(212, 165, 255, 0.1) !important;
        }
        
        .ant-btn-primary:hover {
          opacity: 0.9;
        }
        
        .ant-table-cell {
          vertical-align: middle;
        }

        @media (max-width: 768px) {
          .gift-table .ant-table-thead > tr > th,
          .gift-table .ant-table-tbody > tr > td {
            padding: 12px 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default GiftManagement;
