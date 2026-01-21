import React, { useState } from 'react';
import { Button, Table, Input, Modal } from 'antd';
import { PlusOutlined, EllipsisOutlined } from '@ant-design/icons';

interface Transaction {
  transactionId: string;
  amount: number;
  date: string;
}

interface GivingFundReceived {
  amount: number;
  from: string;
}

interface BespokeFund {
  name: string;
  createdDate: string;
  donatedAmount: number;
  availableAmount: number;
  percentageFunded: number;
}

interface MatchingFund {
  name: string;
  createdDate: string;
  donatedAmount: number;
  availableAmount: number;
  percentageFunded: number;
}

const MyGivingFund: React.FC = () => {
  const [giftCode, setGiftCode] = useState('');
  const [isCreateBespokeModalOpen, setIsCreateBespokeModalOpen] = useState(false);
  const [isCreateMatchingModalOpen, setIsCreateMatchingModalOpen] = useState(false);
  const [bespokeTokenName, setBespokeTokenName] = useState('');
  const [bespokeAmount, setBespokeAmount] = useState('');
  const [matchingFundName, setMatchingFundName] = useState('');
  const [matchingAmount, setMatchingAmount] = useState('');

  const transactions: Transaction[] = [
    { transactionId: '#TXN003', amount: 500, date: 'Jan 15, 2024' },
    { transactionId: '#TXN002', amount: 300, date: 'Jan 10, 2024' },
    { transactionId: '#TXN001', amount: 200, date: 'Jan 5, 2024' },
  ];

  const givingFundsReceived: GivingFundReceived[] = [
    { amount: 1000, from: 'from QR Giving Fund' },
    { amount: 500, from: 'from John Doe Giving Fund' },
    { amount: 300, from: 'from CK Matching Fund' },
  ];

  const bespokeFunds: BespokeFund[] = [
    { name: 'Total Bespoke Giving Funds', createdDate: '', donatedAmount: 0, availableAmount: 0, percentageFunded: 0 },
    { name: "Daisy's Giving Fund", createdDate: 'Jan 20, 2025', donatedAmount: 500, availableAmount: 2000, percentageFunded: 50 },
    { name: "Daisy's Family Giving Fund", createdDate: 'Jan 19, 2024', donatedAmount: 1000, availableAmount: 2000, percentageFunded: 50 },
    { name: "Daisy's 2023 Giving Fund", createdDate: 'Jan 1, 2023', donatedAmount: 500, availableAmount: 1000, percentageFunded: 50 },
  ];

  const matchingFunds: MatchingFund[] = [
    { name: 'Total Matching Funds', createdDate: '', donatedAmount: 2000, availableAmount: 5000, percentageFunded: 0 },
    { name: "Daisy's Matching Fund", createdDate: 'Jan 20, 2025', donatedAmount: 500, availableAmount: 2000, percentageFunded: 50 },
    { name: "Daisy's Family Matching Fund", createdDate: 'Jan 19, 2024', donatedAmount: 1000, availableAmount: 2000, percentageFunded: 33 },
    { name: "Daisy's 2023 Matching Fund", createdDate: 'Jan 1, 2023', donatedAmount: 500, availableAmount: 1000, percentageFunded: 100 },
  ];

  const transactionColumns = [
    { 
      title: 'Transaction ID', 
      dataIndex: 'transactionId', 
      key: 'transactionId',
      width: '25%'
    },
    { 
      title: 'Amount', 
      dataIndex: 'amount', 
      key: 'amount', 
      render: (val: number) => `$${val}`,
      width: '25%'
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date',
      width: '25%'
    },
    { 
      title: 'Tax Receipt', 
      key: 'receipt',
      width: '25%',
      render: () => <span className="text-gray-400 cursor-pointer hover:text-purple-600">View</span>
    },
  ];

  const bespokeColumns = [
    { 
      title: 'Fund Token Name', 
      dataIndex: 'name', 
      key: 'name'
    },
    { 
      title: 'Created Date', 
      dataIndex: 'createdDate', 
      key: 'createdDate',
      render: (val: string) => val || '-'
    },
    { 
      title: 'Donated Amount', 
      dataIndex: 'donatedAmount', 
      key: 'donatedAmount', 
      render: (val: number, record: BespokeFund) => record.name === 'Total Bespoke Giving Funds' ? '-' : val
    },
    { 
      title: 'Available Amount', 
      dataIndex: 'availableAmount', 
      key: 'availableAmount', 
      render: (val: number, record: BespokeFund) => record.name === 'Total Bespoke Giving Funds' ? '-' : val.toLocaleString()
    },
    { 
      title: 'Percentage Funded', 
      dataIndex: 'percentageFunded', 
      key: 'percentageFunded', 
      render: (val: number, record: BespokeFund) => record.name === 'Total Bespoke Giving Funds' ? '-' : `${val}%`
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: BespokeFund) => 
        record.name !== 'Total Bespoke Giving Funds' ? (
          <Button type="primary" size="small">Increase Funding</Button>
        ) : null
    },
  ];

  const matchingColumns = [
    { 
      title: 'Fund Token Name', 
      dataIndex: 'name', 
      key: 'name'
    },
    { 
      title: 'Created Date', 
      dataIndex: 'createdDate', 
      key: 'createdDate',
      render: (val: string) => val || '-'
    },
    { 
      title: 'Donated Amount', 
      dataIndex: 'donatedAmount', 
      key: 'donatedAmount', 
      render: (val: number) => val
    },
    { 
      title: 'Available Amount', 
      dataIndex: 'availableAmount', 
      key: 'availableAmount', 
      render: (val: number) => val.toLocaleString()
    },
    { 
      title: 'Percentage Funded', 
      dataIndex: 'percentageFunded', 
      key: 'percentageFunded', 
      render: (val: number, record: MatchingFund) => record.name === 'Total Matching Funds' ? '-' : `${val}%`
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: MatchingFund) => 
        record.name !== 'Total Matching Funds' ? (
          <Button type="primary" size="small">Increase Funding</Button>
        ) : null
    },
  ];

  const handleCreateBespoke = () => {
    if (bespokeTokenName && bespokeAmount) {
      console.log('Creating Bespoke Token:', { tokenName: bespokeTokenName, amount: bespokeAmount });
      setIsCreateBespokeModalOpen(false);
      setBespokeTokenName('');
      setBespokeAmount('');
    }
  };

  const handleCreateMatching = () => {
    if (matchingFundName && matchingAmount) {
      console.log('Creating Matching Token:', { fundName: matchingFundName, amount: matchingAmount });
      setIsCreateMatchingModalOpen(false);
      setMatchingFundName('');
      setMatchingAmount('');
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 max-w-4xl mx-auto">
      {/* General Giving Fund */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-gray-800 text-lg font-semibold mb-3">General Giving Fund</h2>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-purple-600">$1,000</p>
            </div>
          </div>
          <Button type="primary" icon={<PlusOutlined />} size="small">
            Add
          </Button>
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <h3 className="text-gray-400 text-xs uppercase mb-3">Recent Transactions</h3>
          <Table 
            columns={transactionColumns} 
            dataSource={transactions} 
            pagination={false}
            rowKey="transactionId"
            size="small"
            className="transactions-table"
          />
          <Button type="link" className="text-purple-600 mt-2 px-0 text-sm">
            Show All Transactions →
          </Button>
        </div>

        {/* Giving Funds Received */}
        <div className="mb-8">
          <h3 className="text-gray-400 text-xs uppercase mb-3">Giving Funds Received</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {givingFundsReceived.map((fund, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-2xl font-bold text-purple-600 mb-1">${fund.amount.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">{fund.from}</p>
                  </div>
                  <Button type="text" icon={<EllipsisOutlined />} size="small" className="text-gray-400" />
                </div>
                <Button type="primary" size="small" block className="mb-2">
                  Donate
                </Button>
                <button className="w-full text-center text-gray-400 text-sm hover:text-purple-600">
                  Gift
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem Gift Code */}
        <div>
          <h3 className="text-gray-400 text-xs uppercase mb-3">Redeem Gift Code</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter gift code"
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              className="flex-1"
            />
            <Button type="primary">
              Redeem
            </Button>
          </div>
        </div>
      </div>

      {/* Bespoke Giving Fund */}
      <div className="mb-8">
        <h2 className="text-gray-800 text-lg font-semibold mb-4">Bespoke Giving Fund</h2>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <Table 
            columns={bespokeColumns} 
            dataSource={bespokeFunds}
            pagination={false}
            rowKey="name"
            size="small"
            className="bespoke-table"
            rowClassName={(record) => record.name === 'Total Bespoke Giving Funds' ? 'font-semibold' : ''}
          />
          <Button type="link" className="text-purple-600 mt-2 px-0 text-sm">
            Show All Tokens →
          </Button>

          {/* Create New Bespoke */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
            <h4 className="text-gray-400 text-xs uppercase mb-3">Create New Bespoke Giving Fund Token</h4>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input placeholder="Token Name (e.g., DK Giving Fund)" className="flex-1" />
              <Input placeholder="Amount" className="flex-1" />
            </div>
            <Button 
              type="primary"
              block
              className="mt-3"
              onClick={() => setIsCreateBespokeModalOpen(true)}
            >
              Create My Own Giving Fund Token
            </Button>
          </div>
        </div>
      </div>

      {/* Matching Fund */}
      <div className="mb-8">
        <h2 className="text-gray-800 text-lg font-semibold mb-4">Matching Fund</h2>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <Table 
            columns={matchingColumns} 
            dataSource={matchingFunds}
            pagination={false}
            rowKey="name"
            size="small"
            className="matching-table"
            rowClassName={(record) => record.name === 'Total Matching Funds' ? 'font-semibold' : ''}
          />
          <Button type="link" className="text-purple-600 mt-2 px-0 text-sm">
            Show All Matching Funds →
          </Button>

          {/* Create New Matching */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-gray-400 text-xs uppercase mb-3">Create New Matching Giving Fund Token</h4>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input placeholder="Fund Name (e.g., Employee Match)" className="flex-1" />
              <Input placeholder="Amount" className="flex-1" />
            </div>
            <Button 
              type="primary"
              block
              className="mt-3"
              onClick={() => setIsCreateMatchingModalOpen(true)}
            >
              Create My Matching Fund Token
            </Button>
          </div>
        </div>
      </div>

      {/* Create Bespoke Modal */}
      <Modal
        title="Create Bespoke Giving Fund Token"
        open={isCreateBespokeModalOpen}
        onCancel={() => {
          setIsCreateBespokeModalOpen(false);
          setBespokeTokenName('');
          setBespokeAmount('');
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setIsCreateBespokeModalOpen(false);
              setBespokeTokenName('');
              setBespokeAmount('');
            }}
          >
            Cancel
          </Button>,
          <Button 
            key="create" 
            type="primary" 
            onClick={handleCreateBespoke}
          >
            Create Token
          </Button>,
        ]}
      >
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Token Name</label>
            <Input 
              placeholder="Enter token name" 
              size="large"
              value={bespokeTokenName}
              onChange={(e) => setBespokeTokenName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <Input 
              placeholder="Enter amount" 
              size="large"
              value={bespokeAmount}
              onChange={(e) => setBespokeAmount(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Create Matching Modal */}
      <Modal
        title="Create Matching Fund Token"
        open={isCreateMatchingModalOpen}
        onCancel={() => {
          setIsCreateMatchingModalOpen(false);
          setMatchingFundName('');
          setMatchingAmount('');
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setIsCreateMatchingModalOpen(false);
              setMatchingFundName('');
              setMatchingAmount('');
            }}
          >
            Cancel
          </Button>,
          <Button 
            key="create" 
            type="primary" 
            onClick={handleCreateMatching}
          >
            Create Token
          </Button>,
        ]}
      >
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fund Name</label>
            <Input 
              placeholder="Enter fund name" 
              size="large"
              value={matchingFundName}
              onChange={(e) => setMatchingFundName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <Input 
              placeholder="Enter amount" 
              size="large"
              value={matchingAmount}
              onChange={(e) => setMatchingAmount(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          color: #9ca3af !important;
          font-weight: 500 !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          padding: 8px 12px !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        .ant-table-tbody > tr > td {
          color: #6b7280 !important;
          font-size: 13px !important;
          padding: 10px 12px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #faf5ff !important;
        }
        .ant-table {
          font-size: 13px !important;
        }
        .bespoke-table .ant-table-thead > tr > th,
        .matching-table .ant-table-thead > tr > th {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default MyGivingFund;
