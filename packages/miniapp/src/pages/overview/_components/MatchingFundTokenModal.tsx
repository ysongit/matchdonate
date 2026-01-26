import { useState } from "react";
import { Button, DatePicker, Form, Input, Modal, Select, InputNumber, Checkbox } from "antd";
import { useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { writeContract as writeContractviem } from 'viem/actions';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';

type MatchingFundTokeProps = {
  givingFundTokenAmount: bigint,
  contracts: any,
  isMatchingModalOpen: boolean;
  setIsMatchingModalOpen: Function;
};

export const MatchingFundTokenModal = ({ givingFundTokenAmount, contracts, isMatchingModalOpen, setIsMatchingModalOpen }: MatchingFundTokeProps) => {
  const [matchingForm] = Form.useForm();
   const { client } = useSmartWallets();

  const [amount, setAmount] = useState(0);
  const [fundingPercentage, setFundingPercentage] = useState(100);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string[]>([]);

  const fundingRequired = (amount * fundingPercentage) / 100;

  const { writeContract: writeYourContractAsync } = useWriteContract();

  const handleCreateMatchingToken = () => {
    matchingForm.validateFields().then(async values => {
      try {
        // Convert date to Unix timestamp (in seconds)
        const timestamp = values.expirationDate ? Math.floor(values.expirationDate.valueOf() / 1000) : 0;

        if (client) {
          await writeContractviem(client, {
            address: contracts.MatchingFundTokenFactory.address,
            abi: contracts.MatchingFundTokenFactory.abi,
            functionName: "createFund",
            args: [values.tokenName, values.tokenSymbol, parseUnits(amount?.toString(), 6), parseUnits(fundingRequired.toString(), 6), BigInt(timestamp)],
          });
        } else {
          writeYourContractAsync({
            address: contracts.MatchingFundTokenFactory.address,
            abi: contracts.MatchingFundTokenFactory.abi,
            functionName: "createFund",
            args: [values.tokenName, values.tokenSymbol, parseUnits(amount?.toString(), 6), parseUnits(fundingRequired.toString(), 6), BigInt(timestamp)],
          });
        }

        console.log("Creating Matching Token:", values, timestamp);
        setIsMatchingModalOpen(false);
        matchingForm.resetFields();
      } catch (e) {
        console.error("Error creating Bespoke Giving fund:", e);
      }
    });
  };

  const handleAmountChange = (value: number | null) => {
    if (value) {
      setAmount(value);
    }
  };

  const handlePercentageChange = (value: number | null) => {
    if (value) {
      setFundingPercentage(value);
    }
  };

  return (
    <Modal
      title="Create My Matching Fund Token"
      open={isMatchingModalOpen}
      onCancel={() => {
        setIsMatchingModalOpen(false);
        matchingForm.resetFields();
      }}
      footer={null}
    >
      <Form
        form={matchingForm}
        layout="vertical"
        className="mt-4"
        initialValues={{
          amount: 0,
          fundingPercentage: 100,
          nonprofitRecipients: "ALL",
        }}
      >
        <Form.Item label="Token Name" name="tokenName" rules={[{ required: true, message: "Please enter token name" }]}>
          <Input placeholder="Enter token name" size="large" />
        </Form.Item>

        <Form.Item
          label="Token Symbol"
          name="tokenSymbol"
          rules={[{ required: true, message: "Please enter token symbol" }]}
        >
          <Input placeholder="Enter token symbol" size="large" />
        </Form.Item>

        <Form.Item
          label={<span className="text-xl font-semibold">Amount</span>}
          name="amount"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <InputNumber
            size="large"
            className="w-full text-xl font-semibold"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            onChange={handleAmountChange}
            value={amount}
            min={0}
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-xl font-semibold">Funding Percentage</span>}
          name="fundingPercentage"
        >
          <div>
            <Select
              defaultValue={100}
              size="large"
              className="w-full mb-2"
              onChange={handlePercentageChange}
              options={[
                { value: 50, label: "50%" },
                { value: 75, label: "75%" },
                { value: 100, label: "100%" },
              ]}
            />
          </div>
          <div className="text-gray-500 text-base">
            Funding Required: ${fundingRequired.toLocaleString()}
          </div>
        </Form.Item>

        <Form.Item
          label={<span className="text-xl font-semibold">Nonprofit Recipients</span>}
          name="nonprofitRecipients"
        >
          <Select
            size="large"
            className="w-full"
            options={[
              { value: "ALL", label: "ALL" },
              { value: "Education", label: "Education" },
              { value: "Health", label: "Health" },
              { value: "Environment", label: "Environment" },
              { value: "Arts", label: "Arts & Culture" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Expiration Date"
          name="expirationDate"
          rules={[{ required: true, message: "Please select expiration date" }]}
        >
          <DatePicker className="w-full" size="large" placeholder="Select expiration date" format="YYYY-MM-DD" />
        </Form.Item>

        <div className="mb-6">
          <div className="text-xl font-semibold mb-4">Select A Payment Method</div>
          <div className="space-y-3">
            <div
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                if (selectedPaymentMethod.includes("general")) {
                  setSelectedPaymentMethod(
                    selectedPaymentMethod.filter((m) => m !== "general")
                  );
                } else {
                  setSelectedPaymentMethod([...selectedPaymentMethod, "general"]);
                }
              }}
            >
              <Checkbox
                checked={selectedPaymentMethod.includes("general")}
                className="mr-3"
              >
                <span className="text-gray-600">General Giving Fund: ${formatUnits(givingFundTokenAmount, 6)}</span>
              </Checkbox>
            </div>

            <div
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                if (selectedPaymentMethod.includes("usdc")) {
                  setSelectedPaymentMethod(
                    selectedPaymentMethod.filter((m) => m !== "usdc")
                  );
                } else {
                  setSelectedPaymentMethod([...selectedPaymentMethod, "usdc"]);
                }
              }}
            >
              <Checkbox
                checked={selectedPaymentMethod.includes("usdc")}
                className="mr-3"
              >
                <span className="text-gray-600">USDC</span>
              </Checkbox>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            size="large"
            onClick={() => {
              setIsMatchingModalOpen(false);
              matchingForm.resetFields();
            }}
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            className="bg-purple-600 border-0 hover:bg-purple-700"
            onClick={handleCreateMatchingToken}
          >
            Create Token
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
