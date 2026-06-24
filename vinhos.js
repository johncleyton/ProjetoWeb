// ===== DADOS DOS VINHOS (carregados do backend) =====
let wineData = [];

// Carregar vinhos do backend
async function loadWines() {
    try {
        const res = await fetch(`${API_BASE}/wines`);
        if (res.ok) {
            wineData = await res.json();
            wineData = wineData.map(w => ({ ...w, price: parseFloat(w.price) }));
        } else {
            console.error("Erro ao carregar vinhos do backend, usando fallback.");
            loadFallbackWines();
        }
    } catch (error) {
        console.error("Backend indisponível, usando fallback:", error);
        loadFallbackWines();
    }
    renderWineCards();
}

function loadFallbackWines() {
    const stored = JSON.parse(localStorage.getItem('wineData'));
    if (stored && stored.length > 0) {
        wineData = stored;
    } else {
        wineData = [];
    }
}

// ===== ESTADO DO CARRINHO =====
let cart = [];


// ===== MENU RESPONSIVO =====
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');

hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isMenuOpen = hamburger.classList.toggle('open');
    navbar.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', isMenuOpen);
});

document.querySelectorAll('#navbar a.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navbar.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

document.addEventListener('click', (e) => {
    if (navbar.classList.contains('nav-open') && !navbar.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('open');
        navbar.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
    }
});

// ===== CARTA DE VINHOS =====
function formatPrice(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
}

function renderWineCards(filter = 'todos') {
    const grid = document.getElementById('wineGrid');
    const filtered = filter === 'todos' ? wineData : wineData.filter(w => w.type === filter);

    grid.innerHTML = '';

    const role = localStorage.getItem('userRole');

    filtered.forEach((wine, i) => {
        const cartItem = cart.find(c => c.id === wine.id);
        const qty = cartItem ? cartItem.qty : 0;

        const adminEditBtn = role === 'admin' ? `<button class="wine-card-edit" onclick="openEditWine(${wine.id})" title="Editar Vinho">Editar</button>` : '';
        const adminDeleteBtn = role === 'admin' ? `<button class="wine-card-delete" onclick="deleteWine(${wine.id})" title="Remover Vinho">Excluir</button>` : '';

        const card = document.createElement('div');
        card.className = 'wine-card reveal';
        card.style.animationDelay = `${i * 0.08}s`;
        card.innerHTML = `
            <span class="wine-card-badge ${wine.type}">${getBadgeLabel(wine.type)}</span>
            ${adminEditBtn}
            ${adminDeleteBtn}
            <div class="wine-card-img-wrap">
                <img src="${wine.img}" alt="${wine.name}" loading="lazy">
            </div>
            <div class="wine-card-body">
                <h3 class="wine-card-name">${wine.name}</h3>
                <span class="wine-card-region">${wine.region}</span>
                <p class="wine-card-desc">${wine.desc}</p>
                <div class="wine-card-footer">
                    <div class="wine-card-price">
                        ${formatPrice(wine.price)}
                        <small>por garrafa</small>
                    </div>
                    ${qty > 0 ? `
                        <div class="wine-qty-controls">
                            <button class="wine-qty-btn" onclick="changeQty(${wine.id}, -1)">−</button>
                            <span class="wine-qty-value">${qty}</span>
                            <button class="wine-qty-btn" onclick="changeQty(${wine.id}, 1)">+</button>
                        </div>
                    ` : `
                        <button class="btn-add-cart" onclick="addToCart(${wine.id})" id="btnWine${wine.id}">
                            Adicionar
                        </button>
                    `}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    requestAnimationFrame(() => {
        grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    });
}

// Expor para auth.js
window.renderWineCards = renderWineCards;

function getBadgeLabel(type) {
    const labels = {
        tinto: 'Tinto',
        branco: 'Branco',
        rose: 'Rosé',
        espumante: 'Espumante',
        porto: 'Porto'
    };
    return labels[type] || type;
}

// Filter tabs
document.getElementById('wineFilterTabs').addEventListener('click', (e) => {
    if (e.target.classList.contains('wine-filter-btn')) {
        document.querySelectorAll('.wine-filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderWineCards(e.target.dataset.filter);
    }
});

// ===== CARRINHO =====
const cartFloatBtn = document.getElementById('cartFloatBtn');
const cartOverlay = document.getElementById('cartOverlay');
const cartSidebar = document.getElementById('cartSidebar');
const cartCloseBtn = document.getElementById('cartCloseBtn');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalValue = document.getElementById('cartTotalValue');
const cartBadge = document.getElementById('cartBadge');
const btnCheckout = document.getElementById('btnCheckout');

function addToCart(wineId) {
    const wine = wineData.find(w => w.id === wineId);
    if (!wine) return;

    const existing = cart.find(c => c.id === wineId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...wine, qty: 1 });
    }

    updateCartUI();
    renderWineCards(getCurrentFilter());
    showToast(`${wine.name} adicionado ao carrinho!`);
}

function changeQty(wineId, delta) {
    const item = cart.find(c => c.id === wineId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(c => c.id !== wineId);
    }

    updateCartUI();
    renderWineCards(getCurrentFilter());
}

function removeFromCart(wineId) {
    const wine = cart.find(c => c.id === wineId);
    cart = cart.filter(c => c.id !== wineId);
    updateCartUI();
    renderWineCards(getCurrentFilter());
    if (wine) showToast(`${wine.name} removido do carrinho.`);
}

function getCurrentFilter() {
    const active = document.querySelector('.wine-filter-btn.active');
    return active ? active.dataset.filter : 'todos';
}

// Expor para auth.js
window.getCurrentFilter = getCurrentFilter;

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
    const count = getCartCount();
    const total = getCartTotal();

    cartFloatBtn.classList.toggle('hidden', count === 0);
    cartBadge.textContent = count;
    cartTotalValue.textContent = formatPrice(total);
    btnCheckout.disabled = count === 0;

    if (count === 0) {
        cartItemsList.innerHTML = `
            <div class="cart-empty-msg">
                Seu carrinho está vazio.<br>Explore nossa carta de vinhos!
            </div>
        `;
    } else {
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.img}" alt="${item.name}">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
                </div>
                <div class="cart-item-qty">
                    <button class="cart-item-qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
                    <span class="cart-item-qty-num">${item.qty}</span>
                    <button class="cart-item-qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remover">Remover</button>
            </div>
        `).join('');
    }
}

function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

cartFloatBtn.addEventListener('click', openCart);
cartCloseBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ===== CHECKOUT =====
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const checkoutFormView = document.getElementById('checkoutFormView');
const checkoutSuccessView = document.getElementById('checkoutSuccessView');

btnCheckout.addEventListener('click', () => {
    if (cart.length === 0) return;

    if (!localStorage.getItem('authToken')) {
        alert("Você precisa estar logado na sua conta para finalizar uma compra.");
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'flex';
        closeCart();
        return;
    }

    closeCart();

    const summary = document.getElementById('checkoutSummary');
    let summaryHTML = cart.map(item => `
        <div class="checkout-summary-item">
            <span class="item-name">${item.name} × ${item.qty}</span>
            <span class="item-subtotal">${formatPrice(item.price * item.qty)}</span>
        </div>
    `).join('');

    summaryHTML += `
        <div class="checkout-total">
            <span>Total</span>
            <span class="total-value">${formatPrice(getCartTotal())}</span>
        </div>
    `;
    summary.innerHTML = summaryHTML;

    checkoutFormView.style.display = 'block';
    checkoutSuccessView.style.display = 'none';
    checkoutModal.style.display = 'flex';
});

closeCheckoutModal.addEventListener('click', () => {
    checkoutModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
        checkoutModal.style.display = 'none';
    }
});

