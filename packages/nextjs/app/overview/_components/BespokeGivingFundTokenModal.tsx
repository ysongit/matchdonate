import { Button, Input, Modal, Form } from 'antd';
import { useScaffoldWriteContract } from '~~/hooks/scaffold-eth';

type BespokeGivingFundTokenProps = {
  isGivingModalOpen: boolean;
  setIsGivingModalOpen: Function;
};

export const BespokeGivingFundTokenModal = ({ isGivingModalOpen, setIsGivingModalOpen }: BespokeGivingFundTokenProps) => {
  const [givingForm] = Form.useForm();

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({ contractName: "BespokeFundTokenFactory" });

  const handleCreateGivingToken = () => {
    givingForm.validateFields().then(async (values) => {
      try {
        await writeYourContractAsync({
          functionName: "createFund",
          args: [values.tokenName, values.tokenSymbol],
        });
      } catch (e) {
        console.error("Error creating Bespoke Giving fund:", e);
      }
      console.log('Creating Giving Token:', values);
      // Add your token creation logic here
      setIsGivingModalOpen(false);
      givingForm.resetFields();
    });
  };

  return (
    <Modal
      title="Create My Own Giving Fund Token"
      open={isGivingModalOpen}
      onCancel={() => {
        setIsGivingModalOpen(false);
        givingForm.resetFields();
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            setIsGivingModalOpen(false);
            givingForm.resetFields();
          }}
        >
          Cancel
        </Button>,
        <Button
          key="create"
          type="primary"
          className="bg-purple-600 border-0 hover:bg-purple-700"
          onClick={handleCreateGivingToken}
        >
          Create Token
        </Button>,
      ]}
    >
      <Form form={givingForm} layout="vertical" className="mt-4">
        <Form.Item
          label="Token Name"
          name="tokenName"
          rules={[{ required: true, message: 'Please enter token name' }]}
        >
          <Input placeholder="Enter token name" size="large" />
        </Form.Item>
        <Form.Item
          label="Token Symbol"
          name="tokenSymbol"
          rules={[{ required: true, message: 'Please enter token symbol' }]}
        >
          <Input placeholder="Enter token symbol" size="large" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
