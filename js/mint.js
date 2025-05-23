// js/mint.js

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

  const accountEl = document.getElementById("account");

  // 2) Connect wallet (prompts if needed, no-ops if already connected)
  try {
    await connectWallet(); // sets up provider, signer, vault & skindex :contentReference[oaicite:0]{index=0}
  } catch (e) {
    // If MetaMask not installed or user rejects, show a button
    if (e.message.includes("MetaMask")) {
      accountEl.innerHTML = `<button id="connectBtn">Connect Wallet</button>`;
      document
        .getElementById("connectBtn")
        .addEventListener("click", async () => {
          try {
            await connectWallet();
            initMintPage(); // re-run once connected
          } catch (err) {
            alert("Connection failed: " + err.message);
          }
        });
    } else {
      alert(e.message);
    }
    return; // halt until we have a wallet
  }

  // 3) We’re connected – grab provider, signer, user
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const user = await signer.getAddress();

  // 4) Show truncated address
  // const short = user.slice(0, 6) + "…" + user.slice(-4);
  accountEl.textContent = user;

  // 5) Grab DOM references
  const navPerTokenEl = document.getElementById("navPerToken");
  const vaultValueEl = document.getElementById("VaultValue");

  const userSKPrimary = document.getElementById("userSKPrimary");
  const userSKSub = document.getElementById("userSKSub");

  const userValueEl = document.getElementById("userValue");

  const mintAmtInput = document.getElementById("mintAmt");
  const burnAmtInput = document.getElementById("burnAmt");

  const mintBtn = document.getElementById("mintBtn");
  const burnBtn = document.getElementById("burnBtn");

  const maxMintBtn = document.getElementById("maxMintBtn");
  const maxBurnBtn = document.getElementById("maxBurnBtn");

  const burnFee = document.getElementById("burnFee");
  const devFee = document.getElementById("devFee");
  const mintFee = document.getElementById("mintFee");

  // 6) Fetch & render all stats
  async function updateStats() {
    const [navP, vaultV, userSK, burnFeeBP, mintFeeBP, devFeeBP] = await Promise.all([
      vault.InherentSKINDEXValue(),
      vault.VaultValuation(),
      skindex.balanceOf(user),
      vault.burnFeeBP(),
      vault.mintFeeBP(),
      vault.DEV_FEE_BP()
    ]);
    const userEthBal = await provider.getBalance(user);

    const f = (x) => parseFloat(ethers.utils.formatEther(x));
    const navPF = f(navP);
    const vaultVF = f(vaultV);
    const userSKF = f(userSK);
    const userEth = f(userEthBal);

    const pct = bp => (parseFloat(bp) / 100).toFixed(2); 
    mintFee.textContent    = pct(mintFeeBP);
    burnFee.textContent    = pct(burnFeeBP);
    devFee.textContent     = pct(devFeeBP);

    navPerTokenEl.textContent = `${navPF.toFixed(6)} ETH`;
    vaultValueEl.textContent = `${vaultVF.toFixed(6)} ETH`;
    userSKPrimary.textContent = userSKF.toFixed(6);
    userSKSub.textContent = `${(userSKF * navPF).toFixed(6)} ETH`;
    userValueEl.textContent = `${userEth.toFixed(6)} ETH`;
  }

  // 7) Mint button
  mintBtn.onclick = () => {
    const ethValue = ethers.utils.parseEther(mintAmtInput.value || "0");
    return action("mint", { value: ethValue })
      .then(updateStats)
      .catch((err) => alert(err.message));
  };

  // 8) Burn button
  burnBtn.onclick = () => {
    const skAmount = ethers.utils.parseEther(burnAmtInput.value || "0");
    return action("burn", skAmount)
      .then(updateStats)
      .catch((err) => alert(err.message));
  };

  // 9) Max-Mint (net of estimated gas)
  maxMintBtn.onclick = async () => {
    try {
      const balance = await provider.getBalance(user);
      const gasPrice = await provider.getGasPrice();
      const gasLimit = await vault.estimateGas
        .mint({ value: balance })
        .catch(() => ethers.BigNumber.from("0"));
      const fee = gasPrice.mul(gasLimit).mul(2);
      const net = balance.sub(fee).gt(0)
        ? balance.sub(fee)
        : ethers.BigNumber.from("0");
      mintAmtInput.value = parseFloat(ethers.utils.formatEther(net)).toFixed(6);
    } catch {
      mintAmtInput.value = "";
    }
  };

  // 10) Max-Burn (full SKINDEX balance)
  maxBurnBtn.onclick = async () => {
    try {
      const skBal = await skindex().balanceOf(user);
      burnAmtInput.value = parseFloat(ethers.utils.formatEther(skBal)).toFixed(
        6
      );
    } catch {
      burnAmtInput.value = "";
    }
  };

  // 11) Initial stats load and any vault-assets logic
  updateStats();
}

window.initMintPage = initMintPage;
