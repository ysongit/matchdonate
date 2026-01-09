import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Overview",
  description: "Overview",
});

const OverviewLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default OverviewLayout;
