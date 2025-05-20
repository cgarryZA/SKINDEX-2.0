// dashboard.js
async function dashboardInit() {
  try {
    await connectWallet();
  } catch (e) {
    alert(e.message);
    return window.location = 'index.html';
  }

  const totalNAVEl    = document.getElementById('totalNAV');
  const navPerTokenEl = document.getElementById('navPerToken');
  const ethBalanceEl  = document.getElementById('ethBalance');
  const vaultSKEl     = document.getElementById('vaultSK');
  const vaultSkinsEl  = document.getElementById('vaultSkins');
  const vaultBTCEl    = document.getElementById('vaultBTC');
  const userSKEl      = document.getElementById('userSK');
  const userValueEl   = document.getElementById('userValue');
  const totalSupplyEl = document.getElementById('totalSupply');
  const ctx           = document.getElementById('poolChart').getContext('2d');

  const poolChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['ETH', 'BTC', 'Skins', 'SKINDEX'],
      datasets: [{ data: [0, 0, 0, 0] }]
    }
  });

  async function updateStats() {
    const [nav, navP, ethB, sup, vsup, skinsWei, btcWei] = await Promise.all([
      vault.getTotalNAV(),
      vault.getNAVPerToken(),
      vault.getEthBalance(),
      vault.SkindexSupply(),
      vault.VaultSkindexWallet(),
      vault.skinsValueWei(),
      vault.btcReserveValueWei()
    ]);
    const userSK = await skindex.balanceOf(user);

    const f = x => parseFloat(ethers.utils.formatEther(x));
    const navF = f(nav),
          navPF = f(navP),
          ethBF = f(ethB),
          supF = f(sup),
          vsupF = f(vsup),
          skinsF = f(skinsWei),
          btcF = f(btcWei),
          userSKF = f(userSK);

    navPerTokenEl.textContent = navPF.toFixed(6);
    totalSupplyEl.textContent = supF.toFixed(6);
    ethBalanceEl.textContent = ethBF.toFixed(6);
    vaultSKEl.textContent = vsupF.toFixed(6);
    vaultSkinsEl.textContent = skinsF.toFixed(6);
    vaultBTCEl.textContent = btcF.toFixed(6);
    userSKEl.textContent = userSKF.toFixed(6);
    userValueEl.textContent = (userSKF * navPF).toFixed(6);

    poolChart.data.datasets[0].data = [ethBF, btcF, skinsF, vsupF];
    poolChart.update();
  }

  document.getElementById('mintBtn').onclick = () =>
    action('mint', { value: ethers.utils.parseEther(mintAmt.value) })
      .then(() => updateStats());

  document.getElementById('burnBtn').onclick = () =>
    action('burn', ethers.utils.parseEther(burnAmt.value))
      .then(() => updateStats());

  updateStats();
}

window.dashboardInit = dashboardInit;