document.getElementById('btnConfirmOrder').addEventListener('click', async () => {
    const nome = localStorage.getItem('userName') || "Cliente Autenticado";
    const telefone = "Não informado (via auth)";
    const entrega = document.getElementById('checkoutEntrega').value;
    const mesa = document.getElementById('checkoutMesa').value.trim();

    try {
        const res = await fetch(`${API_BASE}/orders/wine`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(window.getAuthHeaders ? window.getAuthHeaders() : {})
            },
            body: JSON.stringify({
                items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, qty: item.qty })),
                nome, telefone, entrega, mesa
            })
        });
        const data = await res.json();
        document.getElementById('orderNumber').textContent = res.ok ? (data.orderNumber || '#0000') : '#' + Math.floor(1000 + Math.random() * 9000);
    } catch (error) {
        console.error("Backend indisponível:", error);
        document.getElementById('orderNumber').textContent = '#' + Math.floor(1000 + Math.random() * 9000);
    }

    checkoutFormView.style.display = 'none';
    checkoutSuccessView.style.display = 'block';

    cart = [];
    updateCartUI();
    renderWineCards(getCurrentFilter());

    document.getElementById('checkoutNome').value = '';
    document.getElementById('checkoutTelefone').value = '';
    document.getElementById('checkoutMesa').value = '';

    setTimeout(() => { checkoutModal.style.display = 'none'; }, 4000);
});

