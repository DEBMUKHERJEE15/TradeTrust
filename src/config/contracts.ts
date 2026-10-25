import contractsJson from "./contracts.json";
import CredentialRegistryArtifact from "../../artifacts/contracts/CredentialRegistry.sol/CredentialRegistry.json";
import SpendingAuthArtifact from "../../artifacts/contracts/SpendingAuthorization.sol/SpendingAuthorization.json";
import ZKVerifierArtifact from "../../artifacts/contracts/ZKRevenueVerifier.sol/ZKRevenueVerifier.json";
import MarketplaceArtifact from "../../artifacts/contracts/TradeTrustMarketplace.sol/TradeTrustMarketplace.json";
import LifecycleArtifact from "../../artifacts/contracts/FinancingAgreementLifecycle.sol/FinancingAgreementLifecycle.json";

export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  name: "Base Sepolia",
  network: "base-sepolia",
  nativeCurrency: {
    name: "Base Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"],
    },
    public: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://sepolia-explorer.base.org",
    },
  },
  testnet: true,
};

export const CONTRACT_ADDRESSES = {
  CredentialRegistry: contractsJson.contracts.CredentialRegistry.address,
  SpendingAuthorization: contractsJson.contracts.SpendingAuthorization.address,
  ZKRevenueVerifier: contractsJson.contracts.ZKRevenueVerifier.address,
  TradeTrustMarketplace: contractsJson.contracts.TradeTrustMarketplace.address,
  FinancingAgreementLifecycle: contractsJson.contracts.FinancingAgreementLifecycle.address,
};

export const CONTRACT_ABIS = {
  CredentialRegistry: CredentialRegistryArtifact.abi,
  SpendingAuthorization: SpendingAuthArtifact.abi,
  ZKRevenueVerifier: ZKVerifierArtifact.abi,
  TradeTrustMarketplace: MarketplaceArtifact.abi,
  FinancingAgreementLifecycle: LifecycleArtifact.abi,
};

export function getExplorerTxUrl(txHash: string): string {
  return `https://sepolia-explorer.base.org/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://sepolia-explorer.base.org/address/${address}`;
}
