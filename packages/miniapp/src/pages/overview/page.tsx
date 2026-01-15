import { useEffect, useState } from "react";
import { AddMoreFundsModal, BespokeGivingFundTokenModal, MatchingFundTokenModal } from "./_components";
import { readContract } from "@wagmi/core";
import { Button, Dropdown, Input, Table } from "antd";
import { useAccount, useChainId, useConfig, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { CalendarIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import deployedContracts from "../../contracts/deployedContracts";

interface ReceivedToken {
  name: string;
  type: string;
  from: string;
  matchingRatio: string;
  tokenAmount: number;
}

interface FundDetails {
  address: string;
  creator: string;
  name: string;
  symbol: string;
  createdAt: bigint;
  exists: boolean;
}

const Overview = () => {
  const chainId = useChainId();
  const config = useConfig();
  const { address } = useAccount();

  const contracts = deployedContracts[chainId as keyof typeof deployedContracts];

  const [giftCode, setGiftCode] = useState("");
  const [isGivingModalOpen, setIsGivingModalOpen] = useState(false);
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);
  const [isAddMoreModalOpen, setIsAddMoreModalOpen] = useState(false);
  const [bespokeFundsDetails, setBespokeFundsDetails] = useState<FundDetails[]>([]);
  const [isLoadingBespokeDetails, setIsBespokeLoadingDetails] = useState(false);
  const [matchingFundsDetails, setMatchingFundsDetails] = useState<FundDetails[]>([]);
  const [isMatchingLoadingDetails, setIsMatchingLoadingDetails] = useState(false);

  const { data: givingFundTokenAmount = 0n } = useReadContract({
    address: contracts.GivingFundToken.address,
    abi: contracts.GivingFundToken.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  }) as { data: bigint };

  const { data: bespokeFundTokenAddresses } = useReadContract({
    address: contracts.BespokeFundTokenFactory.address,
    abi: contracts.BespokeFundTokenFactory.abi,
    functionName: "getUserFunds",
    args: [address as `0x${string}`],
  });

  const { data: matchingFundTokenAddresses } = useReadContract({
    address: contracts.MatchingFundTokenFactory.address,
    abi: contracts.MatchingFundTokenFactory.abi,
    functionName: "getUserFunds",
    args: [address as `0x${string}`],
  });

  // Fetch detailed info for each fund
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
            // @ts-ignore
            abi: deployedContracts[chainId].BespokeFundTokenFactory.abi,
            // @ts-ignore
            address: deployedContracts[chainId].BespokeFundTokenFactory.address as `0x${string}`,
            functionName: "getFundInfo",
            args: [fundAddress as `0x${string}`],
          });

          details.push({
            address: fundAddress,
            creator: address || "",
            name: response[1],
            symbol: response[2],
            createdAt: response[3],
            exists: true,
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
            // @ts-ignore
            abi: deployedContracts[chainId].MatchingFundTokenFactory.abi,
            // @ts-ignore
            address: deployedContracts[chainId].MatchingFundTokenFactory.address as `0x${string}`,
            functionName: "getFundInfo",
            args: [fundAddress as `0x${string}`],
          });

          details.push({
            address: fundAddress,
            creator: address || "",
            name: response[1],
            symbol: response[2],
            createdAt: response[3],
            exists: true,
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

  const receivedTokens: ReceivedToken[] = [
    {
      name: "LM Giving Fund",
      type: "Giving Token",
      from: "LM",
      matchingRatio: "N/A",
      tokenAmount: 1000,
    },
    {
      name: "CK Matching Fund",
      type: "Matching Token",
      from: "Jen Li",
      matchingRatio: "1 for 1",
      tokenAmount: 1000,
    },
  ];

  const bespokeColumns = [
    {
      title: "Fund Token Name",
      dataIndex: "name",
      key: "name",
      className: "text-purple-600 font-medium",
    },
    {
      title: "Available Tokens",
      dataIndex: "availableTokens",
      key: "availableTokens",
      render: (val: number) => `$${0}`,
    },
    {
      title: "Percentage Funded",
      dataIndex: "percentageFunded",
      key: "percentageFunded",
      render: (val: number) => `${0}%`,
    },
    {
      title: "Donated Amount",
      dataIndex: "donatedAmount",
      key: "donatedAmount",
      render: (val: number) => `$${0}`,
    },
    {
      title: "Transaction Pending Amount",
      dataIndex: "transactionPending",
      key: "transactionPending",
      render: (val: number) => `$${0}`,
    },
  ];

  const matchingColumns = [
    {
      title: "Fund Token Name",
      dataIndex: "name",
      key: "name",
      className: "text-purple-600 font-medium",
    },
    {
      title: "Available Tokens",
      dataIndex: "availableTokens",
      key: "availableTokens",
      render: (val: number) => `$${0}`,
    },
    {
      title: "Percentage Funded",
      dataIndex: "percentageFunded",
      key: "percentageFunded",
      render: (val: number) => `${0}%`,
    },
    {
      title: "Donated Amount",
      dataIndex: "donatedAmount",
      key: "donatedAmount",
      render: (val: number) => `$${0}`,
    },
    {
      title: "Transaction Pending Amount",
      dataIndex: "transactionPending",
      key: "transactionPending",
      render: (val: number) => `$${0}`,
    },
    {
      title: "Matching Ratio",
      dataIndex: "matchingRatio",
      key: "matchingRatio",
    },
  ];

  const receivedColumns = [
    {
      title: "Fund Token Name",
      dataIndex: "name",
      key: "name",
      className: "text-purple-600 font-medium",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
    },
    {
      title: "Matching Ratio",
      dataIndex: "matchingRatio",
      key: "matchingRatio",
    },
    {
      title: "Token Amount",
      dataIndex: "tokenAmount",
      key: "tokenAmount",
      render: (val: number) => `$${val.toLocaleString()}`,
    },
  ];

  const menuItems = [
    { key: "view", label: "View" },
    { key: "donate", label: "Donate" },
  ];

  const giftMenuItems = [
    { key: "view", label: "View" },
    { key: "donate", label: "Donate" },
    { key: "gift", label: "Gift" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Accounts</span>
              <span className="text-gray-400">|</span>
              <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
                <span>COINBASE</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <CalendarIcon className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-700 mb-8">My Giving Funds</h1>

        {/* General Giving Fund */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between mb-4">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div>
                <h2 className="text-gray-600 text-sm mb-1">General Giving Fund</h2>
                <p className="text-3xl font-semibold text-purple-600">${formatUnits(givingFundTokenAmount, 6)}</p>
              </div>
              <Button
                type="primary"
                className="bg-purple-600 border-0 hover:bg-purple-700 rounded-full px-6"
                onClick={() => setIsAddMoreModalOpen(true)}
              >
                Add More
              </Button>
            </div>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button type="text" icon={<EllipsisVerticalIcon className="w-5 h-5" />} />
            </Dropdown>
          </div>
        </div>

        {/* Bespoke Giving Fund Token */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <h2 className="text-gray-600 text-lg">Bespoke Giving Fund Token</h2>
              <Button type="primary" size="small" className="bg-pink-500 border-0 hover:bg-pink-600 rounded-full px-4">
                Gift
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="primary"
                className="bg-purple-600 border-0 hover:bg-purple-700 rounded-full"
                onClick={() => setIsGivingModalOpen(true)}
              >
                Create My Own Giving Fund Token
              </Button>
              <Dropdown menu={{ items: giftMenuItems }} trigger={["click"]}>
                <Button type="text" icon={<EllipsisVerticalIcon className="w-5 h-5" />} />
              </Dropdown>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={bespokeColumns}
              dataSource={bespokeFundsDetails}
              pagination={false}
              rowKey="name"
              className="custom-table"
              loading={isLoadingBespokeDetails}
            />
          </div>
        </div>

        {/* Matching Fund Token */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <h2 className="text-gray-600 text-lg">Matching Fund Token</h2>
              <Button
                type="primary"
                size="small"
                className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 hover:from-purple-600 hover:to-pink-600"
              >
                Gift
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="primary"
                className="bg-purple-600 border-0 hover:bg-purple-700 rounded-full"
                onClick={() => setIsMatchingModalOpen(true)}
              >
                Create My Matching Fund Token
              </Button>
              <Dropdown menu={{ items: giftMenuItems }} trigger={["click"]}>
                <Button type="text" icon={<EllipsisVerticalIcon className="w-5 h-5" />} />
              </Dropdown>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={matchingColumns}
              dataSource={matchingFundsDetails}
              pagination={false}
              rowKey="name"
              className="custom-table"
              loading={isMatchingLoadingDetails}
            />
          </div>
        </div>

        {/* Available Giving Fund Received From Others */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <h2 className="text-gray-600 text-lg">Available Giving Fund Received From Others</h2>
              <Button
                type="primary"
                size="small"
                className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 hover:from-purple-600 hover:to-pink-600"
              >
                Gift
              </Button>
            </div>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button type="text" icon={<EllipsisVerticalIcon className="w-5 h-5" />} />
            </Dropdown>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={receivedColumns}
              dataSource={receivedTokens}
              pagination={false}
              rowKey="name"
              className="custom-table"
            />
          </div>
        </div>

        {/* Redeem Gift Code */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-600 font-medium mb-4">REDEEM GIFT CODE</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter gift code"
              value={giftCode}
              onChange={e => setGiftCode(e.target.value)}
              className="flex-1"
              size="large"
            />
            <Button
              type="primary"
              size="large"
              className="bg-gradient-to-r from-purple-500 to-purple-600 border-0 hover:from-purple-600 hover:to-purple-700 px-8"
            >
              Redeem
            </Button>
          </div>
        </div>
      </div>

      <AddMoreFundsModal
        contracts={contracts}
        userAddress={address}
        isAddMoreModalOpen={isAddMoreModalOpen}
        setIsAddMoreModalOpen={setIsAddMoreModalOpen}
      />

      <BespokeGivingFundTokenModal
        contracts={contracts}
        isGivingModalOpen={isGivingModalOpen}
        setIsGivingModalOpen={setIsGivingModalOpen}
      />

      <MatchingFundTokenModal
        contracts={contracts}
        isMatchingModalOpen={isMatchingModalOpen}
        setIsMatchingModalOpen={setIsMatchingModalOpen}
      />

      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #f9fafb;
          color: #9333ea;
          font-weight: 500;
          font-size: 0.875rem;
        }
        .custom-table .ant-table-tbody > tr > td {
          color: #6b7280;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #faf5ff;
        }
      `}</style>
    </div>
  );
};

export default Overview;
