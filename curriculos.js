// ===== ADMIN CURRICULOS PAGE =====

let allCurriculos = [];

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

// ===== CHECK ADMIN ACCESS =====
function checkAdminAccess() {
    const role = localStorage.getItem('userRole');
    const panel = document.getElementById('curriculosAdminPanel');
    const denied = document.getElementById('curriculosAccessDenied');

    if (role === 'admin') {
        panel.style.display = 'block';
        denied.style.display = 'none';
        loadCurriculos();
    } else {
        panel.style.display = 'none';
        denied.style.display = 'flex';
    }
}

// ===== LOAD CURRICULOS =====
async function loadCurriculos() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const listEl = document.getElementById('curriculosList');
    listEl.innerHTML = '<div class="curriculos-loading">Carregando currículos...</div>';

    try {
        const res = await fetch(`${API_BASE}/curriculum`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
            document.getElementById('curriculosAdminPanel').style.display = 'none';
            document.getElementById('curriculosAccessDenied').style.display = 'flex';
            return;
        }

        allCurriculos = await res.json();
        updateStats();
        renderCurriculos();
    } catch (error) {
        console.error('Erro ao carregar curriculos:', error);
        listEl.innerHTML = '<div class="curriculos-loading">Erro ao carregar currículos. Verifique o backend.</div>';
    }
}

// ===== UPDATE STATS =====
function updateStats() {
    document.getElementById('totalCurriculos').textContent = allCurriculos.length;

    const today = new Date().toISOString().slice(0, 10);
    const todayCount = allCurriculos.filter(c => c.createdAt && c.createdAt.slice(0, 10) === today).length;
    document.getElementById('totalHoje').textContent = todayCount;
}

// ===== RENDER CURRICULOS =====
function renderCurriculos(filter = 'todos') {
    const listEl = document.getElementById('curriculosList');
    const filtered = filter === 'todos' ? allCurriculos : allCurriculos.filter(c => c.cargo === filter);

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="curriculos-empty">
                <span class="empty-icon">📋</span>
                <p>Nenhum currículo ${filter !== 'todos' ? 'para este cargo' : 'recebido ainda'}.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = filtered.map((c, i) => {
        const userName = c.user ? c.user.name || 'Sem nome' : 'Usuário removido';
        const userEmail = c.user ? c.user.email : '—';
        const date = new Date(c.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const experiencia = c.experiencia ? c.experiencia : '<em>Não informada</em>';

        return `
            <div class="curriculo-card reveal visible" style="animation-delay: ${i * 0.05}s">
                <div class="curriculo-card-header">
                    <div class="curriculo-card-avatar">
                        ${userName.charAt(0).toUpperCase()}
                    </div>
                    <div class="curriculo-card-info">
                        <h3 class="curriculo-card-name">${userName}</h3>
                        <span class="curriculo-card-email">${userEmail}</span>
                    </div>
                    <span class="curriculo-card-badge">${c.cargo}</span>
                </div>
                <div class="curriculo-card-body">
                    <div class="curriculo-card-exp">
                        <strong>Experiência:</strong>
                        <p>${experiencia}</p>
                    </div>
                    <span class="curriculo-card-date">Enviado em ${date}</span>
                </div>
                <div class="curriculo-card-actions">
                    <a href="${c.downloadUrl || c.arquivo}" target="_blank" class="btn-acao btn-download" title="Baixar currículo">
                        📄 Baixar PDF
                    </a>
                    <button class="btn-acao btn-delete-curriculo" onclick="deleteCurriculo(${c.id})" title="Remover currículo">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== DELETE CURRICULO =====
async function deleteCurriculo(id) {
    if (!confirm('Tem certeza que deseja excluir este currículo? O arquivo será removido permanentemente.')) return;

    const token = localStorage.getItem('authToken');
    try {
        const res = await fetch(`${API_BASE}/curriculum/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            showToast('Currículo removido com sucesso!');
            await loadCurriculos();
        } else {
            const data = await res.json();
            alert(data.error || 'Erro ao remover currículo.');
        }
    } catch (error) {
        console.error('Erro ao deletar curriculo:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

// ===== FILTER =====
document.getElementById('filterCargo').addEventListener('change', (e) => {
    renderCurriculos(e.target.value);
});

// ===== REFRESH =====
document.getElementById('btnRefreshCurriculos').addEventListener('click', () => {
    loadCurriculos();
});

// ===== TOAST =====
function showToast(message) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span></span> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
});
checkAdminAccess();
