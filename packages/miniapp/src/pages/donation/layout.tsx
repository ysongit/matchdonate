import Sidebar from "../../components/Sidebar";
import Donation from "./page";

const DonationLayout = () => {
  return (
    <div className="flex">
      <Sidebar currentPage="donation" />
      <div className="flex-1 p-8 bg-gray-50">
        <Donation />
      </div>
    </div>
  );
};

export default DonationLayout;
