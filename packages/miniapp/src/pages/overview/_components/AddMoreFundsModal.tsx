import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { Button, Form, Input, Modal, Radio, Space, message } from "antd";
import { useConfig, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { writeContract as writeContractviem } from 'viem/actions';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';

type AddMoreFundsTokenProps = {
  contracts: any,
  userAddress?: string;
  isAddMoreModalOpen: boolean;
  setIsAddMoreModalOpen: Function;
};

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;

const approve_ABI =  {
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

export const AddMoreFundsModal = ({
  contracts,
  userAddress,
  isAddMoreModalOpen,
  setIsAddMoreModalOpen,
}: AddMoreFundsTokenProps) => {
  const { client } = useSmartWallets();
  const [addMoreForm] = Form.useForm();
  const [messageApi] = message.useMessage();

  const config = useConfig();

  const { data: usdcAmount = 0n } = useReadContract({
    address: USDC_ADDRESS,
    abi: [{
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },],
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
  }) as { data: bigint };

  const { writeContractAsync, error } = useWriteContract();

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
          if (client) {
            const approvalHash = await writeContractviem(client, {
              abi: [approve_ABI],
              address: USDC_ADDRESS as `0x${string}`,
              functionName: "approve",
              args: [contracts.GivingFundToken.address as `0x${string}`, BigInt(parseAmount)],
            });

            const approvalReceipt = await waitForTransactionReceipt(config, {
              hash: approvalHash,
            });
            console.log("Approval confirmed", approvalReceipt);
          }
          else {
            // Await the approval hash first
            const approvalHash = await writeContractAsync({
              abi: [approve_ABI],
              address: USDC_ADDRESS as `0x${string}`,
              functionName: "approve",
              args: [contracts.GivingFundToken.address as `0x${string}`, BigInt(parseAmount)],
            });

            // Now wait for the approval transaction to be confirmed
            const approvalReceipt = await waitForTransactionReceipt(config, {
              hash: approvalHash,
            });
            console.log("Approval confirmed", approvalReceipt);
          }
        }

        if (client) {
          await writeContractviem(client, {
            address: contracts.GivingFundToken.address,
            abi: contracts.GivingFundToken.abi,
            functionName: "mint",
            args: [parseAmount],
          });
        } else {
          // Now proceed with the mint transaction
          await writeContractAsync({
            address: contracts.GivingFundToken.address,
            abi: contracts.GivingFundToken.abi,
            functionName: "mint",
            args: [parseAmount],
          });
        }
       
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
                  <span className="text-gray-600">Digital Wallet (${formatUnits(usdcAmount, 6)} USDC)</span>
                </Radio>
              </div>
            </Space>
          </Radio.Group>
        </Form.Item>

         <p>Smart Wallet: {client?.account?.address}</p>

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
