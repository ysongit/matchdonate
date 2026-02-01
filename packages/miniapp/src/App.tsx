import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from "antd";
import { useAccount, useConnect, useSignMessage } from "wagmi";

import { themeConfig } from "./utils/themeConfig";
import OverviewLayout from "./pages/overview/layout";
import MyGivingFundLayout from "./pages/mygivingfund/layout";
import SendGiftPageLayout from "./pages/sendgift/layout";
import Home from "./pages/Home";

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <ConfigProvider theme={themeConfig}>
      <HashRouter>
        <Routes>
          <Route
            path="/gifting"
            element={<SendGiftPageLayout />} />
          <Route
            path="/mygivingfund"
            element={<MyGivingFundLayout />} />
          <Route
            path="/overview"
            element={<OverviewLayout />} />
          <Route
            path="/"
            element={<Home />} />
        </Routes>
      </HashRouter>
      <ConnectMenu />
    </ConfigProvider>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <>
        <div>Connected account:</div>
        <div>{address}</div>
        <SignButton />
      </>
    );
  }

  return (
    <button type="button" onClick={() => connect({ connector: connectors[0] })}>
      Connect
    </button>
  );
}

function SignButton() {
  const { signMessage, isPending, data, error } = useSignMessage();

  return (
    <>
      <button type="button" onClick={() => signMessage({ message: "hello world" })} disabled={isPending}>
        {isPending ? "Signing..." : "Sign message"}
      </button>
      {data && (
        <>
          <div>Signature</div>
          <div>{data}</div>
        </>
      )}
      {error && (
        <>
          <div>Error</div>
          <div>{error.message}</div>
        </>
      )}
    </>
  );
}

export default App;
