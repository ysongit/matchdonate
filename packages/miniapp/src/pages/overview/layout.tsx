import Sidebar from "../../components/Sidebar";
import Overview from "./page";

const OverviewLayout = () => {
  return (
    <div className="flex">
      <Sidebar currentPage="overview" />
      <div className="flex-1 p-8 bg-gray-50">
        <Overview />
      </div>
    </div>
  );
};

export default OverviewLayout;
