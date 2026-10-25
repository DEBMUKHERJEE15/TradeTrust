"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getStore, saveStore } from "@/lib/state/demoStore";

export type WalletType = "injected" | "metamask" | "coinbase" | "rainbow" | "rabby" | "demo";

export interface ConnectedWalletState {
  address: string | null;
  isConnected: boolean;
  walletType: WalletType | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  balance: string;
  isConnecting: boolean;
  error: string | null;
  connectWallet: (type: WalletType) => Promise<boolean>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}

const BASE_SEPOLIA_CHAIN_ID = 84532;
const BASE_SEPOLIA_HEX = "0x14a34";

const BASE_SEPOLIA_CONFIG = {
  chainId: BASE_SEPOLIA_HEX,
  chainName: "Base Sepolia",
  nativeCurrency: {
    name: "Base Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

const WalletContext = createContext<ConnectedWalletState | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>("0.0000 ETH");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isCorrectNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

  // Fetch ETH balance for an address
  const fetchBalance = useCallback(async (addr: string, isDemoMode: boolean = false) => {
    if (isDemoMode) {
      setBalance("1.8500 ETH");
      return;
    }

    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const hexBal = await (window as any).ethereum.request({
          method: "eth_getBalance",
          params: [addr, "latest"],
        });
        const wei = BigInt(hexBal);
        const ethVal = (Number(wei) / 1e18).toFixed(4);
        setBalance(`${ethVal} ETH`);
      } catch {
        setBalance("0.5000 ETH");
      }
    }
  }, []);

  // Update application state when wallet connects
  const syncWithStore = useCallback((newAddress: string, connected: boolean) => {
    try {
      const store = getStore();
      const updated = {
        ...store,
        walletAddress: newAddress,
        isWalletConnected: connected,
        merchantProfile: {
          ...store.merchantProfile,
          walletAddress: newAddress,
        },
      };
      saveStore(updated);
    } catch {}
  }, []);

  // Switch or add Base Sepolia network
  const switchNetwork = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      return false;
    }
    const eth = (window as any).ethereum;

    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA_HEX }],
      });
      setChainId(BASE_SEPOLIA_CHAIN_ID);
      setError(null);
      return true;
    } catch (switchError: any) {
      // 4902 indicates chain has not been added
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [BASE_SEPOLIA_CONFIG],
          });
          setChainId(BASE_SEPOLIA_CHAIN_ID);
          setError(null);
          return true;
        } catch (addError: any) {
          setError(addError.message || "Failed to add Base Sepolia network");
          return false;
        }
      } else {
        setError(switchError.message || "Failed to switch network");
        return false;
      }
    }
  }, []);

  // Connect wallet handler
  const connectWallet = useCallback(
    async (type: WalletType): Promise<boolean> => {
      setIsConnecting(true);
      setError(null);

      // Handle Demo / Sandbox Wallet mode
      if (type === "demo") {
        const demoAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        setAddress(demoAddress);
        setIsConnected(true);
        setWalletType("demo");
        setChainId(BASE_SEPOLIA_CHAIN_ID);
        setBalance("1.8500 ETH");
        syncWithStore(demoAddress, true);

        try {
          localStorage.setItem("tradetrust_connected_wallet_type", "demo");
          localStorage.setItem("tradetrust_connected_address", demoAddress);
        } catch {}

        setIsConnecting(false);
        return true;
      }

      // Check if Ethereum provider exists in browser
      if (typeof window === "undefined" || !(window as any).ethereum) {
        setError("No Web3 wallet extension detected in this browser. Please install MetaMask, Coinbase Wallet, or use the Demo Sandbox Wallet.");
        setIsConnecting(false);
        return false;
      }

      const eth = (window as any).ethereum;

      try {
        // Request accounts
        const accounts: string[] = await eth.request({
          method: "eth_requestAccounts",
        });

        if (!accounts || accounts.length === 0) {
          setError("No accounts found. Please unlock your wallet.");
          setIsConnecting(false);
          return false;
        }

        const activeAccount = accounts[0];
        setAddress(activeAccount);
        setIsConnected(true);
        setWalletType(type);

        // Check network
        const rawChainId: string = await eth.request({ method: "eth_chainId" });
        const numericChainId = parseInt(rawChainId, 16);
        setChainId(numericChainId);

        // If not on Base Sepolia, attempt automatic switch
        if (numericChainId !== BASE_SEPOLIA_CHAIN_ID) {
          await switchNetwork();
        }

        // Fetch balance
        await fetchBalance(activeAccount);

        // Sync with store
        syncWithStore(activeAccount, true);

        // Save session
        try {
          localStorage.setItem("tradetrust_connected_wallet_type", type);
          localStorage.setItem("tradetrust_connected_address", activeAccount);
        } catch {}

        setIsConnecting(false);
        return true;
      } catch (err: any) {
        console.error("Wallet connection failed:", err);
        setError(err.message || "User rejected connection request");
        setIsConnecting(false);
        return false;
      }
    },
    [fetchBalance, switchNetwork, syncWithStore]
  );

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setWalletType(null);
    setBalance("0.0000 ETH");
    setChainId(null);
    setError(null);

    syncWithStore("0x0000000000000000000000000000000000000000", false);

    try {
      localStorage.removeItem("tradetrust_connected_wallet_type");
      localStorage.removeItem("tradetrust_connected_address");
    } catch {}
  }, [syncWithStore]);

  const refreshBalance = useCallback(async () => {
    if (address) {
      await fetchBalance(address, walletType === "demo");
    }
  }, [address, walletType, fetchBalance]);

  // Check for unlocked browser wallet accounts or restore session on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedType = localStorage.getItem("tradetrust_connected_wallet_type");
      const savedAddr = localStorage.getItem("tradetrust_connected_address");

      if (savedType === "demo" && savedAddr) {
        setAddress(savedAddr);
        setIsConnected(true);
        setWalletType("demo");
        setChainId(BASE_SEPOLIA_CHAIN_ID);
        setBalance("1.8500 ETH");
        syncWithStore(savedAddr, true);
        return;
      }

      if (savedType && savedAddr && (window as any).ethereum) {
        const eth = (window as any).ethereum;
        eth.request({ method: "eth_accounts" })
          .then((accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              setAddress(accounts[0]);
              setIsConnected(true);
              setWalletType(savedType as WalletType);
              fetchBalance(accounts[0]);
              syncWithStore(accounts[0], true);
            }
          })
          .catch(() => {});
      }
    } catch {}

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const eth = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(accounts[0]);
          setIsConnected(true);
          fetchBalance(accounts[0]);
          syncWithStore(accounts[0], true);
        }
      };

      const handleChainChanged = (newChainId: string) => {
        setChainId(parseInt(newChainId, 16));
      };

      const handleDisconnect = () => {
        disconnectWallet();
      };

      eth.on("accountsChanged", handleAccountsChanged);
      eth.on("chainChanged", handleChainChanged);
      eth.on("disconnect", handleDisconnect);

      return () => {
        if (eth.removeListener) {
          eth.removeListener("accountsChanged", handleAccountsChanged);
          eth.removeListener("chainChanged", handleChainChanged);
          eth.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [disconnectWallet, fetchBalance, syncWithStore]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        walletType,
        chainId,
        isCorrectNetwork,
        balance,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
