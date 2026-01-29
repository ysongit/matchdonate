import React, { useState, useEffect } from 'react';
import { Button, Table, Input, Dropdown } from 'antd';
import { PlusOutlined, EllipsisOutlined } from '@ant-design/icons';
import { AddMoreFundsModal, BespokeGivingFundTokenModal, MatchingFundTokenModal } from '../overview/_components';
import deployedContracts from "../../contracts/deployedContracts";
import { useWalletAddress } from "../../hooks/useWalletAddress";
import { calculatePercentageFunded } from "../../utils/calculatePercentageFunded";
import { useChainId, useConfig, useReadContract } from 'wagmi';
import { readContract } from "@wagmi/core";
import { formatUnits } from 'viem';
import { formatDate } from '../../utils/formatDate';
import { IncreaseBespokeFundModal } from './_components';

interface FundDetails {
  address: string;
  creator: string;
  name: string;
  symbol: string;
  createdAt: bigint;
  exists: boolean;
  availableTokens: bigint;
  percentageFunded: string;
  fundedGFT: bigint;
}

interface Transaction {
  transactionId: string;
  amount: number;
  date: string;
}

interface GivingFundReceived {
  amount: number;
  from: string;
}

const MyGivingFund: React.FC = () => {
  const chainId = useChainId();
  const config = useConfig();
  const { address } = useWalletAddress();

  const contracts = deployedContracts[chainId as keyof typeof deployedContracts];

  const [giftCode, setGiftCode] = useState('');
  const [isAddMoreModalOpen, setIsAddMoreModalOpen] = useState(false);
  const [isIncreaseBespokeFundModalOpen, setIsIncreaseBespokeFundModalOpen] = useState(false);
  const [isGivingModalOpen, setIsGivingModalOpen] = useState(false);
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);

  const [bespokeFundsDetails, setBespokeFundsDetails] = useState<FundDetails[]>([]);
  const [isLoadingBespokeDetails, setIsBespokeLoadingDetails] = useState(false);
  const [selectedBespokeFund, setSelectedBespokeFund] = useState<FundDetails>(null);
  const [matchingFundsDetails, setMatchingFundsDetails] = useState<FundDetails[]>([]);
  const [isMatchingLoadingDetails, setIsMatchingLoadingDetails] = useState(false);

  const { data: givingFundTokenAmount = 0n } = useReadContract({
    address: contracts.GivingFundToken.address,
    abi: contracts.GivingFundToken.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      refetchInterval: 5000,
    },
  }) as { data: bigint };

  const { data: bespokeFundTokenAddresses } = useReadContract({
    address: contracts.BespokeFundTokenFactory.address,
    abi: contracts.BespokeFundTokenFactory.abi,
    functionName: "getUserFunds",
    args: [address as `0x${string}`],
    query: {
      refetchInterval: 5000,
    },
  });

  const { data: matchingFundTokenAddresses } = useReadContract({
    address: contracts.MatchingFundTokenFactory.address,
    abi: contracts.MatchingFundTokenFactory.abi,
    functionName: "getUserFunds",
    args: [address as `0x${string}`],
    query: {
      refetchInterval: 5000,
    },
  });

  useEffect(() => {
    if (!bespokeFundTokenAddresses || bespokeFundTokenAddresses.length === 0) {
      setBespokeFundsDetails([]);
      return;
    }

    const fetchAllFundDetails = async () => {
      setIsBespokeLoadingDetails(true);
      try {
        const details: FundDetails[] = [];

        for (const fundAddress of bespokeFundTokenAddresses) {
          const response = await readContract(config, {
            abi: deployedContracts[chainId].BespokeFundTokenFactory.abi,
            address: deployedContracts[chainId].BespokeFundTokenFactory.address as `0x${string}`,
            functionName: "getFundInfo",
            args: [fundAddress as `0x${string}`],
          });

          const availableTokens = await readContract(config, {
            abi: [{
              inputs: [],
              name: "totalSupply",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            }],
            address: fundAddress as `0x${string}`,
            functionName: "totalSupply",
          });

          const fundedGFT = await readContract(config, {
            abi: deployedContracts[chainId].GivingFundToken.abi,
            address: deployedContracts[chainId].GivingFundToken.address as `0x${string}`,
            functionName: "balanceOf",
            args: [fundAddress as `0x${string}`],
          });

          details.push({
            address: fundAddress,
            creator: address || "",
            name: response[1],
            symbol: response[2],
            createdAt: response[3],
            exists: true,
            availableTokens: availableTokens,
            percentageFunded: calculatePercentageFunded(fundedGFT, availableTokens),
            fundedGFT: fundedGFT
          });
        }

        setBespokeFundsDetails(details);
      } catch (error) {
        console.error("Error fetching fund details:", error);
      } finally {
        setIsBespokeLoadingDetails(false);
      }
    };

    fetchAllFundDetails();
  }, [bespokeFundTokenAddresses, address]);

  useEffect(() => {
    if (!matchingFundTokenAddresses || matchingFundTokenAddresses.length === 0) {
      setBespokeFundsDetails([]);
      return;
    }

    const fetchAllMatchingFundDetails = async () => {
      setIsMatchingLoadingDetails(true);
      try {
        const details: FundDetails[] = [];

        for (const fundAddress of matchingFundTokenAddresses) {
          const response = await readContract(config, {
            abi: deployedContracts[chainId].MatchingFundTokenFactory.abi,
            address: deployedContracts[chainId].MatchingFundTokenFactory.address as `0x${string}`,
            functionName: "getFundInfo",
            args: [fundAddress as `0x${string}`],
          });

          const availableTokens = await readContract(config, {
            abi: [{
              inputs: [],
              name: "totalSupply",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            }],
            address: fundAddress as `0x${string}`,
            functionName: "totalSupply",
          });

          console.log(response);
          const fundedGFT = await readContract(config, {
            abi: deployedContracts[chainId].GivingFundToken.abi,
            address: deployedContracts[chainId].GivingFundToken.address as `0x${string}`,
            functionName: "balanceOf",
            args: [fundAddress as `0x${string}`],
          });

          details.push({
            address: fundAddress,
            creator: address || "",
            name: response[1],
            symbol: response[2],
            createdAt: response[4],
            exists: true,
            availableTokens: availableTokens,
            percentageFunded: calculatePercentageFunded(fundedGFT, availableTokens),
            fundedGFT: fundedGFT
          });
        }

        setMatchingFundsDetails(details);
      } catch (error) {
        console.error("Error fetching fund details:", error);
      } finally {
        setIsMatchingLoadingDetails(false);
      }
    };

    fetchAllMatchingFundDetails();
  }, [matchingFundTokenAddresses, address]);

  const handleSelectAndOpenBespokeModal = (record: FundDetails) => {
    setSelectedBespokeFund(record);
    setIsIncreaseBespokeFundModalOpen(true);
  }

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
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (val: bigint) => formatDate(val) || '-'
    },
    { 
      title: 'Donated Amount', 
      dataIndex: 'donatedAmount', 
      key: 'donatedAmount',
    },
    { 
      title: 'Available Amount', 
      dataIndex: 'availableTokens', 
      key: 'availableTokens', 
      render: (val: bigint) => `${formatUnits(val, 6)}`,
    },
    { 
      title: 'Percentage Funded', 
      dataIndex: 'percentageFunded', 
      key: 'percentageFunded', 
      render: (val: number) => `${val}%`,
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: FundDetails) => <Button type="primary" size="small" onClick={() => handleSelectAndOpenBespokeModal(record)}>Increase Funding</Button>
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
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (val: bigint) => formatDate(val) || '-'
    },
    { 
      title: 'Donated Amount', 
      dataIndex: 'donatedAmount', 
      key: 'donatedAmount', 
      render: (val: number) => val
    },
    { 
      title: 'Available Amount', 
      dataIndex: 'availableTokens', 
      key: 'availableTokens', 
      render: (val: bigint) => `${formatUnits(val, 6)}`,
    },
    { 
      title: 'Percentage Funded', 
      dataIndex: 'percentageFunded', 
      key: 'percentageFunded', 
      render: (val: number) => `${val}%`,
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: FundDetails) => 
        record.name !== 'Total Matching Funds' ? (
          <Button type="primary" size="small">Increase Funding</Button>
        ) : null
    },
  ];

  const givingfundMenuItems = [
    { key: "donate", label: "Donate" },
    { key: "gift", label: "Gift" },
  ];

  return (
    <div className="min-h-screen max-w-4xl mx-auto">
      {/* General Giving Fund */}
      <div className="mb-8 bg-white p-4 md:p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-gray-800 text-lg font-semibold mb-3">General Giving Fund</h2>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-purple-600">${formatUnits(givingFundTokenAmount, 6)}</p>
            </div>
          </div>
          <Button type="primary" icon={<PlusOutlined />} size="small"  onClick={() => setIsAddMoreModalOpen(true)}>
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
                  <Dropdown menu={{ items: givingfundMenuItems }} trigger={["click"]}>
                    <Button type="text" icon={<EllipsisOutlined />} size="small" className="text-gray-400" />
                  </Dropdown>
                </div>
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
      <div className="mb-8 bg-white p-4 md:p-6">
        <h2 className="text-gray-800 text-lg font-semibold mb-4">Bespoke Giving Fund</h2>
        
        <div className="rounded-lg">
          <Table 
            columns={bespokeColumns} 
            dataSource={bespokeFundsDetails}
            pagination={false}
            rowKey="name"
            size="small"
            className="bespoke-table"
            rowClassName={(record) => record.name === 'Total Bespoke Giving Funds' ? 'font-semibold' : ''}
            loading={isLoadingBespokeDetails}
          />
          <Button type="link" className="text-purple-600 mt-2 px-0 text-sm">
            Show All Tokens →
          </Button>

          {/* Create New Bespoke */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
            <Button 
              type="primary"
              block
              className="mt-1"
              onClick={() => setIsGivingModalOpen(true)}
            >
              Create My Own Giving Fund Token
            </Button>
          </div>
        </div>
      </div>

      {/* Matching Fund */}
      <div className="mb-8 bg-white p-4 md:p-6">
        <h2 className="text-gray-800 text-lg font-semibold mb-4">Matching Fund</h2>
        
        <div className="rounded-lg">
          <Table 
            columns={matchingColumns} 
            dataSource={matchingFundsDetails}
            pagination={false}
            rowKey="name"
            size="small"
            className="matching-table"
            rowClassName={(record) => record.name === 'Total Matching Funds' ? 'font-semibold' : ''}
            loading={isMatchingLoadingDetails}
          />
          <Button type="link" className="text-purple-600 mt-2 px-0 text-sm">
            Show All Matching Funds →
          </Button>

          {/* Create New Matching */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button 
              type="primary"
              block
              className="mt-1"
              onClick={() => setIsMatchingModalOpen(true)}
            >
              Create My Matching Fund Token
            </Button>
          </div>
        </div>
      </div>

      <BespokeGivingFundTokenModal
        givingFundTokenAmount={givingFundTokenAmount}
        contracts={contracts}
        isGivingModalOpen={isGivingModalOpen}
        setIsGivingModalOpen={setIsGivingModalOpen}
      />

      <MatchingFundTokenModal
        givingFundTokenAmount={givingFundTokenAmount}
        contracts={contracts}
        isMatchingModalOpen={isMatchingModalOpen}
        setIsMatchingModalOpen={setIsMatchingModalOpen}
      />

      <IncreaseBespokeFundModal
        selectedBespokeFund={selectedBespokeFund}
        givingFundTokenAmount={givingFundTokenAmount}
        contracts={contracts}
        isModalOpen={isIncreaseBespokeFundModalOpen}
        setIsModalOpen={setIsIncreaseBespokeFundModalOpen}
      />

      <AddMoreFundsModal
        contracts={contracts}
        userAddress={address}
        isAddMoreModalOpen={isAddMoreModalOpen}
        setIsAddMoreModalOpen={setIsAddMoreModalOpen}
      />

      {/* @ts-ignore */}
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
