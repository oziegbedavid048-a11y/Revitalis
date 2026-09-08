/**
 * REVITALIS SUPPLEMENTS - Application Logic
 * 100% Clean Code - Pure Vector SVGs - Zero Emojis
 * Live Search & Filters - Cart Drawer - Express Checkout
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. DATA STATE & PRODUCTS
  // =========================================================================
  const PRODUCTS = window.REVITALIS_PRODUCTS;

  const CART_STORAGE_KEY = 'revitalisCart';

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) { /* storage unavailable, ignore */ }
  }

  let cart = loadCart();

  function formatMoney(amount) {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // =========================================================================
  // 2. DOM ELEMENTS
  // =========================================================================
  const siteHeader = document.getElementById('siteHeader');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartItemsScroll = document.getElementById('cartItemsScroll');
  const cartSubtotalEl = document.getElementById('cartSubtotalAmount');
  const cartCountBadges = document.querySelectorAll('.cart-count-badge');
  const toastStack = document.getElementById('toastStack');
  const checkoutModal = document.getElementById('checkoutModal');
  const btnCloseCheckoutModal = document.getElementById('btnCloseCheckoutModal');
  const checkoutOrderForm = document.getElementById('checkoutOrderForm');
  const modalSubtotalVal = document.getElementById('modalSubtotalVal');
  const modalTotalVal = document.getElementById('modalTotalVal');

  // Two-step checkout: details -> payment method
  const checkoutStepDetails = document.getElementById('checkoutStepDetails');
  const checkoutStepPayment = document.getElementById('checkoutStepPayment');
  const stepPillDetails = document.getElementById('stepPillDetails');
  const stepPillPayment = document.getElementById('stepPillPayment');
  const btnContinueToPayment = document.getElementById('btnContinueToPayment');
  const btnBackToDetails = document.getElementById('btnBackToDetails');
  const btnConfirmOrder = document.getElementById('btnConfirmOrder');
  const payStepTotalVal = document.getElementById('payStepTotalVal');
  const paymentOptions = document.querySelectorAll('.payment-method-option');
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');

  // Search & Filters
  const productSearchInput = document.getElementById('productSearchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const catalogFilterBtns = document.querySelectorAll('.filter-btn');
  const catalogCards = document.querySelectorAll('.catalog-card');
  const transFilterBtns = document.querySelectorAll('.trans-filter-btn');
  const transCards = document.querySelectorAll('.transformation-card');

  // Header Scroll Effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }, { passive: true });

  // =========================================================================
  // 3. CART SYSTEM
  // =========================================================================
  function updateCartUI() {
    saveCart();
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountBadges.forEach(b => {
      b.textContent = totalCount > 0 ? totalCount : '';
      b.setAttribute('data-count', totalCount);
      b.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    });

    const finalSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (cartSubtotalEl) {
      cartSubtotalEl.textContent = formatMoney(finalSubtotal);
    }
    if (modalSubtotalVal) {
      modalSubtotalVal.textContent = formatMoney(finalSubtotal);
    }
    if (modalTotalVal) {
      modalTotalVal.textContent = formatMoney(finalSubtotal);
    }
    if (payStepTotalVal) {
      payStepTotalVal.textContent = formatMoney(finalSubtotal);
    }


    // Render Items
    if (!cartItemsScroll) return;

    if (cart.length === 0) {
      cartItemsScroll.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <span class="icon-svg" style="width: 48px; height: 48px; margin-bottom: 12px; color: var(--border-subtle);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </span>
          <p style="font-weight: 600; font-size: 1rem; color: var(--text-headline);">Your shopping bag is empty</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Choose from our clinical weight loss, male enhancement, anxiety, and sleep formulas.</p>
        </div>
      `;
      return;
    }

    cartItemsScroll.innerHTML = cart.map(item => `
      <div class="cart-item-row" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatMoney(item.price)}</div>
          <div class="cart-item-actions">
            <div class="cart-item-qty">
              <button type="button" class="btn-cart-qty-dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button type="button" class="btn-cart-qty-inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="btn-cart-remove" data-id="${item.id}" aria-label="Remove item">
              <span class="icon-svg" style="width: 14px; height: 14px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </span>
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach listeners
    cartItemsScroll.querySelectorAll('.btn-cart-qty-dec').forEach(btn => {
      btn.addEventListener('click', () => updateItemQty(btn.dataset.id, -1));
    });
    cartItemsScroll.querySelectorAll('.btn-cart-qty-inc').forEach(btn => {
      btn.addEventListener('click', () => updateItemQty(btn.dataset.id, 1));
    });
    cartItemsScroll.querySelectorAll('.btn-cart-remove').forEach(btn => {
      btn.addEventListener('click', () => removeItemFromCart(btn.dataset.id));
    });
  }

  function addToCart(productId, qty = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(i => i.id === productId);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.image
      });
    }

    updateCartUI();
    showToast(`Added ${product.name} to shopping bag.`);
  }

  function updateItemQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== productId);
      showToast(`Removed from bag.`);
    }
    updateCartUI();
  }

  function removeItemFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    updateCartUI();
    showToast(`Item removed from bag.`);
  }

  function openCartDrawer() {
    if (cartBackdrop) {
      cartBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    if (cartBackdrop) {
      cartBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // Open & Close Cart Triggers
  document.querySelectorAll('.open-cart-trigger').forEach(btn => {
    btn.addEventListener('click', openCartDrawer);
  });
  document.querySelectorAll('.close-cart-trigger').forEach(btn => {
    btn.addEventListener('click', closeCartDrawer);
  });

  if (cartBackdrop) {
    cartBackdrop.addEventListener('click', (e) => {
      if (e.target === cartBackdrop) closeCartDrawer();
    });
  }


  // =========================================================================
  // 4. CHECKOUT MODAL
  // =========================================================================
  const btnDrawerCheckout = document.getElementById('btnDrawerCheckout');

  // Show step 1 (details) and hide the payment step.
  function showDetailsStep() {
    if (!checkoutStepDetails || !checkoutStepPayment) return;
    checkoutStepDetails.hidden = false;
    checkoutStepPayment.hidden = true;
    if (stepPillDetails) stepPillDetails.className = 'checkout-step-pill active';
    if (stepPillPayment) stepPillPayment.className = 'checkout-step-pill';
  }

  // Show step 2 (payment methods) once the details form is valid.
  function showPaymentStep() {
    if (!checkoutStepDetails || !checkoutStepPayment) return;
    checkoutStepDetails.hidden = true;
    checkoutStepPayment.hidden = false;
    if (stepPillDetails) stepPillDetails.className = 'checkout-step-pill done';
    if (stepPillPayment) stepPillPayment.className = 'checkout-step-pill active';
  }

  function clearPaymentSelection() {
    paymentRadios.forEach(radio => { radio.checked = false; });
    paymentOptions.forEach(option => option.classList.remove('selected'));
    if (btnConfirmOrder) btnConfirmOrder.disabled = true;
  }

  function getSelectedPaymentMethod() {
    const chosen = Array.from(paymentRadios).find(radio => radio.checked);
    return chosen ? chosen.value : '';
  }

  function closeCheckoutModal() {
    if (!checkoutModal) return;
    checkoutModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Highlight the chosen method and unlock the confirm button.
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      paymentOptions.forEach(option => {
        const optionRadio = option.querySelector('input[name="paymentMethod"]');
        option.classList.toggle('selected', !!optionRadio && optionRadio.checked);
      });
      if (btnConfirmOrder) btnConfirmOrder.disabled = !getSelectedPaymentMethod();
    });
  });

  if (btnContinueToPayment) {
    btnContinueToPayment.addEventListener('click', () => {
      // Native validation on the shipping fields before revealing payment options.
      if (checkoutOrderForm && !checkoutOrderForm.reportValidity()) return;
      showPaymentStep();
    });
  }

  if (btnBackToDetails) {
    btnBackToDetails.addEventListener('click', showDetailsStep);
  }

  if (btnDrawerCheckout) {
    btnDrawerCheckout.addEventListener('click', () => {
      // Keep body scroll locked throughout the transition so the page
      // never jumps back to the hero section on mobile.
      document.body.style.overflow = 'hidden';

      // Close the cart drawer (without releasing scroll lock)
      if (cartBackdrop) cartBackdrop.classList.remove('open');

      if (checkoutModal) {
        showDetailsStep();
        clearPaymentSelection();
        checkoutModal.classList.add('open');
        // Scroll modal body back to top in case user had scrolled it before
        const modalBody = checkoutModal.querySelector('.checkout-modal-body');
        if (modalBody) modalBody.scrollTop = 0;
        const modalWindow = checkoutModal.querySelector('.modal-window');
        if (modalWindow) modalWindow.scrollTop = 0;
      }
    });
  }

  if (btnCloseCheckoutModal) {
    btnCloseCheckoutModal.addEventListener('click', closeCheckoutModal);
  }

  if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) {
        closeCheckoutModal();
      }
    });
  }

  if (checkoutOrderForm) {
    checkoutOrderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const paymentMethod = getSelectedPaymentMethod();
      if (!paymentMethod) return;

      // ── Gather customer details from the form ──────────────────────────
      const firstName = (document.getElementById('coFirstName')?.value || '').trim();
      const lastName  = (document.getElementById('coLastName')?.value  || '').trim();
      const fullName  = [firstName, lastName].filter(Boolean).join(' ') || 'Customer';
      const email     = (document.getElementById('coEmail')?.value     || '').trim();
      const address   = (document.getElementById('coAddress')?.value   || '').trim();
      const city      = (document.getElementById('coCity')?.value      || '').trim();
      const zip       = (document.getElementById('coZip')?.value       || '').trim();

      // ── Build order summary lines ──────────────────────────────────────
      const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const orderLines = cart.map(item =>
        `  - ${item.name} x${item.quantity} -- ${formatMoney(item.price * item.quantity)}`
      ).join('\n');

      // ── Compose the pre-filled email subject and body ──────────────────
      const subject = `Payment Order - ${paymentMethod} - ${fullName}`;

      const body = [
        `Hello Revitalis Supplements,`,
        ``,
        `I would like to make a payment for my order.`,
        ``,
        `--------------------------`,
        `CUSTOMER DETAILS`,
        `--------------------------`,
        `Name:             ${fullName}`,
        `Email:            ${email}`,
        `Shipping Address: ${[address, city, zip].filter(Boolean).join(', ')}`,
        ``,
        `--------------------------`,
        `ORDER SUMMARY`,
        `--------------------------`,
        orderLines,
        ``,
        `Total Amount Due: ${formatMoney(total)}`,
        ``,
        `--------------------------`,
        `PAYMENT METHOD`,
        `--------------------------`,
        `I would like to pay via: ${paymentMethod}`,
        ``,
        `Please send me the payment instructions / account details for ${paymentMethod}.`,
        ``,
        `Thank you,`,
        `${fullName}`
      ].join('\n');

      // ── Open the user's default email client ──────────────────────────
      const mailtoURL = 'mailto:payment@revitalisupplements.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body='    + encodeURIComponent(body);

      window.location.href = mailtoURL;

      // ── Clean up cart and modal after a brief delay ───────────────────
      setTimeout(() => {
        closeCheckoutModal();
        checkoutOrderForm.reset();
        clearPaymentSelection();
        showDetailsStep();
        cart = [];
        updateCartUI();
        showToast('Email app opened! Send your ' + paymentMethod + ' payment to payment@revitalisupplements.com');
      }, 600);
    });
  }

  // =========================================================================
  // 5. LIVE PRODUCT SEARCH & CATEGORY FILTERING
  // =========================================================================
  let currentCategoryFilter = 'all';

  function filterCatalogProducts() {
    const searchQuery = (productSearchInput ? productSearchInput.value.trim().toLowerCase() : '');

    if (btnClearSearch) {
      btnClearSearch.style.display = searchQuery.length > 0 ? 'flex' : 'none';
    }

    catalogCards.forEach(card => {
      const cardCategory = card.dataset.category || '';
      const textContent = card.innerText.toLowerCase();

      const matchesCategory = (currentCategoryFilter === 'all' || cardCategory === currentCategoryFilter);
      const matchesSearch = (!searchQuery || textContent.includes(searchQuery));

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (productSearchInput) {
    productSearchInput.addEventListener('input', filterCatalogProducts);
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      productSearchInput.value = '';
      filterCatalogProducts();
      productSearchInput.focus();
    });
  }

  catalogFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catalogFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategoryFilter = btn.dataset.filter;
      filterCatalogProducts();
    });
  });

  // Attach card Add to Cart buttons
  document.querySelectorAll('.btn-card-buy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const prodId = btn.dataset.id;
      addToCart(prodId, 1);
    });
  });

  // Clicking a product card (outside the Add to Cart button) opens its detail page
  catalogCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-card-buy')) return;
      const prodId = card.dataset.id;
      window.location.href = `product.html?id=${encodeURIComponent(prodId)}`;
    });
  });

  // =========================================================================
  // 6. REAL TRANSFORMATIONS FILTER (WOMEN VS MEN)
  // =========================================================================
  transFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      transFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedGender = btn.dataset.transFilter;

      transCards.forEach(card => {
        const cardGender = card.dataset.gender;
        if (selectedGender === 'all' || cardGender === selectedGender) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // =========================================================================
  // 7. FAQ ACCORDION
  // =========================================================================
  document.querySelectorAll('.faq-header-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const drawer = btn.nextElementSibling;

      // Close all others
      document.querySelectorAll('.faq-header-btn').forEach(b => {
        if (b !== btn) {
          b.setAttribute('aria-expanded', 'false');
          if (b.nextElementSibling) b.nextElementSibling.style.maxHeight = null;
        }
      });

      if (!isExpanded) {
        btn.setAttribute('aria-expanded', 'true');
        drawer.style.maxHeight = `${drawer.scrollHeight + 20}px`;
      } else {
        btn.setAttribute('aria-expanded', 'false');
        drawer.style.maxHeight = null;
      }
    });
  });

  // =========================================================================
  // 8. TOAST NOTIFICATION UTILITY (Pure SVG, Zero Emojis)
  // =========================================================================
  function showToast(message) {
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

  // Initial render
  updateCartUI();
});
