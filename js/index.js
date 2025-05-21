async function initHomePage() {
  // 1) inject all HTML + CSS components
  await includeComponent('vault-assets-placeholder',   '/html-components/vault-assets.html',   'css/vault-card.css');

  await includeComponent('footer-placeholder',         '/html-components/footer.html',         'css/footer.css');

  initVaultAssets();
}