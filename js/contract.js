// common.js (updated to match SkinVault.sol)
const VAULT_ADDRESS   = '0xa82832a77C06e148560470d6c2efBAb0B3B332Bb';
const SKINDEX_ADDRESS = '0x2E22a92eF5562688B97df46d8AAa01Ad86597F66';

// SkinVault ABI - names/signatures updated to match Solidity implementation
const VAULT_ABI = [
  'function owner() view returns (address)',
  'function vaultManager() view returns (address)',
  'function ETHBalance() view returns (uint256)',
  'function VaultValuation() view returns (uint256)',
  'function InherentSKINDEXValue() view returns (uint256)',
  'function skinsValueWei() view returns (uint256)',
  'function btcReserveValueWei() view returns (uint256)',
  'function SendETHToContract() payable',
  'function mint() payable',
  'function burn(uint256)',
  'function seedVault()',
  'function pause()',
  'function unpause()',
  'function setVaultManager(address)',
  'function setDeveloper(address)',
  'function setSkinsValue(uint256)',
  'function setBtcReserveValue(uint256)',
  'function setMintFeeBP(uint256)',
  'function setBurnFeeBP(uint256)',
  'function setDeveloperFeeBP(uint256)',
  'function SendETHToExternalWallet(uint256,address)',
  'function mintFeeBP()             view returns (uint256)', 
  'function burnFeeBP()             view returns (uint256)',
  'function DEV_FEE_BP()            view returns (uint256)',
];

// ERC20 ABI for SKINDEX token
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)'
];

let provider, signer, user, vault, skindex;

// Connect to MetaMask and instantiate contracts
async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not detected');
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer   = provider.getSigner();
  user     = await signer.getAddress();
  vault    = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
  skindex  = new ethers.Contract(SKINDEX_ADDRESS, ERC20_ABI, provider);
  const acctEl = document.getElementById('account');
  if (acctEl) acctEl.textContent = `Connected: ${user}`;
}

// Generic action helper for write calls
async function action(fn, ...args) {
  const tx = await vault[fn](...args);
  await tx.wait();
  return tx;
}

window.connectWallet = connectWallet;
window.action        = action;
window.vault         = () => vault;
window.skindex       = () => skindex;
window.userAddress  = () => user;
