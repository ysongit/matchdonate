import React, { useState } from 'react';
import { Modal } from 'antd';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface Recipient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  giftAmount: string;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecipient: Recipient | null;
  displaySenderName: string;
  displayRecipientName: string;
  editableMessage: string;
  redeemCode: string;
  occasion: string;
  occasionLabel: string;
  filledRecipientsCount: number;
  currentPreviewIndex: number;
  onPreviousPreview: () => void;
  onNextPreview: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  currentRecipient,
  displaySenderName,
  displayRecipientName,
  editableMessage,
  redeemCode,
  occasion,
  occasionLabel,
  filledRecipientsCount,
  currentPreviewIndex,
  onPreviousPreview,
  onNextPreview,
}) => {
  const [previewTab, setPreviewTab] = useState<'email' | 'texting'>('email');

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={700}
      className="preview-modal"
      styles={{
        content: {
          borderRadius: '12px',
          padding: 0,
          overflow: 'hidden',
          maxHeight: '90vh',
        },
      }}
    >
      <div className="relative bg-white rounded-xl">
        {/* Header with Navigation */}
        <div className="flex justify-end items-center gap-4 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={onPreviousPreview}
              disabled={currentPreviewIndex === 0}
              className={`text-sm font-medium ${
                currentPreviewIndex === 0 ? 'text-gray-300' : 'text-purple-500 hover:text-purple-600'
              }`}
            >
              Previous
            </button>
            <button
              onClick={onNextPreview}
              disabled={currentPreviewIndex >= filledRecipientsCount - 1}
              className={`text-sm font-medium flex items-center gap-1 ${
                currentPreviewIndex >= filledRecipientsCount - 1
                  ? 'text-gray-300'
                  : 'text-purple-500 hover:text-purple-600'
              }`}
            >
              Next <span>→</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setPreviewTab('email')}
            className={`flex-1 py-3 text-center font-medium transition-all ${
              previewTab === 'email'
                ? 'text-gray-800 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setPreviewTab('texting')}
            className={`flex-1 py-3 text-center font-medium transition-all ${
              previewTab === 'texting'
                ? 'text-gray-800 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Texting
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {previewTab === 'email' ? (
            /* Email Preview */
            <div className="text-center">
              {/* Gift Icon */}
              <div className="flex justify-center mb-4">
                <div className="text-5xl">🎁</div>
              </div>

              {/* Header Text */}
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                [{displaySenderName}] sent you a gift to<br />
                share the joy of giving back.
              </h2>

              {/* Message Card */}
              <div className="border-l-4 border-purple-400 bg-white text-left px-5 py-4 mb-4 mx-auto max-w-lg">
                <p className="text-purple-500 font-medium mb-3">From [{displaySenderName}]</p>
                
                {editableMessage.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-600 text-sm leading-relaxed mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Gift Details */}
              <div className="border-l-4 border-purple-400 bg-white text-left px-5 py-3 mb-4 mx-auto max-w-lg">
                <p className="text-purple-500 text-sm font-medium">XYZ Giving Fund</p>
                <p className="text-purple-500 text-sm font-medium">
                  Gift Amount: ${currentRecipient?.giftAmount || '0'}
                </p>
                <p className="text-purple-500 text-sm font-medium">
                  Redemption Code: {redeemCode}
                </p>
              </div>

              {/* Footer Link */}
              <p className="text-gray-500 text-sm mb-8">
                Generosity inspired by{' '}
                <a href="#" className="text-gray-700 underline">XYZ Giving Fund</a>
                {' '}form{' '}
                <a href="#" className="text-gray-700 underline">Company XYZ</a>
              </p>

              {/* Instructions Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  First time receiving a gift on<br />
                  <span className="text-purple-500">MakeGivingFun:D</span>?
                </h3>
                
                <p className="text-gray-500 text-sm mb-6">
                  <span className="text-purple-500">💜MakeGivingFun:D</span> let you effortless share the joy of giving and<br />
                  support charity you believe in.
                </p>

                {/* Steps */}
                <div className="text-left max-w-sm mx-auto space-y-4">
                  <div>
                    <p className="text-purple-500 font-bold text-sm">STEP 1</p>
                    <p className="text-gray-600 text-sm">Go to www.makegivingfund.org</p>
                  </div>
                  <div>
                    <p className="text-purple-500 font-bold text-sm">STEP 2</p>
                    <p className="text-gray-600 text-sm">Click "Redeem a Gift Code"</p>
                  </div>
                  <div>
                    <p className="text-purple-500 font-bold text-sm">STEP 3</p>
                    <p className="text-gray-600 text-sm">
                      Enter your code and start sharing or giving<br />
                      and receive reward points for our weekly prize<br />
                      wheel spin and more.
                    </p>
                  </div>
                </div>

                {/* Email Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
                  <p className="mb-2">
                    You received this email because{' '}
                    <a href="#" className="text-purple-400">xxxx@gmail.com</a>
                    {' '}is using MakeGivingFun:D to send<br />
                    you a gift at{' '}
                    <a href="#" className="text-purple-400">xxxxxx@gmail.com</a>.
                    {' '}To opt out of all gifts,{' '}
                    <a href="#" className="text-purple-400 underline">unsubscribe here</a>.
                  </p>

                  <div className="mt-4">
                    <p className="text-purple-400">💜MakeGivingFun:D</p>
                    <p>99 Wall Street, Suite#668</p>
                    <p>New York, NY, 10005</p>
                  </div>

                  <div className="mt-4">
                    <a href="#" className="text-purple-400 underline">Goody Terms of Use</a>
                    {' '}and{' '}
                    <a href="#" className="text-purple-400 underline">Privacy Policy</a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Texting Preview */
            <div className="max-w-md mx-auto">
              <div className="border-l-4 border-purple-300 pl-4 py-2">
                <p className="text-purple-400 text-sm leading-relaxed mb-4">
                  Hey [{currentRecipient?.firstName || 'recipient name'}], [{displaySenderName}] sent you a gift to
                  share the joy of giving for your [{occasionLabel || 'occasion'}].
                </p>

                <p className="text-purple-400 text-sm leading-relaxed mb-1">
                  Please use code {redeemCode} to redeem your gift on
                </p>
                <p className="text-purple-400 text-sm leading-relaxed mb-1">
                  www.makegivingfund.org.
                </p>
                <p className="text-purple-400 text-sm leading-relaxed mb-1">
                  Generosity inspired by XYZ Giving Fund from
                </p>
                <p className="text-purple-400 text-sm leading-relaxed mb-1">
                  Company XYZ
                </p>
                <p className="text-purple-400 text-sm leading-relaxed mb-4">
                  [hyperlink].
                </p>

                <p className="text-purple-400 text-sm leading-relaxed">
                  This message was sent via MakeGivingFund:D, a
                  service [{displaySenderName}] is using to you a gift. Reply
                  STOP to opt out. Text [our number] for support.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .preview-modal .ant-modal-content {
          padding: 0 !important;
          border-radius: 12px !important;
        }
      `}</style>
    </Modal>
  );
};
