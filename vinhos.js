// ===== DADOS DOS VINHOS =====
const defaultWineData = [
    {
        id: 1,
        name: "Quinta do Douro Reserva",
        region: "Douro, Portugal",
        type: "tinto",
        price: 189.90,
        desc: "Tinto encorpado com notas de frutas vermelhas maduras, especiarias e um toque de carvalho. Ideal para carnes grelhadas.",
        img: "images/wines/douro-red.png"
    },
    {
        id: 2,
        name: "Malbec Gran Reserva",
        region: "Mendoza, Argentina",
        type: "tinto",
        price: 159.90,
        desc: "Intenso e aveludado, com aromas de ameixa, chocolate amargo e um final longo e elegante.",
        img: "images/wines/malbec.png"
    },
    {
        id: 3,
        name: "Cabernet Sauvignon Premium",
        region: "Vale Central, Chile",
        type: "tinto",
        price: 129.90,
        desc: "Clássico chileno com taninos firmes, notas de cassis e pimentão verde. Perfeito com massas ao molho vermelho.",
        img: "images/wines/cabernet.png"
    },
    {
        id: 4,
        name: "Chardonnay Grand Cru",
        region: "Borgonha, França",
        type: "branco",
        price: 219.90,
        desc: "Elegante e mineral, com notas de frutas cítricas, manteiga e um toque floral. Harmoniza com peixes e frutos do mar.",
        img: "images/wines/chardonnay.png"
    },
    {
        id: 5,
        name: "Rosé de Provence",
        region: "Provence, França",
        type: "rose",
        price: 149.90,
        desc: "Delicado e refrescante com tons de morango, pêssego e ervas finas. Ideal para tardes ensolaradas.",
        img: "images/wines/rose.png"
    },
    {
        id: 6,
        name: "Porto Sage Tawny 10 Anos",
        region: "Porto, Portugal",
        type: "porto",
        price: 249.90,
        desc: "Vinho do Porto envelhecido com notas de caramelo, nozes e frutas secas. Perfeito como sobremesa.",
        img: "images/wines/porto.png"
    },
    {
        id: 7,
        name: "Sauvignon Blanc Reserva",
        region: "Marlborough, Nova Zelândia",
        type: "branco",
        price: 139.90,
        desc: "Fresco e vibrante com aromas de maracujá, limão e notas herbáceas. Excelente com saladas.",
        img: "images/wines/sauvignon.png"
    },
    {
        id: 8,
        name: "Espumante Brut Charmat",
        region: "Serra Gaúcha, Brasil",
        type: "espumante",
        price: 89.90,
        desc: "Espumante brasileiro com perlage fina, notas de maçã verde e torrada. Perfeito para celebrar.",
        img: "images/wines/espumante.png"
    }
];

// Carregar vinhos do Local Storage ou usar os padrões
let wineData = JSON.parse(localStorage.getItem('wineData'));
if (!wineData || wineData.length === 0) {
    wineData = defaultWineData;
    localStorage.setItem('wineData', JSON.stringify(wineData));
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

        const adminDeleteBtn = role === 'admin' ? `<button class="wine-card-delete" onclick="deleteWine(${wine.id})" title="Remover Vinho">Excluir</button>` : '';

        const card = document.createElement('div');
        card.className = 'wine-card reveal';
        card.style.animationDelay = `${i * 0.08}s`;
        card.innerHTML = `
            <span class="wine-card-badge ${wine.type}">${getBadgeLabel(wine.type)}</span>
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

    // Trigger reveal animation
    requestAnimationFrame(() => {
        grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    });
}

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

// Initial render
renderWineCards();

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

document.getElementById('btnConfirmOrder').addEventListener('click', () => {
    const nome = document.getElementById('checkoutNome').value.trim();
    const telefone = document.getElementById('checkoutTelefone').value.trim();

    if (!nome) {
        alert('Por favor, informe seu nome.');
        return;
    }
    if (!telefone) {
        alert('Por favor, informe um telefone para contato.');
        return;
    }

    const orderNum = '#' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('orderNumber').textContent = orderNum;

    checkoutFormView.style.display = 'none';
    checkoutSuccessView.style.display = 'block';

    cart = [];
    updateCartUI();
    renderWineCards(getCurrentFilter());

    document.getElementById('checkoutNome').value = '';
    document.getElementById('checkoutTelefone').value = '';
    document.getElementById('checkoutMesa').value = '';

    setTimeout(() => {
        checkoutModal.style.display = 'none';
    }, 4000);
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
    if (e.target === addWineModal) {
        addWineModal.style.display = 'none';
    }
});

if (addWineForm) {
    addWineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('newWineName').value.trim();
        const region = document.getElementById('newWineRegion').value.trim();
        const type = document.getElementById('newWineType').value;
        const price = parseFloat(document.getElementById('newWinePrice').value);
        const desc = document.getElementById('newWineDesc').value.trim();

        // Imagens genéricas baseadas no tipo de vinho para não quebrar o layout
        const imageMap = {
            'tinto': 'images/wines/cabernet.png',
            'branco': 'images/wines/chardonnay.png',
            'rose': 'images/wines/rose.png',
            'espumante': 'images/wines/espumante.png',
            'porto': 'images/wines/porto.png'
        };

        const newWine = {
            id: Date.now(), // gera ID unico baseado em timestamp
            name,
            region,
            type,
            price,
            desc,
            img: imageMap[type] || imageMap['tinto']
        };

        wineData.push(newWine);
        localStorage.setItem('wineData', JSON.stringify(wineData));

        renderWineCards(getCurrentFilter());
        showToast("Novo vinho adicionado com sucesso!");

        addWineForm.reset();
        addWineModal.style.display = 'none';
    });
}

function deleteWine(wineId) {
    if (confirm("Tem certeza que deseja excluir este vinho do catálogo?")) {
        wineData = wineData.filter(w => w.id !== wineId);
        localStorage.setItem('wineData', JSON.stringify(wineData));
        
        // Se estava no carrinho, remove tambem
        cart = cart.filter(c => c.id !== wineId);
        updateCartUI();
        
        renderWineCards(getCurrentFilter());
        showToast("Vinho removido com sucesso!");
    }
}

// ===== TOASTS =====
function showToast(message) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✓</span> ${message}`;
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
