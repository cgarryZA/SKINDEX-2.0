// vault.js
async function initVaultPage() {
  try {
    await connectWallet();
  } catch (e) {
    console.warn("Non-critical: Wallet not connected", e.message);
  }

  const totalNAVEl     = document.getElementById('totalNAV');
  const ethBalanceEl   = document.getElementById('ethBalance');
  const btcReserveEl   = document.getElementById('btcReserve');
  const skinValueEl    = document.getElementById('skinValue');
  const vaultSKINDEXEl = document.getElementById('vaultSKINDEX');
  const inventoryEl    = document.getElementById('inventory');

  async function updateVault() {
    const [nav, eth, skins, btc, skx] = await Promise.all([
      vault.getTotalNAV(),
      vault.getEthBalance(),
      vault.skinsValueWei(),
      vault.btcReserveValueWei(),
      vault.VaultSkindexWallet()
    ]);

    const f = x => parseFloat(ethers.utils.formatEther(x));

    totalNAVEl.textContent     = f(nav).toFixed(6);
    ethBalanceEl.textContent   = f(eth).toFixed(6);
    skinValueEl.textContent    = f(skins).toFixed(6);
    btcReserveEl.textContent   = (parseFloat(btc) / 1e8).toFixed(6); // BTC is 8 decimals
    vaultSKINDEXEl.textContent = f(skx).toFixed(6);
  }

  async function loadInventory() {
    try {
      // Placeholder: call your backend or fetch a JSON list of skins
      const res = await fetch("https://api.skindex.io/skins");
      const data = await res.json();

      if (!data.length) throw new Error("Empty inventory");

      inventoryEl.innerHTML = data.map(item => `
        <div class="skin-item">
          <img src="${item.image}" alt="${item.name}" />
          <p>${item.name}</p>
        </div>
      `).join("");
    } catch (err) {
      inventoryEl.innerHTML = `<p style="color:red">Could not load inventory: ${err.message}</p>`;
    }
  }

  updateVault();
  loadInventory();
}
