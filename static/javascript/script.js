// ── Nav scroll shadow ──────────────────────────────────────────────
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Profile popover ───────────────────────────────────────────────
const profileMenu = document.querySelector('.profile-menu');
if (profileMenu) {
    document.addEventListener('click', event => {
        if (!profileMenu.contains(event.target)) {
            profileMenu.removeAttribute('open');
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            profileMenu.removeAttribute('open');
        }
    });
}

// ── Inventory table edit dialog ──────────────────────────────────
const inventoryDialog = document.getElementById('inventoryEditDialog');
const inventoryEditForm = inventoryDialog?.querySelector('[data-inventory-edit-form]');

if (inventoryDialog && inventoryEditForm) {
    const inventoryDialogTitle = inventoryDialog.querySelector('[data-inventory-dialog-title]');

    document.querySelectorAll('[data-inventory-edit]').forEach(button => {
        button.addEventListener('click', () => {
            inventoryEditForm.action = button.dataset.action;
            inventoryDialogTitle.textContent = `Edit ${button.dataset.name}`;

            ['name', 'price', 'stock', 'image', 'description', 'colors'].forEach(fieldName => {
                const field = inventoryEditForm.elements.namedItem(fieldName);
                if (field) field.value = button.dataset[fieldName] || '';
            });

            inventoryDialog.showModal();
            inventoryEditForm.elements.namedItem('name').focus();
        });
    });

    inventoryDialog.querySelectorAll('[data-inventory-close]').forEach(button => {
        button.addEventListener('click', () => inventoryDialog.close());
    });

    inventoryDialog.addEventListener('click', event => {
        if (event.target === inventoryDialog) inventoryDialog.close();
    });
}

// ── Back to top ────────────────────────────────────────────────────
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 300);
});
if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ── Cart drawer ───────────────────────────────────────────────────
const cartDrawer = document.getElementById('cartDrawer');
const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
const cartOpenButton = document.querySelector('.cart-nav-button');
const cartCloseButton = document.querySelector('.cart-drawer-close');

function openCartDrawer() {
    if (!cartDrawer || !cartDrawerOverlay) return;
    cartDrawerOverlay.hidden = false;
    cartDrawer.classList.add('is-open');
    cartDrawerOverlay.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
    if (!cartDrawer || !cartDrawerOverlay) return;
    cartDrawer.classList.remove('is-open');
    cartDrawerOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.setTimeout(() => {
        if (!cartDrawerOverlay.classList.contains('is-open')) {
            cartDrawerOverlay.hidden = true;
        }
    }, 300);
}

if (cartOpenButton) cartOpenButton.addEventListener('click', openCartDrawer);
if (cartCloseButton) cartCloseButton.addEventListener('click', closeCartDrawer);
if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeCartDrawer();
        const emailOverlay = document.getElementById('emailModalOverlay');
        if (emailOverlay) emailOverlay.hidden = true;
    }
});

// ── Scroll restore after form submit / remove ──────────────────────
if (document.querySelector('.products-grid')) {
    window.addEventListener('DOMContentLoaded', () => {
        const scrollY = sessionStorage.getItem('scrollY');
        if (scrollY !== null) {
            window.scrollTo({ top: parseInt(scrollY), behavior: 'instant' });
            sessionStorage.removeItem('scrollY');
        }
    });
    document.addEventListener('submit', () => {
        sessionStorage.setItem('scrollY', window.scrollY);
    });
    document.querySelectorAll('a[href*="remove_from_cart"]').forEach(link => {
        link.addEventListener('click', () => {
            sessionStorage.setItem('scrollY', window.scrollY);
        });
    });
}

// ── Overlay + panel helpers ────────────────────────────────────────
const overlay = document.getElementById('mainOverlay');

// Hide every panel, show only the requested one, open the overlay
function showPanel(name) {
    document.querySelectorAll('.overlay-panel').forEach(p => p.style.display = 'none');
    const panel = document.getElementById('panel-' + name);
    if (panel) panel.style.display = 'block';
    if (!overlay) return;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Hide overlay and unlock scroll — only called from the Continue button after login
function dismissOverlay() {
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// Aliases so HTML onclick attrs work
function switchToRegister() { showPanel('register'); }
function switchToLogin()     { showPanel('login'); }

// ── Boot logic ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    const isLoggedIn     = document.body.dataset.loggedIn === 'true';
    const reopenAuth     = document.body.dataset.reopenAuth; // 'login' | 'register' | ''
    const justLoggedIn   = sessionStorage.getItem('justLoggedIn');
    const justRegistered = sessionStorage.getItem('justRegistered');

    if (justLoggedIn || justRegistered) {
        // Just logged in or registered → welcome panel, Continue button dismisses it
        sessionStorage.removeItem('justLoggedIn');
        sessionStorage.removeItem('justRegistered');
        showPanel('loggedin');

    } else if (reopenAuth) {
        // Form error → reopen correct panel so error message is visible
        showPanel(reopenAuth);

    }
    // Otherwise the overlay stays hidden and visitors can browse freely.
});

// ── Catalog filters ───────────────────────────────────────────────
const productCards = document.querySelectorAll('[data-product-card]');
const priceRange = document.querySelector('[data-price-filter]');
const priceValue = document.querySelector('[data-price-value]');
const brandFilters = document.querySelectorAll('[data-brand-filter]');
const colorFilters = document.querySelectorAll('[data-color-filter]');
const stockFilter = document.querySelector('[data-stock-filter]');

function selectedValues(filters) {
    return Array.from(filters).filter(input => input.checked).map(input => input.value);
}

function applyCatalogFilters() {
    if (!productCards.length || !priceRange) return;
    const maxPrice = Number(priceRange.value);
    const brands = selectedValues(brandFilters);
    const colors = selectedValues(colorFilters);
    const inStockOnly = stockFilter && stockFilter.checked;
    if (priceValue) priceValue.textContent = maxPrice;

    productCards.forEach(card => {
        const price = Number(card.dataset.price);
        const brand = card.dataset.brand;
        const cardColors = (card.dataset.colors || '').split(',');
        const stock = Number(card.dataset.stock);
        const brandMatch = !brands.length || brands.includes(brand);
        const colorMatch = !colors.length || colors.some(color => cardColors.includes(color));
        const stockMatch = !inStockOnly || stock > 0;
        card.style.display = price <= maxPrice && brandMatch && colorMatch && stockMatch ? '' : 'none';
    });
}

[priceRange, stockFilter, ...brandFilters, ...colorFilters].forEach(input => {
    if (input) input.addEventListener('input', applyCatalogFilters);
    if (input) input.addEventListener('change', applyCatalogFilters);
});
applyCatalogFilters();
