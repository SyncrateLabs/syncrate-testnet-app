import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // ✅ REQUIRED

import { WagmiConfig, createClient } from 'wagmi'
import { getDefaultClient, ConnectKitProvider } from 'connectkit'
import { sepolia } from 'wagmi/chains'

const client = createClient(
  getDefaultClient({
    appName: 'Syncrate Testnet',
    chains: [sepolia],
    walletConnectProjectId: import.meta.env.VITE_WC_PROJECT_ID,
  })
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <App />
      </ConnectKitProvider>
    </WagmiConfig>
  </React.StrictMode>
)
