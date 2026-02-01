import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { http } from "wagmi";
import { createConfig } from '@privy-io/wagmi';
// import { baseSepolia } from "wagmi/chains";
import { hardhat } from "wagmi/chains";

export const config = createConfig({
  chains: [hardhat],
  connectors: [miniAppConnector()],
  transports: {
    // [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`),
    [hardhat.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
