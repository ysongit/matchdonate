import Sidebar from "~~/components/Sidebar";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Overview",
  description: "Overview",
});

const OverviewLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <Sidebar currentPage="overview" />
      <div className="flex-1 p-8 bg-gray-50">{children}</div>
    </div>
  );
};

export default OverviewLayout;
