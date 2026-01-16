import { useState } from "react";
import { Button, Form, Input, Modal, Select, InputNumber, Checkbox } from "antd";
import { useWriteContract } from "wagmi";
import { formatUnits } from "viem";

type BespokeGivingFundTokenProps = {
  givingFundTokenAmount: bigint,
  contracts: any;
  isGivingModalOpen: boolean;
  setIsGivingModalOpen: Function;
};

export const BespokeGivingFundTokenModal = ({
  givingFundTokenAmount,
  contracts,
  isGivingModalOpen,
  setIsGivingModalOpen,
}: BespokeGivingFundTokenProps) => {
  const [givingForm] = Form.useForm();
  
  const [amount, setAmount] = useState(0);
  const [fundingPercentage, setFundingPercentage] = useState(100);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string[]>([]);

  const { writeContract: writeYourContractAsync } = useWriteContract();

  const handleCreateGivingToken = () => {
    givingForm.validateFields().then(async (values) => {
      try {
        writeYourContractAsync({
          address: contracts.BespokeFundTokenFactory.address,
          abi: contracts.BespokeFundTokenFactory.abi,
          functionName: "createFund",
           args: [values.tokenName, values.tokenSymbol],
        });
      } catch (e) {
        console.error("Error creating Bespoke Giving fund:", e);
      }
      console.log("Creating Giving Token:", {
        ...values,
        paymentMethods: selectedPaymentMethod,
      });
      setIsGivingModalOpen(false);
      givingForm.resetFields();
      setSelectedPaymentMethod([]);
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

  const fundingRequired = (amount * fundingPercentage) / 100;

  return (
    <Modal
      title="Giving Fund Token Name"
      open={isGivingModalOpen}
      onCancel={() => {
        setIsGivingModalOpen(false);
        givingForm.resetFields();
        setSelectedPaymentMethod([]);
      }}
      footer={null}
      width={600}
      closeIcon={
        <span className="text-2xl text-gray-400 hover:text-gray-600">×</span>
      }
    >
      <Form
        form={givingForm}
        layout="vertical"
        className="mt-6"
        initialValues={{
          amount: 0,
          fundingPercentage: 100,
          nonprofitRecipients: "ALL",
        }}
      >
        <Form.Item
          name="tokenName"
          rules={[{ required: true, message: "Please enter token name" }]}
        >
          <Input
            placeholder="Enter token name"
            size="large"
            className="text-base"
          />
        </Form.Item>

        <Form.Item
          label="Token Symbol"
          name="tokenSymbol"
          rules={[{ required: true, message: "Please enter token symbol" }]}
        >
          <Input placeholder="Enter token symbol" size="large" />
        </Form.Item>

        <div className="flex">
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
                  { value: 25, label: "25%" },
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
        </div>

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
              setIsGivingModalOpen(false);
              givingForm.resetFields();
              setSelectedPaymentMethod([]);
            }}
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            className="bg-purple-600 border-0 hover:bg-purple-700"
            onClick={handleCreateGivingToken}
          >
            Create Token
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
