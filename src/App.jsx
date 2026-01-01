import React, { useState, useEffect } from 'react'
import {
  ArrowDownUp,
  Wallet,
  ChevronDown,
  Droplet,
  AlertCircle,
} from 'lucide-react'

import { useAccount, useSigner, useProvider } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { ethers } from 'ethers'

// =====================
// Contract configuration
// =====================
const CONTRACT_ADDRESS = '0x61D57514f32e0aFF26d44015C4c7ED28a75D118a'

const CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'settle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [], name: 'tbill', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'ousg', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
]

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
]

const TOKENS = [
  { symbol: 'TBILL', name: 'T-Bill Token', color: 'from-green-400 to-green-600' },
  { symbol: 'OUSG', name: 'OUSG Token', color: 'from-purple-400 to-purple-600' },
]

export default function App() {
  // =====================
  // wagmi state
  // =====================
  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()

  // =====================
  // UI state
  // =====================
  const [fromToken, setFromToken] = useState('TBILL')
  const [toToken, setToToken] = useState('OUSG')
  const [fromAmount, setFromAmount] = useState('')
  const [balances, setBalances] = useState({})
  const [tokenAddresses, setTokenAddresses] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // =====================
  // Load token addresses + balances
  // =====================
  useEffect(() => {
    if (!isConnected || !address || !provider) return
    loadTokenAddresses()
  }, [isConnected, address, provider])

  useEffect(() => {
    if (!isConnected || !address || !provider) return
    if (!tokenAddresses.TBILL) return
    loadBalances()
  }, [tokenAddresses, isConnected, address, provider])

  const loadTokenAddresses = async () => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      const tbill = await contract.tbill()
      const ousg = await contract.ousg()
      setTokenAddresses({ TBILL: tbill, OUSG: ousg })
    } catch (e) {
      console.error(e)
      setError('Failed to load token addresses')
    }
  }

  const loadBalances = async () => {
    try {
      const tbill = new ethers.Contract(tokenAddresses.TBILL, ERC20_ABI, provider)
      const ousg = new ethers.Contract(tokenAddresses.OUSG, ERC20_ABI, provider)

      const [tb, og] = await Promise.all([
        tbill.balanceOf(address),
        ousg.balanceOf(address),
      ])

      setBalances({
        TBILL: ethers.utils.formatEther(tb),
        OUSG: ethers.utils.formatEther(og),
      })
    } catch (e) {
      console.error(e)
      setBalances({ TBILL: '0.00', OUSG: '0.00' })
    }
  }

  // =====================
  // Swap execution
  // =====================
  const handleSwap = async () => {
    if (!isConnected || !signer || !fromAmount) return
    setIsLoading(true)
    setError('')

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const token = new ethers.Contract(tokenAddresses[fromToken], ERC20_ABI, signer)

      const amount = ethers.utils.parseEther(fromAmount)
      const allowance = await token.allowance(address, CONTRACT_ADDRESS)

      if (allowance.lt(amount)) {
        const tx = await token.approve(CONTRACT_ADDRESS, amount)
        await tx.wait()
      }

      const tx = await contract.settle(address, amount)
      await tx.wait()

      await loadBalances()
      setFromAmount('')
    } catch (e) {
      console.error(e)
      setError(e.reason || 'Transaction failed')
    } finally {
      setIsLoading(false)
    }
  }

  const switchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
  }

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex justify-end mb-6">
          <ConnectKitButton.Custom>
            {({ isConnected, show, truncatedAddress }) => (
              <button
                onClick={show}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold"
                style={{ background: '#C1E328', color: '#000' }}
              >
                <Wallet size={16} />
                {isConnected ? truncatedAddress : 'Connect Wallet'}
              </button>
            )}
          </ConnectKitButton.Custom>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
            <AlertCircle size={18} className="text-red-500" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Swap Card */}
        <div className="bg-zinc-900 border border-gray-800 rounded-3xl p-6">

          {/* You Pay */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>You pay</span>
              <span>{balances[fromToken] || '0.00'} {fromToken}</span>
            </div>
            <input
              value={fromAmount}
              onChange={e => setFromAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-black text-3xl outline-none"
            />
          </div>

          {/* Switch */}
          <div className="flex justify-center mb-4">
            <button onClick={switchTokens} className="p-2 border border-gray-800 rounded-xl">
              <ArrowDownUp size={18} />
            </button>
          </div>

          {/* You Receive */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>You receive</span>
              <span>{balances[toToken] || '0.00'} {toToken}</span>
            </div>
            <input disabled placeholder="Auto" className="w-full bg-black text-3xl opacity-50" />
          </div>

          {/* Action */}
          <button
            disabled={!isConnected || !fromAmount || isLoading}
            onClick={handleSwap}
            className={`w-full py-4 rounded-2xl font-semibold ${
              isConnected && fromAmount
                ? 'bg-[#C1E328] text-black'
                : 'bg-zinc-800 text-gray-600'
            }`}
          >
            {!isConnected
              ? 'Connect Wallet'
              : isLoading
              ? 'Processing…'
              : 'Execute Route'}
          </button>
        </div>
      </div>
    </div>
  )
}
