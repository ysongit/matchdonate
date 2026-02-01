import Sidebar from "../../components/Sidebar";
import MyGivingFund from "./page";

const MyGivingFundLayout = () => {
  return (
    <div className="flex">
      <Sidebar currentPage="mygivingfund" />
      <div className="flex-1 p-8 bg-gray-50">
        <MyGivingFund />
      </div>
    </div>
  );
};

export default MyGivingFundLayout;
