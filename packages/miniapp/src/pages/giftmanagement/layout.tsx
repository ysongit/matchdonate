import Sidebar from "../../components/Sidebar";
import GiftManagement from "./page";

const GiftManagementLayout = () => {
  return (
    <div className="flex">
      <Sidebar currentPage="gifting" />
      <div className="flex-1 p-8 bg-gray-50">
        <GiftManagement />
      </div>
    </div>
  );
};

export default GiftManagementLayout;
