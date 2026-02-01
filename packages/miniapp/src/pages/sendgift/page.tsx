import React, { useState } from 'react';
import { Input, Checkbox, Select, Button } from 'antd';
import { PencilIcon, EyeIcon } from '@heroicons/react/24/solid';

const { TextArea } = Input;

interface FormData {
  senderName: string;
  recipientName: string;
  recipientEmail: string;
  phoneNumber: string;
  deliveryMethod: {
    email: boolean;
    text: boolean;
  };
  fundToken: string;
  amount: string;
}

const SendGift: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    senderName: '',
    recipientName: '',
    recipientEmail: '',
    phoneNumber: '',
    deliveryMethod: {
      email: false,
      text: false,
    },
    fundToken: '',
    amount: '',
  });

  const [editableMessage, setEditableMessage] = useState<string>(
    `I wanted to give you something that feels right for who you are.

Over the years, I've watched you pour genuine care into making a difference—not for recognition, but because you actually believe in helping others.

So I'm sending you a [$100] charity fund gift to donate wherever your heart tells you to. Whether it's a cause you've been thinking about or one you're passionate about right now, I want to support that. Your generosity inspires me, and this feels like the best way to celebrate you.

Thank you for being the kind of person you are. Here's to another year of you doing good in the world.`
  );

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeliveryMethodChange = (method: 'email' | 'text'): void => {
    setFormData((prev) => ({
      ...prev,
      deliveryMethod: {
        ...prev.deliveryMethod,
        [method]: !prev.deliveryMethod[method],
      },
    }));
  };

  const displayRecipientName = formData.recipientName || 'RECIPIENT NAME';
  const displaySenderName = formData.senderName || 'Sender Name';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto mb-4">
        <p className="text-sm text-gray-600 font-medium">
          <span className="text-gray-800 font-semibold">Dashboard</span>/Send A Gift
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel - Form */}
          <div
            className="bg-white rounded-2xl p-6 md:p-8"
            style={{
              border: '2px solid transparent',
              backgroundImage:
                'linear-gradient(white, white), linear-gradient(135deg, #e879a8 0%, #d4a5ff 50%, #e879a8 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            }}
          >
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 md:mb-8">
              Create a Gift – <span className="text-purple-600">Spread the Joy of Giving</span>
            </h1>

            {/* Sender Name */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Sender Name</label>
              <Input
                placeholder="Sender Name"
                value={formData.senderName}
                onChange={(e) => handleInputChange('senderName', e.target.value)}
                className="h-12 rounded-full border-gray-200 hover:border-purple-300 focus:border-purple-400"
                style={{ borderRadius: '24px' }}
              />
            </div>

            {/* Recipient Name */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Recipient Name<span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Recipient Name"
                value={formData.recipientName}
                onChange={(e) => handleInputChange('recipientName', e.target.value)}
                className="h-12 rounded-full border-gray-200 hover:border-purple-300 focus:border-purple-400"
                style={{ borderRadius: '24px' }}
              />
            </div>

            {/* Delivery Method */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Delivery Method
              </label>

              {/* Email Option */}
              <div className="flex items-center gap-3 mb-3">
                <Checkbox
                  checked={formData.deliveryMethod.email}
                  onChange={() => handleDeliveryMethodChange('email')}
                  className="custom-checkbox"
                />
                <Input
                  placeholder="Recipient Email"
                  value={formData.recipientEmail}
                  onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                  disabled={!formData.deliveryMethod.email}
                  className="flex-1 h-11 rounded-full border-gray-200"
                  style={{ borderRadius: '24px' }}
                />
              </div>

              {/* Text Option */}
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={formData.deliveryMethod.text}
                  onChange={() => handleDeliveryMethodChange('text')}
                  className="custom-checkbox"
                />
                <Input
                  placeholder="Texting via Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  disabled={!formData.deliveryMethod.text}
                  className="flex-1 h-11 rounded-full border-gray-200"
                  style={{ borderRadius: '24px' }}
                />
              </div>
            </div>

            {/* Gift Amount */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Gift Amount</label>
              <div className="flex gap-3">
                <Select
                  placeholder="Fund Token"
                  value={formData.fundToken || undefined}
                  onChange={(value) => handleInputChange('fundToken', value)}
                  className="flex-1 h-12"
                  style={{ borderRadius: '24px' }}
                  dropdownStyle={{ borderRadius: '12px' }}
                >
                  <Select.Option value="token1">Fund Token 1</Select.Option>
                  <Select.Option value="token2">Fund Token 2</Select.Option>
                  <Select.Option value="token3">Fund Token 3</Select.Option>
                </Select>
                <Input
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="w-28 md:w-32 h-12 rounded-full border-gray-200"
                  style={{ borderRadius: '24px' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                type="primary"
                size="large"
                className="h-12 px-10 rounded-full font-semibold text-sm uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #e879a8 0%, #d4a5ff 100%)',
                  border: 'none',
                  borderRadius: '32px',
                }}
              >
                Send
              </Button>
              <Button
                size="large"
                className="h-12 px-8 rounded-full font-semibold text-sm uppercase tracking-wider bg-gray-700 text-white hover:bg-gray-800"
                style={{ borderRadius: '32px' }}
              >
                Save for Later
              </Button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex flex-col gap-4">
            {/* Edit/Preview Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="primary"
                size="large"
                icon={<PencilIcon className="w-4 h-4 mr-1" />}
                onClick={() => setIsEditing(true)}
                className={`h-11 px-6 rounded-lg font-semibold flex items-center ${
                  isEditing ? 'bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
                }`}
                style={{
                  background: isEditing ? '#7c3aed' : '#a855f7',
                  border: 'none',
                  borderRadius: '8px',
                }}
              >
                Edit
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<EyeIcon className="w-4 h-4 mr-1" />}
                onClick={() => setIsEditing(false)}
                className="h-11 px-6 rounded-lg font-semibold flex items-center bg-purple-500 hover:bg-purple-600"
                style={{
                  background: '#a855f7',
                  border: 'none',
                  borderRadius: '8px',
                }}
              >
                Preview
              </Button>
            </div>

            {/* Email Preview Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 shadow-sm">
              {/* Greeting - Not Editable */}
              <p className="text-gray-800 mb-4">Dear {displayRecipientName},</p>

              {/* Editable Message Area */}
              {isEditing ? (
                <div className="bg-gray-100 rounded-lg p-4 mb-4 border-2 border-purple-300">
                  <TextArea
                    value={editableMessage}
                    onChange={(e) => setEditableMessage(e.target.value)}
                    autoSize={{ minRows: 8, maxRows: 16 }}
                    className="bg-transparent border-none resize-none text-gray-700 text-sm leading-relaxed"
                    style={{
                      background: 'transparent',
                      boxShadow: 'none',
                      padding: 0,
                    }}
                  />
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  {editableMessage.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 text-sm leading-relaxed mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* Signature - Not Editable */}
              <p className="text-gray-800 text-right">{displaySenderName}</p>
            </div>

            {/* Footer Info */}
            <div className="text-gray-600 text-sm space-y-2 mt-2">
              <p>Generosity inspired by ZZZ's Giving Fund</p>
              <p>
                Use redemption code "<span className="font-bold">xxxxx</span>" to redeem your gift
                amount on www.yyyyy.com
              </p>
            </div>

            {/* Powered By */}
            <div className="text-center text-gray-400 text-sm mt-8">
              Powered by [our Dapp Name]
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .ant-input {
          border-radius: 24px !important;
        }
        
        .ant-select-selector {
          border-radius: 24px !important;
          height: 48px !important;
          display: flex !important;
          align-items: center !important;
        }
        
        .ant-select-selection-placeholder,
        .ant-select-selection-item {
          line-height: 46px !important;
        }
        
        .ant-checkbox-inner {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 2px solid #d1d5db;
        }
        
        .ant-checkbox-checked .ant-checkbox-inner {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border-color: transparent;
        }
        
        .ant-checkbox-checked .ant-checkbox-inner::after {
          border-color: white;
        }
        
        .ant-input:focus,
        .ant-input-focused,
        .ant-input:hover {
          border-color: #d4a5ff !important;
          box-shadow: 0 0 0 2px rgba(212, 165, 255, 0.1) !important;
        }
        
        .ant-select:hover .ant-select-selector,
        .ant-select-focused .ant-select-selector {
          border-color: #d4a5ff !important;
        }
        
        .ant-btn-primary:hover {
          opacity: 0.9;
        }
        
        textarea.ant-input {
          border-radius: 8px !important;
        }
        
        textarea.ant-input:focus {
          box-shadow: none !important;
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default SendGift;
