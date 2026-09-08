/**
 * REVITALIS SUPPLEMENTS - Product Detail Page
 * Reads ?id= from the URL and renders that product's details.
 */
document.addEventListener('DOMContentLoaded', () => {
  const CART_STORAGE_KEY = 'revitalisCart';

  const siteHeader = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }, { passive: true });

  function formatMoney(amount) {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) { /* storage unavailable, ignore */ }
  }

  function updateCartBadge() {
    const cart = loadCart();
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    badge.textContent = totalCount > 0 ? totalCount : '';
    badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
  }

  function showToast(message) {
    const toastStack = document.getElementById('toastStack');
    if (!toastStack) return;
    const toast = document.createElement('div');
    toast.className = 'toast-alert';
    toast.innerHTML = `
      <span class="icon-svg toast-icon" style="width: 18px; height: 18px; color: var(--primary);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
      <span>${message}</span>
    `;
    toastStack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  const productId = new URLSearchParams(window.location.search).get('id');
  const product = (window.REVITALIS_PRODUCTS || []).find(p => p.id === productId);

  if (!product) {
    window.location.href = 'index.html#catalog';
    return;
  }

  document.title = `${product.name} | Revitalis Supplements`;
  const metaDesc = document.getElementById('pdPageDescription');
  if (metaDesc) metaDesc.setAttribute('content', product.plainDescription);

  document.getElementById('pdImage').src = product.image;
  document.getElementById('pdImage').alt = product.name;

  const badge = document.getElementById('pdCategoryBadge');
  badge.textContent = product.badge;
  if (product.isGold) badge.classList.add('gold');

  document.getElementById('pdCatName').textContent = product.catName;
  document.getElementById('pdName').textContent = product.name;
  document.getElementById('pdRatingText').textContent = `${product.rating} (${product.reviewCount.toLocaleString('en-US')} reviews)`;
  document.getElementById('pdDescription').textContent = product.plainDescription;
  document.getElementById('pdPrice').textContent = formatMoney(product.price);
  document.getElementById('pdOldPrice').textContent = formatMoney(product.oldPrice);
  document.getElementById('pdProblem').textContent = product.problem;
  document.getElementById('pdHowToUse').textContent = product.howToUse;

  const benefitsList = document.getElementById('pdBenefits');
  benefitsList.innerHTML = product.benefits.map(b => `
    <li>
      <span class="check-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </span>
      <span>${b}</span>
    </li>
  `).join('');

  const ingredientsList = document.getElementById('pdIngredients');
  ingredientsList.innerHTML = product.ingredientDetails.map(ing => `
    <li>
      <strong>${ing.name}</strong>
      <span>${ing.desc}</span>
    </li>
  `).join('');

  updateCartBadge();

  document.getElementById('pdAddToCart').addEventListener('click', () => {
    const cart = loadCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image });
    }
    saveCart(cart);
    updateCartBadge();
    showToast(`Added ${product.name} to your cart.`);
  });
});
