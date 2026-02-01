import Sidebar from "../../components/Sidebar";
import SendGift from "./page";

const SendGiftPageLayout = () => {
  return (
    <div className="flex">
      <Sidebar currentPage="gifting" />
      <div className="flex-1 p-8 bg-gray-50">
        <SendGift />
      </div>
    </div>
  );
};

export default SendGiftPageLayout;
