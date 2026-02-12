import React, { useRef } from 'react';
import { Modal, Button } from 'antd';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface GiftBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File) => void;
  uploadedFileName: string;
}

// CSV Template content
const csvTemplateContent = `First Name,Last Name,Email,Phone Number,Gift Amount
`;

export const GiftBatchModal: React.FC<GiftBatchModalProps> = ({
  isOpen,
  onClose,
  onFileUpload,
  uploadedFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadCSVTemplate = () => {
    const blob = new Blob([csvTemplateContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Gift-Recipients.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={420}
      className="batch-upload-modal"
      styles={{
        content: {
          borderRadius: '12px',
          padding: 0,
          overflow: 'hidden',
        },
      }}
    >
      <div className="relative bg-white p-6 rounded-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-gray-400" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-purple-600 mb-4">Sending Gift Batch</h2>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-2">
          Download this{' '}
          <button
            onClick={downloadCSVTemplate}
            className="text-purple-500 font-semibold hover:text-purple-600 underline"
          >
            Gift-Recipients.csv
          </button>{' '}
          spreadsheet to create multiple gifts.
        </p>

        <p className="text-gray-600 text-sm mb-6">
          Be sure to save it as a ".csv" file and upload it here
        </p>

        {/* File Upload */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <Button
            type="primary"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 px-6 rounded-full font-medium"
            style={{
              background: 'linear-gradient(135deg, #e879a8 0%, #d4a5ff 100%)',
              border: 'none',
              borderRadius: '20px',
            }}
          >
            Choose File
          </Button>
          <span className="text-gray-400 text-sm">
            {uploadedFileName || 'No file chosen'}
          </span>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .batch-upload-modal .ant-modal-content {
          padding: 0 !important;
          border-radius: 12px !important;
        }
      `}</style>
    </Modal>
  );
};
