// vault.js
// (assumes vault-contract.js has already run, and ethers + includeComponent are globals)


async function initVaultPage() {
  // 1) inject all HTML + CSS components
  await includeComponent('header-placeholder',         '/html-components/header.html',         'css/header.css');
  await includeComponent('vault-assets-placeholder',   '/html-components/vault-assets.html',   'css/vault-card.css');
  await includeComponent('vault-contents-placeholder', '/html-components/vault-contents.html','css/vault-contents-card.css');
  await includeComponent('steam-inventory-placeholder','/html-components/steam-inventory.html','css/steam-inventory.css');
  await includeComponent('modal-placeholder',          '/html-components/modal.html',          'css/modal.css');
  await includeComponent('footer-placeholder',         '/html-components/footer.html',         'css/footer.css');

  initVaultAssets();
}

// expose for console/debug
window.initVaultPage = initVaultPage;
