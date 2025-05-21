// vault-contract.js
;(function(window){
  const { ethers } = window;

  // — your ABIs —
  const VAULT_ABI = [
    'function owner() view returns (address)',
    'function vaultManager() view returns (address)',
    'function ETHBalance() view returns (uint256)',
    'function VaultValuation() view returns (uint256)',
    'function InherentSKINDEXValue() view returns (uint256)',
    'function skinsValueWei() view returns (uint256)',
    'function btcReserveValueWei() view returns (uint256)',
    'event Minted(address indexed user, uint256 ethIn, uint256 tokensToUser)',
    'event Burned(address indexed user, uint256 tokensBurned, uint256 ethOut)'
  ];
  const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function totalSupply() view returns (uint256)'
  ];

  // — factory helpers —
  function createVaultContract(address, signerOrProvider) {
    return new ethers.Contract(address, VAULT_ABI, signerOrProvider);
  }
  function createErc20Contract(address, signerOrProvider) {
    return new ethers.Contract(address, ERC20_ABI, signerOrProvider);
  }

  // — sum all Minted / Burned events to get total ETH in/out —
  async function sumMintBurn(vaultAddress, provider) {
    const iface = new ethers.utils.Interface(VAULT_ABI);
    const mintTopic = iface.getEventTopic('Minted');
    const burnTopic = iface.getEventTopic('Burned');

    const [mintLogs, burnLogs] = await Promise.all([
      provider.getLogs({ address: vaultAddress, fromBlock: 0, toBlock: 'latest', topics: [mintTopic] }),
      provider.getLogs({ address: vaultAddress, fromBlock: 0, toBlock: 'latest', topics: [burnTopic] })
    ]);

    const ZERO = ethers.BigNumber.from(0);
    const totalMintedWei = mintLogs.reduce((sum, log) => {
      const { args } = iface.parseLog(log);
      return sum.add(args.ethIn);
    }, ZERO);
    const totalBurnedWei = burnLogs.reduce((sum, log) => {
      const { args } = iface.parseLog(log);
      return sum.add(args.ethOut);
    }, ZERO);

    return { totalMintedWei, totalBurnedWei };
  }

  // — grab all Vault view functions in one go —
  async function getVaultData(vaultAddress, signer) {
    const vault = createVaultContract(vaultAddress, signer);
    const [
      owner,
      vaultManager,
      ethBalanceWei,
      vaultValuationWei,
      inherentSkxWei,
      skinsValueWei,
      btcReserveWei
    ] = await Promise.all([
      vault.owner(),
      vault.vaultManager(),
      vault.ETHBalance(),
      vault.VaultValuation(),
      vault.InherentSKINDEXValue(),
      vault.skinsValueWei(),
      vault.btcReserveValueWei()
    ]);
    return {
      owner,
      vaultManager,
      ethBalanceWei,
      vaultValuationWei,
      inherentSkxWei,
      skinsValueWei,
      btcReserveWei
    };
  }

  // — grab SKINDEX token totalSupply & balanceOf →
  async function getSkindexData(tokenAddress, account, providerOrSigner) {
    const token = createErc20Contract(tokenAddress, providerOrSigner);
    const [ totalSupply, balance ] = await Promise.all([
      token.totalSupply(),
      token.balanceOf(account)
    ]);
    return { totalSupply, balance };
  }

  // expose
  window.vaultContractUtils = {
    sumMintBurn,
    getVaultData,
    getSkindexData
  };
})(window);
