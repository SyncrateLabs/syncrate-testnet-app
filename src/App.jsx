import React, { useState, useEffect } from 'react';
import { ArrowDownUp, Wallet, ChevronDown, Droplet, AlertCircle } from 'lucide-react';
import { useAccount, useSigner, useProvider } from 'wagmi';
import { Web3Button } from '@web3modal/react';
import { ConnectKitButton } from 'connectkit'

// Contract configuration
const CONTRACT_ADDRESS = '0x61D57514f32e0aFF26d44015C4c7ED28a75D118a';
const CONTRACT_ABI = [{"inputs":[{"internalType":"address","name":"tbillToken","type":"address"},{"internalType":"address","name":"ousgToken","type":"address"},{"internalType":"address","name":"usdcToken","type":"address"},{"internalType":"address","name":"kycRegistry","type":"address"},{"internalType":"bytes32","name":"tbillAssetId","type":"bytes32"},{"internalType":"bytes32","name":"ousgAssetId","type":"bytes32"},{"internalType":"bytes32","name":"usdcAssetId","type":"bytes32"},{"internalType":"address","name":"tbillIssuer_","type":"address"},{"internalType":"address","name":"redemption_","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RouteCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"SettlementCompleted","type":"event"},{"inputs":[],"name":"OUSG_ASSET_ID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TBILL_ASSET_ID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC_ASSET_ID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"kyc","outputs":[{"internalType":"contract KYCRegistry","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ousg","outputs":[{"internalType":"contract OUSGToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"processed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"redemption","outputs":[{"internalType":"contract OUSGRedemptionMock","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"settle","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tbill","outputs":[{"internalType":"contract TBILLToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tbillIssuer","outputs":[{"internalType":"contract TBILLIssuerMock","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"usdc","outputs":[{"internalType":"contract MockUSDC","name":"","type":"address"}],"stateMutability":"view","type":"function"}];

// ERC20 ABI for balance and approve
const ERC20_ABI = [
"function balanceOf(address account) view returns (uint256)",
"function approve(address spender, uint256 amount) returns (bool)",
"function allowance(address owner, address spender) view returns (uint256)",
"function decimals() view returns (uint8)"
];

const TOKENS = [
{ symbol: 'TBILL', name: 'T-Bill Token', color: 'from-green-400 to-green-600', decimals: 18 },
{ symbol: 'OUSG', name: 'OUSG Token', color: 'from-purple-400 to-purple-600', decimals: 18 },
];

const TestnetDEX = () => {
const [fromAmount, setFromAmount] = useState('');
const [toAmount, setToAmount] = useState('');
const [fromToken, setFromToken] = useState('TBILL');
const [toToken, setToToken] = useState('OUSG');
const [balances, setBalances] = useState({});
const [isLoading, setIsLoading] = useState(false);
const [txHash, setTxHash] = useState('');
const [showFromDropdown, setShowFromDropdown] = useState(false);
const [showToDropdown, setShowToDropdown] = useState(false);
const [error, setError] = useState('');
const [provider, setProvider] = useState(null);
const [signer, setSigner] = useState(null);
const [tokenAddresses, setTokenAddresses] = useState({});
const [executionStep, setExecutionStep] = useState(0);
const [showProgress, setShowProgress] = useState(false);
    const { address, isConnected } = useAccount();
const { data: signer } = useSigner();
const provider = useProvider();

const executionSteps = [
"Checking User's KYC & Allowlist Status",
`Redeeming ${fromToken}`,
`${toToken} Issuance Request Sent`,
"Route Successful"
];

useEffect(() => {
  if (isConnected && address && provider) {
    loadTokenAddresses(provider);
    loadBalances(address, provider);
  }
}, [isConnected, address, provider]);
}
}
}, []);

const connectWallet = async () => {
if (typeof window.ethereum !== 'undefined') {
try {
setError('');
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
setWalletAddress(accounts[0]);
setIsWalletConnected(true);

const web3Provider = new window.ethers.providers.Web3Provider(window.ethereum);
    setProvider(web3Provider);
    const web3Signer = web3Provider.getSigner();
    setSigner(web3Signer);
    
    await loadTokenAddresses(web3Provider);
    await loadBalances(accounts[0], web3Provider);
  } catch (error) {
    console.error('Error connecting wallet:', error);
    setError('Failed to connect wallet. Please try again.');
  }
} else {
  setError('Please install MetaMask or another Web3 wallet to use this app.');
}
};

const loadTokenAddresses = async (web3Provider) => {
try {
const contract = new window.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Provider);
const tbillAddress = await contract.tbill();
const ousgAddress = await contract.ousg();

  setTokenAddresses({
    TBILL: tbillAddress,
    OUSG: ousgAddress
  });
} catch (error) {
  console.error('Error loading token addresses:', error);
}
};

const loadBalances = async (address, web3Provider) => {
try {
const contract = new window.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Provider);
const tbillAddress = await contract.tbill();
const ousgAddress = await contract.ousg();

  const tbillContract = new window.ethers.Contract(tbillAddress, ERC20_ABI, web3Provider);
  const ousgContract = new window.ethers.Contract(ousgAddress, ERC20_ABI, web3Provider);
  
  const tbillBalance = await tbillContract.balanceOf(address);
  const ousgBalance = await ousgContract.balanceOf(address);
  
  setBalances({
    TBILL: window.ethers.utils.formatEther(tbillBalance),
    OUSG: window.ethers.utils.formatEther(ousgBalance)
  });
} catch (error) {
  console.error('Error loading balances:', error);
  setBalances({
    TBILL: '0.00',
    OUSG: '0.00'
  });
}
};

const formatAddress = (address) => {
return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const handleSwap = async () => {
if (!isConnected || !fromAmount || !signer) return;

setIsLoading(true);
setShowProgress(true);
setError('');
setExecutionStep(0);

try {
  const contract = new window.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tokenAddress = tokenAddresses[fromToken];
  const tokenContract = new window.ethers.Contract(tokenAddress, ERC20_ABI, signer);
  
  const amount = window.ethers.utils.parseEther(fromAmount);
  
  // Step 1: Checking KYC & Allowlist
  await new Promise(resolve => setTimeout(resolve, 1500));
  setExecutionStep(1);
  
  // Check allowance
  const allowance = await tokenContract.allowance(address, CONTRACT_ADDRESS);
  
  if (allowance.lt(amount)) {
    // Need approval
    const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amount);
    await approveTx.wait();
  }
  
  // Step 2: Redeeming token
  await new Promise(resolve => setTimeout(resolve, 1500));
  setExecutionStep(2);
  
  // Call settle function
  const tx = await contract.settle(address, amount);
  
  // Step 3: Issuance request sent
  await new Promise(resolve => setTimeout(resolve, 1000));
  setExecutionStep(3);
  
  const receipt = await tx.wait();
  
  // Step 4: Route successful
  await new Promise(resolve => setTimeout(resolve, 1000));
  setExecutionStep(4);
  
  setTxHash(receipt.transactionHash);
  
  // Reload balances
await loadBalances(address, provider);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  setFromAmount('');
  setToAmount('');
  setShowProgress(false);
} catch (error) {
  console.error('Swap error:', error);
  setError(error.message || 'Transaction failed. Please try again.');
  setShowProgress(false);
} finally {
  setIsLoading(false);
  setExecutionStep(0);
}
};

const handleFaucet = () => {
window.open('https://sepoliafaucet.com', '_blank');
};

const getTokenColor = (symbol) => {
return TOKENS.find(t => t.symbol === symbol)?.color || 'from-gray-400 to-gray-600';
};

const switchTokens = () => {
setFromToken(toToken);
setToToken(fromToken);
setFromAmount(toAmount);
setToAmount(fromAmount);
};

return (
<div className="min-h-screen bg-black text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
{/* Header */}
<header className="border-b border-gray-800/50 px-6 py-4">
<div className="max-w-7xl mx-auto flex justify-end items-center">
<div className="flex items-center gap-3">
<button
onClick={handleFaucet}
className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-gray-800 text-white text-sm font-medium rounded-lg transition"
>
<Droplet size={14} />
Faucet
</button>
<button
<ConnectKitButton.Custom>
  {({ isConnected, show, truncatedAddress }) => (
    <button
      onClick={show}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition"
      style={{ backgroundColor: '#C1E328', color: '#000' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a8c922'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C1E328'}
    >
      <Wallet size={14} />
      {isConnected ? truncatedAddress : 'Connect Wallet'}
    </button>
  )}
</ConnectKitButton.Custom>
</button>
</div>
</div>
</header>

  {/* Main Content */}
  <main className="px-4 py-16">
    <div className="max-w-md mx-auto">
      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Swap Card */}
      <div className="bg-gradient-to-b from-zinc-900/50 to-zinc-900/30 border border-gray-800/50 rounded-3xl p-1 shadow-2xl backdrop-blur-sm">
        <div className="bg-zinc-950/90 rounded-3xl p-6">
          
          {/* You Pay Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">You pay</span>
              <span className="text-sm text-gray-500">
                Balance: {balances[fromToken] || '0.00'} {fromToken}
              </span>
            </div>
            <div className="bg-zinc-900/80 border border-gray-800/50 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <div className="relative">
                  <button 
                    onClick={() => setShowFromDropdown(!showFromDropdown)}
                    className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700/80 px-3 py-2 rounded-xl transition border border-gray-700/50"
                  >
                    <div className={`w-6 h-6 bg-gradient-to-br ${getTokenColor(fromToken)} rounded-full flex items-center justify-center text-xs font-bold`}>
                      {fromToken[0]}
                    </div>
                    <span className="font-semibold text-white">{fromToken}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                  
                  {showFromDropdown && (
                    <div className="absolute top-full mt-2 bg-zinc-900 border border-gray-800 rounded-xl overflow-hidden z-10 min-w-[160px]">
                      {TOKENS.map(token => (
                        <button
                          key={token.symbol}
                          onClick={() => {
                            setFromToken(token.symbol);
                            setShowFromDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-zinc-800 transition text-left"
                        >
                          <div className={`w-6 h-6 bg-gradient-to-br ${token.color} rounded-full flex items-center justify-center text-xs font-bold`}>
                            {token.symbol[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{token.symbol}</div>
                            <div className="text-xs text-gray-500">{token.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="0"
                  value={fromAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setFromAmount(value);
                    }
                  }}
                  className="bg-transparent text-3xl font-semibold outline-none text-right flex-1 ml-4 placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button 
              onClick={switchTokens}
              className="bg-zinc-900 border border-gray-800 hover:bg-zinc-800 p-2.5 rounded-xl transition"
            >
              <ArrowDownUp size={18} className="text-gray-400" />
            </button>
          </div>

          {/* You Receive Section */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">You receive</span>
              <span className="text-sm text-gray-500">
                Balance: {balances[toToken] || '0.00'} {toToken}
              </span>
            </div>
            <div className="bg-zinc-900/80 border border-gray-800/50 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <div className="relative">
                  <button 
                    onClick={() => setShowToDropdown(!showToDropdown)}
                    className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700/80 px-3 py-2 rounded-xl transition border border-gray-700/50"
                  >
                    <div className={`w-6 h-6 bg-gradient-to-br ${getTokenColor(toToken)} rounded-full flex items-center justify-center text-xs font-bold`}>
                      {toToken[0]}
                    </div>
                    <span className="font-semibold text-white">{toToken}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                  
                  {showToDropdown && (
                    <div className="absolute top-full mt-2 bg-zinc-900 border border-gray-800 rounded-xl overflow-hidden z-10 min-w-[160px]">
                      {TOKENS.map(token => (
                        <button
                          key={token.symbol}
                          onClick={() => {
                            setToToken(token.symbol);
                            setShowToDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-zinc-800 transition text-left"
                        >
                          <div className={`w-6 h-6 bg-gradient-to-br ${token.color} rounded-full flex items-center justify-center text-xs font-bold`}>
                            {token.symbol[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{token.symbol}</div>
                            <div className="text-xs text-gray-500">{token.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="0"
                  value={toAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setToAmount(value);
                    }
                  }}
                  className="bg-transparent text-3xl font-semibold outline-none text-right flex-1 ml-4 placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!isWalletConnected || !fromAmount || isLoading}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition mt-6 ${
              isWalletConnected && fromAmount && !isLoading
                ? 'text-black'
                : 'bg-zinc-800/50 text-gray-600 cursor-not-allowed border border-gray-800/50'
            }`}
            style={isWalletConnected && fromAmount && !isLoading ? { backgroundColor: '#C1E328' } : {}}
            onMouseEnter={(e) => {
              if (isWalletConnected && fromAmount && !isLoading) {
                e.currentTarget.style.backgroundColor = '#a8c922';
              }
            }}
            onMouseLeave={(e) => {
              if (isWalletConnected && fromAmount && !isLoading) {
                e.currentTarget.style.backgroundColor = '#C1E328';
              }
            }}
          >
            {!isWalletConnected
              ? 'Connect Wallet'
              : isLoading
              ? 'Processing...'
              : !fromAmount
              ? 'Enter Amount'
              : 'Execute Route'}
          </button>

          {/* Progress Steps */}
          {showProgress && (
            <div className="mt-4 bg-zinc-900/80 border border-gray-800/50 rounded-2xl p-4">
              {executionSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 mb-3 last:mb-0">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < executionStep 
                      ? 'bg-green-500 text-black' 
                      : index === executionStep 
                      ? 'bg-yellow-500 text-black animate-pulse' 
                      : 'bg-zinc-800 text-gray-500'
                  }`}>
                    {index < executionStep ? '✓' : index + 1}
                  </div>
                  <span className={`text-sm ${
                    index <= executionStep ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-yellow-600/5 border border-yellow-600/20 rounded-2xl p-4 text-sm">
        <p className="text-yellow-600/90">
          <strong>Testnet Mode:</strong> This is a test environment for compliant, on-chain settlement of tokenized real-world assets.
        </p>
      </div>
    </div>
  </main>
</div>
);
};

export default TestnetDEX;