// ===== ADMIN WINE MANAGEMENT =====
const addWineModal = document.getElementById('addWineModal');
const btnOpenAddWineModal = document.getElementById('btnOpenAddWineModal');
const closeAddWineModal = document.getElementById('closeAddWineModal');
const addWineForm = document.getElementById('addWineForm');

if (btnOpenAddWineModal) {
    btnOpenAddWineModal.addEventListener('click', () => {
        if (addWineModal) addWineModal.style.display = 'flex';
    });
}

if (closeAddWineModal) {
    closeAddWineModal.addEventListener('click', () => {
        if (addWineModal) addWineModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === addWineModal) addWineModal.style.display = 'none';
});

// Preview da imagem selecionada
const wineImageInput = document.getElementById('newWineImage');
const wineImagePreview = document.getElementById('wineImagePreview');

if (wineImageInput && wineImagePreview) {
    newWineImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                wineImagePreview.src = ev.target.result;
                wineImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            wineImagePreview.style.display = 'none';
        }
    });
}

if (addWineForm) {
    addWineForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('newWineName').value.trim();
        const region = document.getElementById('newWineRegion').value.trim();
        const type = document.getElementById('newWineType').value;
        const price = document.getElementById('newWinePrice').value;
        const desc = document.getElementById('newWineDesc').value.trim();
        const imageFile = document.getElementById('newWineImage')?.files[0];

        // Usar FormData para enviar multipart (com imagem)
        const formData = new FormData();
        formData.append('name', name);
        formData.append('region', region);
        formData.append('type', type);
        formData.append('price', price);
        formData.append('desc', desc);
        if (imageFile) {
            formData.append('img', imageFile);
        }

        try {
            const res = await fetch(`${API_BASE}/wines`, {
                method: 'POST',
                headers: {
                    ...(window.getAuthHeaders ? window.getAuthHeaders() : {})
                    // NÃO incluir Content-Type — o browser define automaticamente com boundary para FormData
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                await loadWines();
                renderWineCards(getCurrentFilter());
                showToast("Novo vinho adicionado com sucesso!");
            } else {
                alert(data.error || "Erro ao adicionar vinho.");
            }
        } catch (error) {
            console.error("Erro ao adicionar vinho:", error);
            alert("Erro ao conectar com o servidor.");
        }

        addWineForm.reset();
        if (wineImagePreview) wineImagePreview.style.display = 'none';
        addWineModal.style.display = 'none';
    });
}

