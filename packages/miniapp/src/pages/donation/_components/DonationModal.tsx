import React, { useState, useEffect } from 'react';
import { Modal, Select, Input, Checkbox } from 'antd';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nonprofitName: string;
}

// Token options - some are "matching" tokens that trigger the Frame section
const tokenOptions = [
  { value: 'token1', label: 'USDC', isMatching: false },
  { value: 'token2', label: 'ETH', isMatching: true },
  { value: 'token3', label: 'DAI', isMatching: true },
  { value: 'token4', label: 'USDT', isMatching: false },
  { value: 'token5', label: 'BTC', isMatching: true },
];

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, nonprofitName }) => {
  const [frequency, setFrequency] = useState<'one-time' | 'recurring' | null>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [frameToken, setFrameToken] = useState<string | null>(null);
  const [frameAmount, setFrameAmount] = useState<string>('');

  // Check if selected token is a matching token
  const isMatchingToken = tokenOptions.find((t) => t.value === selectedToken)?.isMatching || false;

  // Calculate total donation amount
  const totalAmount = parseFloat(amount) || 0;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFrequency(null);
      setSelectedToken(null);
      setAmount('');
      setFrameToken(null);
      setFrameAmount('');
    }
  }, [isOpen]);

  const handleFrequencyChange = (type: 'one-time' | 'recurring') => {
    setFrequency(type);
  };

  const handleDonate = () => {
    console.log('Donation submitted:', {
      nonprofitName,
      frequency,
      token: selectedToken,
      amount,
      frameToken: isMatchingToken ? frameToken : null,
      frameAmount: isMatchingToken ? frameAmount : null,
    });
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={540}
      className="donation-modal"
      styles={{
        content: {
          borderRadius: '16px',
          padding: 0,
          overflow: 'hidden',
        },
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        },
      }}
    >
      <div
        className="relative"
        style={{
          border: '3px solid #60a5fa',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <XMarkIcon className="w-5 h-5 text-gray-400" />
        </button>

        {/* Content */}
        <div className="bg-white p-6 md:p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Donation</h2>

          {/* Nonprofit */}
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-600 mb-2">Nonprofit</label>
            <p className="text-gray-500 text-sm pl-1">{nonprofitName}</p>
          </div>

          {/* Donation Frequency */}
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-600 mb-3">
              Choose a donation frequency
            </label>
            <div className="space-y-3 pl-1">
              <div className="flex items-center">
                <Checkbox
                  checked={frequency === 'one-time'}
                  onChange={() => handleFrequencyChange('one-time')}
                  className="custom-checkbox"
                >
                  <span className="text-gray-500 text-sm">One-time</span>
                </Checkbox>
              </div>
              <div className="flex items-center">
                <Checkbox
                  checked={frequency === 'recurring'}
                  onChange={() => handleFrequencyChange('recurring')}
                  className="custom-checkbox"
                >
                  <span className="text-gray-500 text-sm">Recurring</span>
                </Checkbox>
              </div>
            </div>
          </div>

          {/* Donation Amount */}
          <div className="mb-4">
            <label className="block text-base font-medium text-gray-600 mb-3">
              Donation Amount: <span className="text-gray-800">${totalAmount}</span>
            </label>
            <div className="flex gap-3">
              <Select
                placeholder="Fund Token"
                value={selectedToken}
                onChange={(value) => setSelectedToken(value)}
                className="flex-1 h-11"
                style={{ borderRadius: '24px' }}
                options={tokenOptions.map((t) => ({ value: t.value, label: t.label }))}
              />
              <Input
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-28 h-11 rounded-full border-gray-200"
                style={{ borderRadius: '24px' }}
                type="number"
              />
            </div>
          </div>

          {/* Frame Section - Only shows when matching token is selected */}
          {isMatchingToken && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-3">Frame</label>
              <div className="flex gap-3">
                <Select
                  placeholder="Fund Token"
                  value={frameToken}
                  onChange={(value) => setFrameToken(value)}
                  className="flex-1 h-11"
                  style={{ borderRadius: '24px' }}
                  options={tokenOptions.map((t) => ({ value: t.value, label: t.label }))}
                />
                <Input
                  placeholder="Amount"
                  value={frameAmount}
                  onChange={(e) => setFrameAmount(e.target.value)}
                  className="w-28 h-11 rounded-full border-gray-200"
                  style={{ borderRadius: '24px' }}
                  type="number"
                />
              </div>
            </div>
          )}

          {/* Terms Text */}
          <div className="mb-8">
            <p className="text-gray-500 text-sm leading-relaxed">
              Your donation is being made to [Our nonprofit], registered in the United States of
              America, which takes legal control of donation and disburse to the recipient
              organization(s). Organizations will receive your donation, less fess, if applicable.
              Donation are non-refundable. By continuing, you agree to the{' '}
              <span className="text-purple-500 cursor-pointer hover:underline">Terms of Use</span>{' '}
              which contain key information regarding donations.
            </p>
          </div>

          {/* Donate Button */}
          <div className="flex justify-center">
            <button
              onClick={handleDonate}
              className="h-12 px-16 rounded-full font-bold text-white text-sm uppercase tracking-wider transition-all hover:opacity-90 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #e879a8 0%, #a855f7 100%)',
                borderRadius: '32px',
              }}
            >
              Donate
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .donation-modal .ant-modal-content {
          padding: 0 !important;
          border-radius: 16px !important;
          overflow: hidden;
        }
        
        .donation-modal .ant-select-selector {
          border-radius: 24px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
          border-color: #e5e7eb !important;
        }
        
        .donation-modal .ant-select-selection-placeholder,
        .donation-modal .ant-select-selection-item {
          line-height: 42px !important;
          color: #9ca3af;
        }
        
        .donation-modal .ant-select:hover .ant-select-selector,
        .donation-modal .ant-select-focused .ant-select-selector {
          border-color: #d4a5ff !important;
          box-shadow: 0 0 0 2px rgba(212, 165, 255, 0.1) !important;
        }
        
        .donation-modal .ant-input {
          border-radius: 24px !important;
        }
        
        .donation-modal .ant-input:hover,
        .donation-modal .ant-input:focus {
          border-color: #d4a5ff !important;
          box-shadow: 0 0 0 2px rgba(212, 165, 255, 0.1) !important;
        }
        
        .donation-modal .ant-checkbox-inner {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 2px solid #d1d5db;
        }
        
        .donation-modal .ant-checkbox-checked .ant-checkbox-inner {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border-color: transparent;
        }
        
        .donation-modal .ant-checkbox-checked .ant-checkbox-inner::after {
          border-color: white;
        }
        
        .donation-modal .ant-checkbox-wrapper:hover .ant-checkbox-inner {
          border-color: #a855f7;
        }

        .donation-modal .custom-checkbox .ant-checkbox + span {
          padding-left: 12px;
        }
      `}</style>
    </Modal>
  );
};
