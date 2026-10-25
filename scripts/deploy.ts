import hre from "hardhat";
const { ethers, network } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log(`\n======================================================`);
  console.log(`Starting TradeTrust Base Sepolia Contract Deployment`);
  console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId || 84532})`);
  console.log(`======================================================\n`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer Account: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} ETH\n`);

  // 1. CredentialRegistry
  console.log("1. Deploying CredentialRegistry...");
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  await credentialRegistry.waitForDeployment();
  const credentialRegistryAddress = await credentialRegistry.getAddress();
  console.log(`   -> CredentialRegistry deployed at: ${credentialRegistryAddress}`);

  // 2. SpendingAuthorization
  console.log("2. Deploying SpendingAuthorization (AI Agentic Commerce)...");
  const SpendingAuth = await ethers.getContractFactory("SpendingAuthorization");
  const spendingAuth = await SpendingAuth.deploy();
  await spendingAuth.waitForDeployment();
  const spendingAuthAddress = await spendingAuth.getAddress();
  console.log(`   -> SpendingAuthorization deployed at: ${spendingAuthAddress}`);

  // 3. ZKRevenueVerifier
  console.log("3. Deploying ZKRevenueVerifier (ZK Privacy Track)...");
  const ZKRevenueVerifier = await ethers.getContractFactory("ZKRevenueVerifier");
  const zkVerifier = await ZKRevenueVerifier.deploy();
  await zkVerifier.waitForDeployment();
  const zkVerifierAddress = await zkVerifier.getAddress();
  console.log(`   -> ZKRevenueVerifier deployed at: ${zkVerifierAddress}`);

  // 4. TradeTrustMarketplace
  console.log("4. Deploying TradeTrustMarketplace...");
  const TradeTrustMarketplace = await ethers.getContractFactory("TradeTrustMarketplace");
  const marketplace = await TradeTrustMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`   -> TradeTrustMarketplace deployed at: ${marketplaceAddress}`);

  // 5. FinancingAgreementLifecycle
  console.log("5. Deploying FinancingAgreementLifecycle...");
  const FinancingAgreementLifecycle = await ethers.getContractFactory("FinancingAgreementLifecycle");
  const lifecycle = await FinancingAgreementLifecycle.deploy();
  await lifecycle.waitForDeployment();
  const lifecycleAddress = await lifecycle.getAddress();
  console.log(`   -> FinancingAgreementLifecycle deployed at: ${lifecycleAddress}`);

  // Linking contracts
  console.log("\nLinking Marketplace and Lifecycle contracts...");
  await marketplace.setLifecycleContract(lifecycleAddress);
  await lifecycle.setMarketplace(marketplaceAddress);
  console.log("   -> Contract linking complete.");

  // Save deployment metadata
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId || 84532,
    rpcUrl: "https://sepolia.base.org",
    explorerBaseUrl: "https://sepolia-explorer.base.org",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      CredentialRegistry: {
        address: credentialRegistryAddress,
        explorerUrl: `https://sepolia-explorer.base.org/address/${credentialRegistryAddress}`
      },
      SpendingAuthorization: {
        address: spendingAuthAddress,
        explorerUrl: `https://sepolia-explorer.base.org/address/${spendingAuthAddress}`
      },
      ZKRevenueVerifier: {
        address: zkVerifierAddress,
        explorerUrl: `https://sepolia-explorer.base.org/address/${zkVerifierAddress}`
      },
      TradeTrustMarketplace: {
        address: marketplaceAddress,
        explorerUrl: `https://sepolia-explorer.base.org/address/${marketplaceAddress}`
      },
      FinancingAgreementLifecycle: {
        address: lifecycleAddress,
        explorerUrl: `https://sepolia-explorer.base.org/address/${lifecycleAddress}`
      }
    }
  };

  const outputDir = path.join(process.cwd(), "src/config");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "contracts.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment metadata exported to: ${outputPath}`);

  console.log(`\n======================================================`);
  console.log(`TradeTrust Contracts Deployed & Configured Successfully!`);
  console.log(`======================================================\n`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
