// mint.js

async function initMintPage() {
  // 1) Load header & footer
  await includeComponent(
    "header-placeholder",
    "/html-components/header.html",
    "css/header.css"
  );
  await includeComponent(
    "footer-placeholder",
    "/html-components/footer.html",
    "css/footer.css"
  );

  // 2) Connect wallet (or bounce back to index.html)
  let provider, signer, user;
  try {
    await connectWallet(); // from common.js
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer   = provider.getSigner();
    user     = await signer.getAddress();
  } catch (e) {
    alert(e.message);
    return (window.location = "index.html");
  }

  // 3) Grab DOM elements
  const navPerTokenEl = document.getElementById("navPerToken");
  const vaultValueEl  = document.getElementById("VaultValue");
  const userSKEl      = document.getElementById("userSK");
  const userValueEl   = document.getElementById("userValue");
  const mintAmtInput  = document.getElementById("mintAmt");
  const burnAmtInput  = document.getElementById("burnAmt");
  const mintBtn       = document.getElementById("mintBtn");
  const burnBtn       = document.getElementById("burnBtn");
  const maxMintBtn    = document.getElementById("maxMintBtn");
  const maxBurnBtn    = document.getElementById("maxBurnBtn");

  // 4) Function to fetch & render stats
  async function updateStats() {
    // a) on‐chain values
    const [ navP, vaultV, userSK ] = await Promise.all([
      vault.InherentSKINDEXValue(),
      vault.VaultValuation(),
      skindex.balanceOf(user)
    ]);

    // b) user ETH balance
    const userEthBal = await provider.getBalance(user);

    // format from Wei
    const f = x => parseFloat(ethers.utils.formatEther(x));
    const navPF   = f(navP);
    const vaultVF = f(vaultV);
    const userSKF = f(userSK);
    const userEth = f(userEthBal);

    // update DOM
    navPerTokenEl.textContent = navPF.toFixed(6);
    vaultValueEl.textContent  = vaultVF.toFixed(6);
    userSKEl.textContent      = `${userSKF.toFixed(6)} (≈ ${(userSKF * navPF).toFixed(6)} ETH)`;
    userValueEl.textContent   = `${userEth.toFixed(6)} ETH`;
  }

  // 5) Wire up mint/burn
  mintBtn.onclick = () => {
    const ethValue = ethers.utils.parseEther(mintAmtInput.value || "0");
    return action("mint", { value: ethValue })
      .then(updateStats)
      .catch(err => alert(err.message));
  };

  burnBtn.onclick = () => {
    const skAmount = ethers.utils.parseEther(burnAmtInput.value || "0");
    return action("burn", skAmount)
      .then(updateStats)
      .catch(err => alert(err.message));
  };

  // 6) “Max” for mint (net of gas fee)
  maxMintBtn.onclick = async () => {
    try {
      const balance  = await provider.getBalance(user);
      const gasPrice = await provider.getGasPrice();
      const gasLimit = await vault.estimateGas.mint({ value: balance })
                         .catch(() => ethers.BigNumber.from("0"));
      const fee      = gasPrice.mul(gasLimit).mul(2);  // safety factor
      const net      = balance.sub(fee).gt(0) ? balance.sub(fee) : ethers.BigNumber.from("0");
      mintAmtInput.value = parseFloat(ethers.utils.formatEther(net)).toFixed(6);
    } catch (err) {
      console.error(err);
      mintAmtInput.value = "";
    }
  };

  // 7) “Max” for burn = full SKINDEX balance
  maxBurnBtn.onclick = async () => {
    try {
      const skBal = await skindex.balanceOf(user);
      burnAmtInput.value = parseFloat(ethers.utils.formatEther(skBal)).toFixed(6);
    } catch (err) {
      console.error(err);
      burnAmtInput.value = "";
    }
  };

  // 8) Initial load
  updateStats();
  initVaultAssets();
}

window.initMintPage = initMintPage;
