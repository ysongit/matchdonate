import { useState } from "react";
import { Button, Form, Modal, Select, Checkbox, message } from "antd";
import { useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { writeContract as writeContractviem } from 'viem/actions';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';

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

type IncreaseBespokeFundModalProps = {
  selectedBespokeFund: FundDetails,
  givingFundTokenAmount: bigint,
  contracts: any;
  isModalOpen: boolean;
  setIsModalOpen: Function;
};

export const IncreaseBespokeFundModal = ({
  selectedBespokeFund,
  givingFundTokenAmount,
  contracts,
  isModalOpen,
  setIsModalOpen,
}: IncreaseBespokeFundModalProps) => {
  const { client } = useSmartWallets();
  const [givingForm] = Form.useForm();
  const [messageApi] = message.useMessage();
  
  const [fundingRequired, setFundingRequired] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string[]>([]);

  const { writeContract: writeYourContractAsync, error } = useWriteContract();

  const handleCreateGivingToken = () => {
    givingForm.validateFields().then(async (values) => {
      try {
        console.log(fundingRequired.toString(), parseUnits(fundingRequired.toString(), 6));
        if (client) {
          // @ts-ignore
          await writeContractviem(client, {
             address: contracts.BespokeFundTokenFactory.address,
            abi: contracts.BespokeFundTokenFactory.abi,
            functionName: "increaseFunding",
            args: [parseUnits(fundingRequired.toString(), 6), selectedBespokeFund.address as `0x${string}`],
          });
        } else {
          writeYourContractAsync({
            address: contracts.BespokeFundTokenFactory.address,
            abi: contracts.BespokeFundTokenFactory.abi,
            functionName: "increaseFunding",
            args: [parseUnits(fundingRequired.toString(), 6), selectedBespokeFund.address as `0x${string}`],
          });
        }
      } catch (e) {
        console.error("Error increasing funding for Bespoke Token:", e);
      }
      console.log("Increase funding for Bespoke Token:", {
        ...values,
        paymentMethods: selectedPaymentMethod,
      });
      setIsModalOpen(false);
      setFundingRequired(0);
      givingForm.resetFields();
      setSelectedPaymentMethod([]);
    });
  };

  const handlePercentageChange = (value: number | null) => {
    setFundingRequired(0);
    if (value && Number(selectedBespokeFund?.percentageFunded) < value) {      
      // Calculate the additional amount required
      const currentFunded = Number(formatUnits(selectedBespokeFund.fundedGFT, 6));
      const currentPercentage = Number(selectedBespokeFund.percentageFunded);
      const targetPercentage = value;
      
      // Formula: additional amount = current funded amount × (increase in percentage / current percentage)
      const additionalAmount = currentFunded * ((targetPercentage - currentPercentage) / currentPercentage);
      
      setFundingRequired(additionalAmount);
    }
  };

  if (error) {
    messageApi.destroy();
    messageApi.error(`Error: ${error.message}`);
  }

  return (
    <Modal
      title={selectedBespokeFund?.name}
      open={isModalOpen}
      onCancel={() => {
        setIsModalOpen(false);
        setFundingRequired(0);
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
          fundingPercentage: selectedBespokeFund?.percentageFunded,
        }}
      >
        <Form.Item
          label={<span className="text-xl font-semibold">Percentage Funded: {selectedBespokeFund?.percentageFunded}%</span>}
          name="fundingPercentage"
        >
          <div>
            <Select
              defaultValue={Number(selectedBespokeFund?.percentageFunded)}
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
              setIsModalOpen(false);
              setFundingRequired(0);
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
            Confirm
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
