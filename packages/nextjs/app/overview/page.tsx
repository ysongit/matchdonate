"use client";

import React, { useState } from 'react';
import type { NextPage } from "next";
import { Table, Button, Input, Dropdown } from 'antd';
import { EllipsisVerticalIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface BespokeToken {
  name: string;
  availableTokens: number;
  percentageFunded: number;
  donatedAmount: number;
  transactionPending: number;
}

interface MatchingToken {
  name: string;
  availableTokens: number;
  percentageFunded: number;
  donatedAmount: number;
  transactionPending: number;
  matchingRatio: string;
}

interface ReceivedToken {
  name: string;
  type: string;
  from: string;
  matchingRatio: string;
  tokenAmount: number;
}

const Overview: NextPage = () => {
  const [giftCode, setGiftCode] = useState('');

  const bespokeTokens: BespokeToken[] = [
    {
      name: "Daisy's Giving Fund",
      availableTokens: 2000,
      percentageFunded: 100,
      donatedAmount: 500,
      transactionPending: 300,
    },
    {
      name: "Daisy's Family Giving Fund",
      availableTokens: 2000,
      percentageFunded: 50,
      donatedAmount: 250,
      transactionPending: 200,
    },
  ];

  const matchingTokens: MatchingToken[] = [
    {
      name: "Daisy's Matching Fund",
      availableTokens: 2000,
      percentageFunded: 40,
      donatedAmount: 500,
      transactionPending: 300,
      matchingRatio: '1 for 1',
    },
  ];

  const receivedTokens: ReceivedToken[] = [
    {
      name: 'LM Giving Fund',
      type: 'Giving Token',
      from: 'LM',
      matchingRatio: 'N/A',
      tokenAmount: 1000,
    },
    {
      name: 'CK Matching Fund',
      type: 'Matching Token',
      from: 'Jen Li',
      matchingRatio: '1 for 1',
      tokenAmount: 1000,
    },
  ];

  const bespokeColumns = [
    {
      title: 'Fund Token Name',
      dataIndex: 'name',
      key: 'name',
      className: 'text-purple-600 font-medium',
    },
    {
      title: 'Available Tokens',
      dataIndex: 'availableTokens',
      key: 'availableTokens',
      render: (val: number) => `$${val.toLocaleString()}`,
    },
    {
      title: 'Percentage Funded',
      dataIndex: 'percentageFunded',
      key: 'percentageFunded',
      render: (val: number) => `${val}%`,
    },
    {
      title: 'Donated Amount',
      dataIndex: 'donatedAmount',
      key: 'donatedAmount',
      render: (val: number) => `$${val}`,
    },
    {
      title: 'Transaction Pending Amount',
      dataIndex: 'transactionPending',
      key: 'transactionPending',
      render: (val: number) => `$${val}`,
    },
  ];

  const matchingColumns = [
    {
      title: 'Fund Token Name',
      dataIndex: 'name',
      key: 'name',
      className: 'text-purple-600 font-medium',
    },
    {
      title: 'Available Tokens',
      dataIndex: 'availableTokens',
      key: 'availableTokens',
      render: (val: number) => `$${val.toLocaleString()}`,
    },
    {
      title: 'Percentage Funded',
      dataIndex: 'percentageFunded',
      key: 'percentageFunded',
      render: (val: number) => `${val}%`,
    },
    {
      title: 'Donated Amount',
      dataIndex: 'donatedAmount',
      key: 'donatedAmount',
      render: (val: number) => `$${val}`,
    },
    {
      title: 'Transaction Pending Amount',
      dataIndex: 'transactionPending',
      key: 'transactionPending',
      render: (val: number) => `$${val}`,
    },
    {
      title: 'Matching Ratio',
      dataIndex: 'matchingRatio',
      key: 'matchingRatio',
    },
  ];

  const receivedColumns = [
    {
      title: 'Fund Token Name',
      dataIndex: 'name',
      key: 'name',
      className: 'text-purple-600 font-medium',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'From',
      dataIndex: 'from',
      key: 'from',
    },
    {
      title: 'Matching Ratio',
      dataIndex: 'matchingRatio',
      key: 'matchingRatio',
    },
    {
      title: 'Token Amount',
      dataIndex: 'tokenAmount',
      key: 'tokenAmount',
      render: (val: number) => `$${val.toLocaleString()}`,
    },
  ];

  const menuItems = [
    { key: 'view', label: 'View' },
    { key: 'donate', label: 'Donate' },
  ];

  const giftMenuItems = [
    { key: 'view', label: 'View' },
    { key: 'donate', label: 'Donate' },
    { key: 'gift', label: 'Gift' },
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div>
                <h2 className="text-gray-600 text-sm mb-1">General Giving Fund</h2>
                <p className="text-3xl font-semibold text-purple-600">$1,000</p>
              </div>
              <Button
                type="primary"
                className="bg-purple-600 border-0 hover:bg-purple-700 rounded-full px-6"
              >
                Add More
              </Button>
            </div>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="text" icon={<EllipsisVerticalIcon className="w-5 h-5" />} />
            </Dropdown>
          </div>
        </div>

        {/* Bespoke Giving Fund Token */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <h2 className="text-gray-600 text-lg">Bespoke Giving Fund Token</h2>
              <Button
                type="primary"
                size="small"
                className="bg-pink-500 border-0 hover:bg-pink-600 rounded-full px-4"
              >
                Gift
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="primary"
                className="bg-purple-600 border-0 hover:bg-purple-700 rounded-full"
              >
                Create My Own Giving Fund Token
              </Button>
              <Dropdown menu={{ items: giftMenuItems }} trigger={['click']}>
                <Button type="text" icon={<EllipsisVerticalIcon className="w-5 h-5" />} />
              </Dropdown>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={bespokeColumns}
              dataSource={bespokeTokens}
              pagination={false}
              rowKey="name"
              className="custom-table"
            />
          </div>
        </div>

        {/* Matching Fund Token */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
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
              >
                Create My Matching Fund Token
              </Button>
              <Dropdown menu={{ items: giftMenuItems }} trigger={['click']}>
                <Button type="text" icon={<EllipsisVerticalIcon className="w-5 h-5" />} />
              </Dropdown>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={matchingColumns}
              dataSource={matchingTokens}
              pagination={false}
              rowKey="name"
              className="custom-table"
            />
          </div>
        </div>

        {/* Available Giving Fund Received From Others */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
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
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
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
              onChange={(e) => setGiftCode(e.target.value)}
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