async function deleteWine(wineId) {
    if (confirm("Tem certeza que deseja excluir este vinho do catálogo?")) {
        try {
            const res = await fetch(`${API_BASE}/wines/${wineId}`, {
                method: 'DELETE',
                headers: { ...(window.getAuthHeaders ? window.getAuthHeaders() : {}) }
            });
            const data = await res.json();
            if (res.ok) {
                await loadWines();
                cart = cart.filter(c => c.id !== wineId);
                updateCartUI();
                renderWineCards(getCurrentFilter());
                showToast("Vinho removido com sucesso!");
            } else {
                alert(data.error || "Erro ao remover vinho.");
            }
        } catch (error) {
            console.error("Erro ao deletar vinho:", error);
            alert("Erro ao conectar com o servidor.");
        }
    }
}

// ===== ADMIN EDIT WINE =====
const editWineModal = document.getElementById('editWineModal');
const closeEditWineModalBtn = document.getElementById('closeEditWineModal');
const editWineForm = document.getElementById('editWineForm');
const editWineImageInput = document.getElementById('editWineImage');
const editWineImagePreview = document.getElementById('editWineImagePreview');

function openEditWine(wineId) {
    const wine = wineData.find(w => w.id === wineId);
    if (!wine) return;

    document.getElementById('editWineId').value = wine.id;
    document.getElementById('editWineName').value = wine.name;
    document.getElementById('editWineRegion').value = wine.region;
    document.getElementById('editWineType').value = wine.type;
    document.getElementById('editWinePrice').value = wine.price;
    document.getElementById('editWineDesc').value = wine.desc;

    const currentImg = document.getElementById('editWineCurrentImg');
    currentImg.src = wine.img;
    currentImg.style.display = 'block';

    // Reset file input and preview
    if (editWineImageInput) editWineImageInput.value = '';
    if (editWineImagePreview) editWineImagePreview.style.display = 'none';

    if (editWineModal) editWineModal.style.display = 'flex';
}

// Preview da nova imagem selecionada
if (editWineImageInput && editWineImagePreview) {
    editWineImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                editWineImagePreview.src = ev.target.result;
                editWineImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            editWineImagePreview.style.display = 'none';
        }
    });
}

// Fechar modal de edição
if (closeEditWineModalBtn) {
    closeEditWineModalBtn.addEventListener('click', () => {
        if (editWineModal) editWineModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === editWineModal) editWineModal.style.display = 'none';
});

// Submeter edição
if (editWineForm) {
    editWineForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const wineId = document.getElementById('editWineId').value;
        const name = document.getElementById('editWineName').value.trim();
        const region = document.getElementById('editWineRegion').value.trim();
        const type = document.getElementById('editWineType').value;
        const price = document.getElementById('editWinePrice').value;
        const desc = document.getElementById('editWineDesc').value.trim();
        const imageFile = document.getElementById('editWineImage')?.files[0];

        const formData = new FormData();
        formData.append('name', name);
        formData.append('region', region);
        formData.append('type', type);
        formData.append('price', price);
        formData.append('desc', desc);
        if (imageFile) {
            formData.append('img', imageFile);
        }

        try {
            const res = await fetch(`${API_BASE}/wines/${wineId}`, {
                method: 'PUT',
                headers: {
                    ...(window.getAuthHeaders ? window.getAuthHeaders() : {})
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                await loadWines();
                renderWineCards(getCurrentFilter());
                showToast("Vinho atualizado com sucesso!");
            } else {
                alert(data.error || "Erro ao atualizar vinho.");
            }
        } catch (error) {
            console.error("Erro ao atualizar vinho:", error);
            alert("Erro ao conectar com o servidor.");
        }

        editWineModal.style.display = 'none';
    });
}

// ===== TOASTS =====
function showToast(message) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span></span> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal:not(#wineGrid .reveal)');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });
    revealElements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
});
initScrollReveal();

// ===== INICIALIZAÇÃO =====
loadWines();
