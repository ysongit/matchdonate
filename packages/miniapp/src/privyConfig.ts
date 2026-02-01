import type {PrivyClientConfig} from '@privy-io/react-auth';

// Replace this with your Privy config
export const privyConfig: PrivyClientConfig = {
  "appearance": {
    "accentColor": "#6A6FF5",
    "theme": "#FFFFFF",
    "showWalletLoginFirst": false,
    "logo": "https://auth.privy.io/logos/privy-logo.png",
    "walletChainType": "ethereum-only",
    "walletList": [
      "detected_ethereum_wallets",
      "metamask",
      "coinbase_wallet",
      "base_account",
      "rainbow",
      "wallet_connect"
    ]
  },
  "loginMethods": [
    "email",
    "wallet",
    "google",
    "apple",
    "sms",
    "linkedin"
  ],
  "fundingMethodConfig": {
    "moonpay": {
      "useSandbox": true
    }
  },
  "embeddedWallets": {
    "showWalletUIs": true,
    "ethereum": {
      "createOnLogin": "users-without-wallets"
    },
    "solana": {
      "createOnLogin": "off"
    }
  },
  "mfa": {
    "noPromptOnMfaRequired": false
  },
};
