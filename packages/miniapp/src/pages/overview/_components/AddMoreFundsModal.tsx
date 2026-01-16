import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { Button, Form, Input, Modal, Radio, Space, message } from "antd";
import { useConfig, useWriteContract } from "wagmi";
import { parseUnits } from "viem";

type AddMoreFundsTokenProps = {
  contracts: any,
  userAddress?: string;
  isAddMoreModalOpen: boolean;
  setIsAddMoreModalOpen: Function;
};

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;

export const AddMoreFundsModal = ({
  contracts,
  userAddress,
  isAddMoreModalOpen,
  setIsAddMoreModalOpen,
}: AddMoreFundsTokenProps) => {
  const [addMoreForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const config = useConfig();

  const { writeContract: writeYourContractAsync, error } = useWriteContract();

  async function getApproveAmount(): Promise<number> {
    // read from the chain to see if we have approved enough token
    const response = await readContract(config, {
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "allowance",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      address: USDC_ADDRESS as `0x${string}`,
      functionName: "allowance",
      // @ts-ignore
      args: [userAddress, contracts.GivingFundToken.address as `0x${string}`],
    });
    // @ts-ignore
    return response as number;
  }

  const handleAddMore = () => {
    addMoreForm.validateFields().then(async values => {
      try {
        const approvedAmount = await getApproveAmount();
        console.log(approvedAmount);

        const parseAmount = parseUnits(values.amount, 6);

        if (approvedAmount < parseAmount) {
          const approvalHash = writeYourContractAsync({
            abi: [
              {
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
              },
            ],
            address: USDC_ADDRESS as `0x${string}`,
            functionName: "approve",
            // @ts-ignore
            args: [contracts.GivingFundToken.address as `0x${string}`, BigInt(parseAmount)],
          });

          const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash,
          });
          console.log("Approval confirmed", approvalReceipt);
        }

        writeYourContractAsync({
          address: contracts.GivingFundToken.address,
          abi: contracts.GivingFundToken.abi,
          functionName: "mint",
          args: [parseAmount],
        });

        console.log("Adding funds:", values);
        setIsAddMoreModalOpen(false);
        addMoreForm.resetFields();
      } catch (e) {
        console.error("Error adding fund:", e);
      }
    });
  };

  if (error) {
    messageApi.destroy();
    messageApi.error(`Error: ${error.message}`);
  }

  return (
    <Modal
      title={null}
      open={isAddMoreModalOpen}
      onCancel={() => {
        setIsAddMoreModalOpen(false);
        addMoreForm.resetFields();
      }}
      footer={null}
      closeIcon={<span className="text-gray-400 text-2xl">×</span>}
      width={440}
    >
      <Form form={addMoreForm} layout="vertical" className="mt-4" initialValues={{ paymentMethod: "" }}>
        <Form.Item
          label={<span className="text-gray-700 font-semibold text-base">Amount</span>}
          name="amount"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <Input placeholder="Amount" size="large" className="rounded-md" />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-700 font-semibold text-base">Select Payment Method</span>}
          name="paymentMethod"
          rules={[{ required: true, message: "Please select a payment method" }]}
        >
          <Radio.Group className="w-full">
            <Space orientation="vertical" className="w-full" size="middle">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <Radio value="credit-debit">
                  <span className="text-gray-600">Credit/Debit Card</span>
                </Radio>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <Radio value="digital-wallet">
                  <span className="text-gray-600">Digital Wallet</span>
                </Radio>
              </div>
            </Space>
          </Radio.Group>
        </Form.Item>

        <div className="flex gap-3 mt-6">
          <Button
            type="primary"
            size="large"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 border-0 hover:from-purple-600 hover:to-pink-600 rounded-lg h-12 font-medium"
            onClick={handleAddMore}
          >
            Confirm
          </Button>
          <Button
            size="large"
            className="flex-1 bg-gray-200 border-0 hover:bg-gray-300 rounded-lg h-12 font-medium text-gray-700"
            onClick={() => {
              setIsAddMoreModalOpen(false);
              addMoreForm.resetFields();
            }}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
