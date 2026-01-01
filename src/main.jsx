import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { WagmiProvider, createConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { sepolia } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'  // Add this import

const chains = [sepolia]
const projectId = '8e690417846443eb4cdc01723cc9f0d4'

const config = createConfig(
  getDefaultConfig({
    chains,
    walletConnectProjectId: projectId,
    appName: 'Syncrate Testnet',
  }),
)

const queryClient = new QueryClient()  // Add this for query management

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>  // Add this wrapper
        <ConnectKitProvider>
          <App />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
