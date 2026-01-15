import { Button, DatePicker, Form, Input, Modal } from "antd";
import { useWriteContract } from "wagmi";

type MatchingFundTokeProps = {
  contracts: any,
  isMatchingModalOpen: boolean;
  setIsMatchingModalOpen: Function;
};

export const MatchingFundTokenModal = ({ contracts, isMatchingModalOpen, setIsMatchingModalOpen }: MatchingFundTokeProps) => {
  const [matchingForm] = Form.useForm();

  const { writeContract: writeYourContractAsync } = useWriteContract();

  const handleCreateMatchingToken = () => {
    matchingForm.validateFields().then(async values => {
      try {
        // Convert date to Unix timestamp (in seconds)
        const timestamp = values.expirationDate ? Math.floor(values.expirationDate.valueOf() / 1000) : 0;

        writeYourContractAsync({
          address: contracts.MatchingFundTokenFactory.address,
          abi: contracts.MatchingFundTokenFactory.abi,
          functionName: "createFund",
          args: [values.tokenName, values.tokenSymbol, BigInt(timestamp)],
        });

        console.log("Creating Matching Token:", values, timestamp);
        setIsMatchingModalOpen(false);
        matchingForm.resetFields();
      } catch (e) {
        console.error("Error creating Bespoke Giving fund:", e);
      }
    });
  };

  return (
    <Modal
      title="Create My Matching Fund Token"
      open={isMatchingModalOpen}
      onCancel={() => {
        setIsMatchingModalOpen(false);
        matchingForm.resetFields();
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            setIsMatchingModalOpen(false);
            matchingForm.resetFields();
          }}
        >
          Cancel
        </Button>,
        <Button
          key="create"
          type="primary"
          className="bg-purple-600 border-0 hover:bg-purple-700"
          onClick={handleCreateMatchingToken}
        >
          Create Token
        </Button>,
      ]}
    >
      <Form form={matchingForm} layout="vertical" className="mt-4">
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
          label="Expiration Date"
          name="expirationDate"
          rules={[{ required: true, message: "Please select expiration date" }]}
        >
          <DatePicker className="w-full" size="large" placeholder="Select expiration date" format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
