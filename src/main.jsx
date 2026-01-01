import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { WagmiConfig, createConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { sepolia } from 'viem/chains'

const chains = [sepolia]
const projectId = '8e690417846443eb4cdc01723cc9f0d4'

const config = createConfig(
  getDefaultConfig({
    chains,
    walletConnectProjectId: projectId,
    appName: 'Syncrate Testnet',
  
  }),
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <App />
      </ConnectKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
)
