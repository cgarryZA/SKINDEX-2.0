// vault.js

async function initVaultPage() {
  // 1) Inject HTML + CSS (including vault-contents and the modal)
  await includeComponent('header-placeholder',         '/html-components/header.html',         'css/header.css');
  await includeComponent('vault-assets-placeholder',   '/html-components/vault-assets.html',   'css/vault-card.css');
  //await includeComponent('vault-contents-placeholder', '/html-components/vault-contents.html','css/vault-contents-card.css');
  //await includeComponent('modal-placeholder',          '/html-components/modal.html',          'css/modal.css');
  await includeComponent('steam-inventory-placeholder','/html-components/steam-inventory.html','css/steam-inventory.css');
  await includeComponent('footer-placeholder',         '/html-components/footer.html',         'css/footer.css');

  // 2) Now wire up one global click handler:
  setupGlobalClickHandler();

  // 3) Your existing vault-assets setup
  initVaultAssets();
}

function setupGlobalClickHandler() {
  const overlay = document.getElementById('vault-modal');
  const titleEl = document.getElementById('modal-title');
  const bodyEl  = document.getElementById('modal-body');

  document.addEventListener('click', e => {
    // 2a) Did we click inside a vault-contents-card?
    const card = e.target.closest('.vault-contents-card');
    if (card) {
      // OPEN the modal
      const { label, value } = card.dataset;
      titleEl.textContent = label;
      //bodyEl.innerHTML = `
      //  <p><strong>Value:</strong> ${value}</p>
      //  <p>More details about <em>${label}</em> go here.</p>
      //`;
      overlay.classList.add('active');
      return;
    }

    // 2b) Did we click a close button or the backdrop?
    if (e.target.closest('.modal-close') || e.target === overlay) {
      overlay.classList.remove('active');
      return;
    }

    // 2c) (Optionally) other click‐handlers here…
    // else if (e.target.matches('.some-other-button')) { … }
  });
}

// expose for console/debug
window.initVaultPage = initVaultPage;
