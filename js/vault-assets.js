async function initVaultAssets(){
// 2) set up ethers provider & signer
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer   = provider.getSigner();

  // 3) compute net ETH deposited via mint/burn events
  const { totalMintedWei, totalBurnedWei } = await vaultContractUtils.sumMintBurn(VAULT_ADDRESS, provider);
  const ethDepositedWei = totalMintedWei.sub(totalBurnedWei);
  const ethDeposited    = parseFloat(ethers.utils.formatEther(ethDepositedWei));

  // 4) fetch skins‐value and NAV (vaultValuation)
  const vaultData = await vaultContractUtils.getVaultData(VAULT_ADDRESS, signer);
  const skinsOwned = parseFloat(ethers.utils.formatEther(vaultData.skinsValueWei));
  const nav        = parseFloat(ethers.utils.formatEther(vaultData.vaultValuationWei));
  const ethHeld    = parseFloat(ethers.utils.formatEther(vaultData.ethBalanceWei));
  const btcHeld    = parseFloat(ethers.utils.formatEther(vaultData.btcReserveWei));
  const vaultVal   = parseFloat(ethers.utils.formatEther(vaultData.VaultValue));

  // 5) compute vault growth % = NAV / ETH‐in * 100
  const vaultGrowth = ethDeposited > 0
  ? ((nav - ethDeposited) / ethDeposited) * 100
  : 0;
  console.log(nav);
  console.log(ethDeposited);

  // 6) write values into your banner cards
  document.getElementById('ethDepositedValue').textContent  = `${ethDeposited.toFixed(6)} ETH`;
  document.getElementById('ethHeldValue').textContent       = `${ethHeld.toFixed(6)} ETH`;
  document.getElementById('skinsOwnedValue').textContent    = `${skinsOwned.toFixed(6)} ETH`;
  document.getElementById('btcHeldValue').textContent       = `${btcHeld.toFixed(6)} BTC`;
  document.getElementById('VaultValue').textContent         = `${vaultVal.toFixed(6)} ETH`;
  document.getElementById('vaultGrowthValue').textContent   = `${vaultGrowth.toFixed(2)} %`;
}
