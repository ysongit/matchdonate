import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';

import App from "./App.tsx";
import { config } from "./wagmi.ts";
import { privyConfig } from './privyConfig';

import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PrivyProvider appId={import.meta.env.VITE_PRIVY_APPID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <SmartWalletsProvider>
            <App />
          </SmartWalletsProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  </React.StrictMode>,
);
