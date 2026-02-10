import { useState, useEffect, useRef } from 'react';
import { Input, Checkbox, Select, Button } from 'antd';
import { PencilIcon, EyeIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { useChainId, useConfig, useReadContract, useWriteContract } from 'wagmi';
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import deployedContracts from "../../contracts/deployedContracts";
import { useWalletAddress } from "../../hooks/useWalletAddress";
import { parseUnits } from 'viem';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { generateRedeemCode } from '../../utils/generateRedeemCode';
import { GiftBatchModal } from './_components';

interface FundDetails {
  address: string;
  creator: string;
  name: string;
  symbol: string;
  createdAt: bigint;
  exists: boolean;
  availableTokens: bigint;
  fundedGFT: bigint;
  tokenType: number;
}

interface Recipient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  giftAmount: string;
}

interface FormData {
  deliveryMethod: {
    email: boolean;
    text: boolean;
  };
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  occasion: string;
  giftNameTag: string;
  fundToken: string;
  tokenType: number;
}

const { TextArea } = Input;

const occasionOptions = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'thank_you', label: 'Thank You' },
  { value: 'congratulations', label: 'Congratulations' },
  { value: 'employee_welcome', label: 'Employee Welcome' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'other', label: 'Other' },
];

const approve_ABI = {
  inputs: [
    {
      internalType: "address",
      name: "spender",
      type: "address",
    },
    {
      internalType: "uint256",
      name: "amount",
      type: "uint256",
    },
  ],
  name: "approve",
  outputs: [
    {
      internalType: "bool",
      name: "",
      type: "bool",
    },
  ],
  stateMutability: "nonpayable",
  type: "function",
}

