import { Button, Input, Modal, Form, Radio, Space } from 'antd';
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { useChainId, useConfig, useWriteContract } from "wagmi";
import { useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import deployedContracts from '~~/contracts/deployedContracts';

type AddMoreFundsTokenProps = {
  userAddress: string,
  isAddMoreModalOpen: boolean;
  setIsAddMoreModalOpen: Function;
};

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;

export const AddMoreFundsModal = ({ userAddress, isAddMoreModalOpen, setIsAddMoreModalOpen }: AddMoreFundsTokenProps) => {
  const [addMoreForm] = Form.useForm();

  const chainId = useChainId();
  const config = useConfig();

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({ contractName: "GivingFundToken" });
  const { writeContractAsync } = useWriteContract();

  async function getApproveAmount(): Promise<number> {
    // read from the chain to see if we have approved enough token
    const response = await readContract(config, {
      abi: [{
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
      },],
      address: USDC_ADDRESS as `0x${string}`,
      functionName: "allowance",
      // @ts-ignore
      args: [userAddress, deployedContracts[chainId].GivingFundToken.address  as `0x${string}`]
    });
    // @ts-ignore
    return response as number;
  }

  const handleAddMore = () => {
    addMoreForm.validateFields().then(async (values) => {
       try {
        const approvedAmount = await getApproveAmount();
        console.log(approvedAmount);

        const parseAmount = parseUnits(values.amount, 6);

        if (approvedAmount < parseAmount) {
          const approvalHash = await writeContractAsync({
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
            args: [deployedContracts[chainId].GivingFundToken.address as `0x${string}`, BigInt(values.amount)],
          })

          const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash
          })
          console.log("Approval confirmed", approvalReceipt);
        }

        await writeYourContractAsync({
          functionName: "mint",
          args: [parseAmount],
        });

        console.log('Adding funds:', values);
        setIsAddMoreModalOpen(false);
        addMoreForm.resetFields();
      } catch (e) {
        console.error("Error adding fund:", e);
      }
    });
  };

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
      <Form 
        form={addMoreForm} 
        layout="vertical" 
        className="mt-4"
        initialValues={{ paymentMethod: '' }}
      >
        <Form.Item
          label={<span className="text-gray-700 font-semibold text-base">Amount</span>}
          name="amount"
          rules={[{ required: true, message: 'Please enter amount' }]}
        >
          <Input placeholder="Amount" size="large" className="rounded-md" />
        </Form.Item>
        
        <Form.Item
          label={<span className="text-gray-700 font-semibold text-base">Select Payment Method</span>}
          name="paymentMethod"
          rules={[{ required: true, message: 'Please select a payment method' }]}
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