const SendGift: React.FC = () => {
  const chainId = useChainId();
  const config = useConfig();
  const { address } = useWalletAddress();
  const { client } = useSmartWallets();

  const contracts = deployedContracts[chainId as keyof typeof deployedContracts];

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState<number>(0);
  const [showAllRecipients, setShowAllRecipients] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    deliveryMethod: {
      email: false,
      text: false,
    },
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    occasion: '',
    giftNameTag: '',
    fundToken: '',
    tokenType: 0,
  });

  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: 1, firstName: '', lastName: '', email: '', phoneNumber: '', giftAmount: '' },
    { id: 2, firstName: '', lastName: '', email: '', phoneNumber: '', giftAmount: '' },
    { id: 3, firstName: '', lastName: '', email: '', phoneNumber: '', giftAmount: '' },
  ]);

  const [editableMessage, setEditableMessage] = useState<string>(
    `I wanted to give you something that feels right for who you are.

Over the years, I've watched you pour genuine care into making a difference—not for recognition, but because you actually believe in helping others.

So I'm sending you a charity fund gift to donate wherever your heart tells you to. Whether it's a cause you've been thinking about or one you're passionate about right now, I want to support that. Your generosity inspires me, and this feels like the best way to celebrate you.

Thank you for being the kind of person you are. Here's to another year of you doing good in the world.`
  );

  const [bespokeFundsDetails, setBespokeFundsDetails] = useState<FundDetails[]>([]);
  const [isLoadingBespokeDetails, setIsBespokeLoadingDetails] = useState(false);
  const [matchingFundsDetails, setMatchingFundsDetails] = useState<FundDetails[]>([]);
  const [isMatchingLoadingDetails, setIsMatchingLoadingDetails] = useState(false);
  const [redeemCode, setRedeemCode] = useState(generateRedeemCode());

  const { data: bespokeFundTokenAddresses } = useReadContract({
    address: contracts?.BespokeFundTokenFactory?.address,
    abi: contracts?.BespokeFundTokenFactory?.abi,
    functionName: "getUserFunds",
    args: [address as `0x${string}`],
  });

  const { data: matchingFundTokenAddresses } = useReadContract({
    address: contracts?.MatchingFundTokenFactory?.address,
    abi: contracts?.MatchingFundTokenFactory?.abi,
    functionName: "getUserFunds",
    args: [address as `0x${string}`],
  });

  const { writeContractAsync, error } = useWriteContract();

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
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
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
            fundedGFT: fundedGFT,
            tokenType: 1
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
      setMatchingFundsDetails([]);
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
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
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
            createdAt: response[4],
            exists: true,
            availableTokens: availableTokens,
            fundedGFT: fundedGFT,
            tokenType: 2
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

  async function getApproveAmount(fundToken: string): Promise<number> {
    const response = await readContract(config, {
      abi: [
        {
          inputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "address", name: "", type: "address" },
          ],
          name: "allowance",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ],
      address: fundToken as `0x${string}`,
      functionName: "allowance",
      // @ts-ignore
      args: [address, contracts.GiftBox.address as `0x${string}`],
    });
    // @ts-ignore
    return response as number;
  }

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectTokenChange = (value: string, option: any): void => {
    setFormData((prev) => ({
      ...prev,
      fundToken: value,
      tokenType: option?.label?.tokenType || 0,
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

  const handleRecipientChange = (id: number, field: keyof Recipient, value: string): void => {
    setRecipients((prev) =>
      prev.map((recipient) =>
        recipient.id === id ? { ...recipient, [field]: value } : recipient
      )
    );
  };

  const addMoreRows = (): void => {
    const newId = Math.max(...recipients.map((r) => r.id)) + 1;
    setRecipients((prev) => [
      ...prev,
      { id: newId, firstName: '', lastName: '', email: '', phoneNumber: '', giftAmount: '' },
    ]);
  };

  const calculateTotalGiftAmount = (): number => {
    return recipients.reduce((total, recipient) => {
      const amount = parseFloat(recipient.giftAmount) || 0;
      return total + amount;
    }, 0);
  };

  const handleCSVUpload = (file: File): boolean => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());
      const newRecipients: Recipient[] = [];

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        if (values.length >= 5) {
          newRecipients.push({
            id: i,
            firstName: values[0] || '',
            lastName: values[1] || '',
            email: values[2] || '',
            phoneNumber: values[3] || '',
            giftAmount: values[4] || '',
          });
        }
      }

      if (newRecipients.length > 0) {
        setRecipients(newRecipients);
        setIsBatchModalOpen(false);
      }
    };
    reader.readAsText(file);
    return false; // Prevent default upload behavior
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCSVUpload(file);
    }
  };

  const openBatchModal = () => {
    setUploadedFileName('');
    setIsBatchModalOpen(true);
  };

  const handleSendingGift = async () => {
    try {
      const totalAmount = calculateTotalGiftAmount();
      const approvedAmount = await getApproveAmount(formData.fundToken);
      const parseAmount = parseUnits(totalAmount.toString(), 6);

      if (approvedAmount < parseAmount) {
        if (client) {
          // @ts-ignore
          const approvalHash = await writeContractviem(client, {
            abi: [approve_ABI],
            address: formData.fundToken as `0x${string}`,
            functionName: "approve",
            args: [deployedContracts[chainId].GiftBox.address as `0x${string}`, BigInt(parseAmount)],
          });

          const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash,
          });
          console.log("Approval confirmed", approvalReceipt);
        } else {
          const approvalHash = await writeContractAsync({
            abi: [approve_ABI],
            address: formData.fundToken as `0x${string}`,
            functionName: "approve",
            args: [contracts.GiftBox.address as `0x${string}`, BigInt(parseAmount)],
          });

          const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash,
          });
          console.log("Approval confirmed", approvalReceipt);
        }
      }

      // Send gift for each recipient
      for (const recipient of recipients) {
        if (recipient.giftAmount && parseFloat(recipient.giftAmount) > 0) {
          const recipientAmount = parseUnits(recipient.giftAmount, 6);
          const newRedeemCode = generateRedeemCode();

          if (client) {
            // @ts-ignore
            await writeContractviem(client, {
              address: deployedContracts[chainId].GiftBox.address,
              abi: deployedContracts[chainId].GiftBox.abi,
              functionName: "createGift",
              args: [formData.fundToken, recipientAmount, newRedeemCode, formData.tokenType],
            });
          } else {
            await writeContractAsync({
              address: deployedContracts[chainId].GiftBox.address,
              abi: deployedContracts[chainId].GiftBox.abi,
              functionName: "createGift",
              args: [formData.fundToken, recipientAmount, newRedeemCode, formData.tokenType],
            });
          }
        }
      }

      setRedeemCode(generateRedeemCode());
    } catch (e) {
      console.error("Error sending gift:", e);
    }
  };

  const handlePreviousPreview = () => {
    setCurrentPreviewIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextPreview = () => {
    const filledRecipients = recipients.filter((r) => r.firstName || r.lastName);
    setCurrentPreviewIndex((prev) => Math.min(filledRecipients.length - 1, prev + 1));
  };

  const getCurrentRecipient = (): Recipient | null => {
    const filledRecipients = recipients.filter((r) => r.firstName || r.lastName);
    return filledRecipients[currentPreviewIndex] || null;
  };

  const currentRecipient = getCurrentRecipient();
  const displayRecipientName = currentRecipient
    ? `${currentRecipient.firstName || 'FIRST'} ${currentRecipient.lastName || 'NAME'}`
    : 'RECIPIENT FIRST NAME';
  const displaySenderName = formData.senderName || '[Sender Name]';
  const filledRecipientsCount = recipients.filter((r) => r.firstName || r.lastName).length;

  const visibleRecipients = showAllRecipients ? recipients : recipients.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto mb-4">
        <p className="text-sm text-gray-600 font-medium">
          <span className="text-gray-800 font-semibold">Dashboard</span>/Send Gifts
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div
          className="bg-white rounded-2xl p-6 md:p-8"
          style={{
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Title */}
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
            Create a Gift – <span className="text-purple-600">Spread the Joy of Giving</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Panel - Form */}
            <div className="space-y-5">
              {/* Delivery Method Section */}
              <div className="border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Delivery Method</h3>
                <div className="space-y-2">
                  <Checkbox
                    checked={formData.deliveryMethod.email}
                    onChange={() => handleDeliveryMethodChange('email')}
                    className="custom-checkbox"
                  >
                    <span className="text-sm text-gray-500">Email</span>
                  </Checkbox>
                  <div className="block">
                    <Checkbox
                      checked={formData.deliveryMethod.text}
                      onChange={() => handleDeliveryMethodChange('text')}
                      className="custom-checkbox"
                    >
                      <span className="text-sm text-gray-500">Texting via Phone Number</span>
                    </Checkbox>
                  </div>
                </div>
              </div>

              {/* From Section */}
              <div className="border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">From</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Sender Name or company name"
                    value={formData.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    className="h-11 rounded-lg border-gray-200"
                    style={{ borderRadius: '8px' }}
                  />
                  <Input
                    placeholder="Email"
                    value={formData.senderEmail}
                    onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                    className="h-11 rounded-lg border-gray-200"
                    style={{ borderRadius: '8px' }}
                  />
                  <Input
                    placeholder="Mobile Phone Number"
                    value={formData.senderPhone}
                    onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                    className="h-11 rounded-lg border-gray-200"
                    style={{ borderRadius: '8px' }}
                  />
                </div>
              </div>

              {/* Occasion & Gift Name Tag Section */}
              <div className="border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Occasion</h3>
                <Select
                  placeholder="Occasion"
                  value={formData.occasion || undefined}
                  onChange={(value) => handleInputChange('occasion', value)}
                  className="w-full md:w-48 h-11 mb-4"
                  style={{ borderRadius: '8px' }}
                  options={occasionOptions}
                />

                <h3 className="text-sm font-semibold text-gray-700 mb-3">Gift Name Tag</h3>
                <Input
                  placeholder="Enter tags to identify this gift creation"
                  value={formData.giftNameTag}
                  onChange={(e) => handleInputChange('giftNameTag', e.target.value)}
                  className="h-11 rounded-lg border-gray-200 w-full md:w-72"
                  style={{ borderRadius: '8px' }}
                />
              </div>

              {/* Select Giving Fund & Recipients Section */}
              <div className="border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Giving Fund</h3>
                <Select
                  placeholder="Fund Token"
                  value={formData.fundToken || undefined}
                  onChange={handleSelectTokenChange}
                  className="w-full md:w-40 h-11 mb-4"
                  style={{ borderRadius: '8px' }}
                >
                  {bespokeFundsDetails?.map((bespokeFund) => (
                    <Select.Option key={bespokeFund.address} label={bespokeFund} value={bespokeFund.address}>
                      {bespokeFund.name}
                    </Select.Option>
                  ))}
                  {matchingFundsDetails?.map((matchingFund) => (
                    <Select.Option key={matchingFund.address} label={matchingFund} value={matchingFund.address}>
                      {matchingFund.name}
                    </Select.Option>
                  ))}
                </Select>

                <h3 className="text-sm font-semibold text-gray-700 mb-3">Enter Recipients</h3>

                {/* CSV Upload Button - Opens Modal */}
                <Button
                  className="mb-4 h-10 rounded-lg border-gray-300 text-gray-500 hover:border-purple-400"
                  style={{ borderRadius: '8px' }}
                  icon={<ArrowUpTrayIcon className="w-4 h-4" />}
                  onClick={openBatchModal}
                >
                  Upload CSV file for Multiple Recipients
                </Button>

                {/* Recipients Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs">
                        <th className="text-left pb-2 pr-2 w-8"></th>
                        <th className="text-left pb-2 pr-2 font-normal">First Name</th>
                        <th className="text-left pb-2 pr-2 font-normal">Last Name</th>
                        <th className="text-left pb-2 pr-2 font-normal">Email</th>
                        <th className="text-left pb-2 pr-2 font-normal">Phone Number</th>
                        <th className="text-left pb-2 font-normal">Gift Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRecipients.map((recipient, index) => (
                        <tr key={recipient.id} className="border-t border-gray-100">
                          <td className="py-2 pr-2 text-gray-400 text-xs">{index + 1}</td>
                          <td className="py-2 pr-2">
                            <Input
                              placeholder="First Name"
                              value={recipient.firstName}
                              onChange={(e) => handleRecipientChange(recipient.id, 'firstName', e.target.value)}
                              className="h-9 text-xs border-0 bg-transparent p-0"
                              style={{ boxShadow: 'none' }}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              placeholder="Last Name"
                              value={recipient.lastName}
                              onChange={(e) => handleRecipientChange(recipient.id, 'lastName', e.target.value)}
                              className="h-9 text-xs border-0 bg-transparent p-0"
                              style={{ boxShadow: 'none' }}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              placeholder="Email"
                              value={recipient.email}
                              onChange={(e) => handleRecipientChange(recipient.id, 'email', e.target.value)}
                              className="h-9 text-xs border-0 bg-transparent p-0"
                              style={{ boxShadow: 'none' }}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              placeholder="Phone Number"
                              value={recipient.phoneNumber}
                              onChange={(e) => handleRecipientChange(recipient.id, 'phoneNumber', e.target.value)}
                              className="h-9 text-xs border-0 bg-transparent p-0"
                              style={{ boxShadow: 'none' }}
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              placeholder="Gift Amount"
                              value={recipient.giftAmount}
                              onChange={(e) => handleRecipientChange(recipient.id, 'giftAmount', e.target.value)}
                              className="h-9 text-xs border-0 bg-transparent p-0"
                              style={{ boxShadow: 'none' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add More & Show All */}
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={addMoreRows}
                    className="text-purple-500 hover:text-purple-600 text-sm font-medium flex items-center gap-1"
                  >
                    Add more rows <span>→</span>
                  </button>
                  {recipients.length > 3 && (
                    <button
                      onClick={() => setShowAllRecipients(!showAllRecipients)}
                      className="text-purple-500 hover:text-purple-600 text-sm font-medium"
                    >
                      {showAllRecipients ? 'Show less' : 'Show all'}
                    </button>
                  )}
                </div>
              </div>

              {/* Total Gift Amount */}
              <div className="text-base font-semibold text-gray-700">
                Total Gift Amount: <span className="text-gray-800">${calculateTotalGiftAmount().toLocaleString()}</span>
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
                  className={`h-11 px-6 rounded-lg font-semibold flex items-center`}
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
                  className="h-11 px-6 rounded-lg font-semibold flex items-center"
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
              <div
                className="bg-white rounded-lg p-6 md:p-8 flex-1"
                style={{
                  border: '2px solid transparent',
                  backgroundImage:
                    'linear-gradient(white, white), linear-gradient(135deg, #e879a8 0%, #d4a5ff 50%, #e879a8 100%)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                {/* Greeting */}
                <p className="text-gray-600 mb-4 italic">Dear [{displayRecipientName}],</p>

                {/* Editable Message Area */}
                {isEditing ? (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-purple-300">
                    <TextArea
                      value={editableMessage}
                      onChange={(e) => setEditableMessage(e.target.value)}
                      autoSize={{ minRows: 8, maxRows: 16 }}
                      className="bg-transparent border-none resize-none text-gray-600 text-sm leading-relaxed"
                      style={{
                        background: 'transparent',
                        boxShadow: 'none',
                        padding: 0,
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-6">
                    {editableMessage.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-600 text-sm leading-relaxed mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Signature */}
                <p className="text-gray-600 text-right mb-6">{displaySenderName}</p>

                {/* Footer Links */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-500 text-sm">
                    Generosity inspired by{' '}
                    <a href="#" className="text-gray-700 underline hover:text-purple-600">
                      ZZZ's Giving Fund
                    </a>{' '}
                    from{' '}
                    <a href="#" className="text-gray-700 underline hover:text-purple-600">
                      Company XYZ
                    </a>
                  </p>
                </div>
              </div>

              {/* Preview Navigation */}
              {filledRecipientsCount > 1 && (
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handlePreviousPreview}
                    disabled={currentPreviewIndex === 0}
                    className={`text-sm font-medium ${
                      currentPreviewIndex === 0 ? 'text-gray-300' : 'text-purple-500 hover:text-purple-600'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPreview}
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
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              type="primary"
              size="large"
              className="h-12 px-12 rounded-full font-semibold text-sm uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #e879a8 0%, #d4a5ff 100%)',
                border: 'none',
                borderRadius: '32px',
              }}
              onClick={handleSendingGift}
            >
              Send
            </Button>
            <Button
              size="large"
              className="h-12 px-8 rounded-full font-semibold text-sm uppercase tracking-wider bg-gray-200 text-gray-600 hover:bg-gray-300 border-0"
              style={{ borderRadius: '32px' }}
            >
              Save for Later
            </Button>
          </div>
        </div>
      </div>

      {/* Sending Gift Batch Modal */}
      <GiftBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        fileInputRef={fileInputRef}
        handleFileInputChange={handleFileInputChange}
        uploadedFileName={uploadedFileName}
      />

      {/* Custom Styles */}
      <style>{`
        .ant-input {
          border-radius: 8px !important;
        }
        
        .ant-select-selector {
          border-radius: 8px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }
        
        .ant-select-selection-placeholder,
        .ant-select-selection-item {
          line-height: 42px !important;
        }
        
        .ant-checkbox-inner {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid #d1d5db;
          background: #f3e8ff;
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

        .custom-checkbox .ant-checkbox + span {
          padding-left: 8px;
        }

        .ant-upload-wrapper {
          display: block;
        }

        .batch-upload-modal .ant-modal-content {
          padding: 0 !important;
          border-radius: 12px !important;
        }
      `}</style>
    </div>
  );
};

export default SendGift;
