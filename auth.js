// ===== AUTHENTICATION & LOGIN MODAL =====
const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('loginModal');
    const abrirBtn = document.getElementById('abrirModalBtn');
    const fecharBtn = document.getElementById('fecharModalBtn');
    const btnModalLogin = document.getElementById('btnModalLogin');
    const modalLoginForm = document.getElementById('modalLoginForm');

    if (!modal || !abrirBtn) return;

    // ===== Injetar Toggle Login/Cadastro no Modal =====
    const modalContent = modal.querySelector('.modal-content');
    const modalTitle = modalContent.querySelector('h2');

    // Criar link de toggle
    const toggleWrapper = document.createElement('p');
    toggleWrapper.className = 'modal-info';
    toggleWrapper.id = 'authToggleWrapper';
    toggleWrapper.innerHTML = 'Não tem conta? <a href="#" id="authToggleLink" style="color: #6b2fa0; text-decoration: underline; cursor: pointer;">Cadastre-se</a>';
    modalContent.appendChild(toggleWrapper);

    // Criar campo de nome (para registro)
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    nameGroup.id = 'registerNameGroup';
    nameGroup.style.display = 'none';
    nameGroup.innerHTML = '<label>Nome completo</label><input type="text" id="modalNome" placeholder="Seu nome">';

    // Inserir campo de nome antes do campo de email
    const emailGroup = modalLoginForm.querySelector('.form-group');
    modalLoginForm.insertBefore(nameGroup, emailGroup);

    let isRegisterMode = false;

    // Função para alternar entre login e registro
    function toggleAuthMode() {
        isRegisterMode = !isRegisterMode;
        if (isRegisterMode) {
            modalTitle.textContent = 'Criar Conta';
            btnModalLogin.textContent = 'Cadastrar';
            nameGroup.style.display = 'block';
            toggleWrapper.innerHTML = 'Já tem conta? <a href="#" id="authToggleLink" style="color: #6b2fa0; text-decoration: underline; cursor: pointer;">Fazer Login</a>';
        } else {
            modalTitle.textContent = 'Acesso Cliente';
            btnModalLogin.textContent = 'Entrar';
            nameGroup.style.display = 'none';
            toggleWrapper.innerHTML = 'Não tem conta? <a href="#" id="authToggleLink" style="color: #6b2fa0; text-decoration: underline; cursor: pointer;">Cadastre-se</a>';
        }
        // Re-bind event no novo link
        document.getElementById('authToggleLink').addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthMode();
        });
    }

    document.getElementById('authToggleLink').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });

    // ===== Função para atualizar a UI de acordo com a sessão =====
    function updateAuthUI() {
        const role = localStorage.getItem('userRole');
        if (role === 'admin') {
            abrirBtn.textContent = 'Sair (Admin)';
            abrirBtn.style.color = 'white';
        } else if (role === 'user') {
            abrirBtn.textContent = 'Sair (Cliente)';
            abrirBtn.style.color = 'white';
        } else {
            abrirBtn.textContent = 'Fazer Login';
            abrirBtn.style.color = '';
        }

        // Se estiver na página de vinhos e for admin, mostra botão
        const addWineBtnWrapper = document.getElementById('addWineBtnWrapper');
        if (addWineBtnWrapper) {
            addWineBtnWrapper.style.display = (role === 'admin') ? 'block' : 'none';
        }

        // Mostra link de Currículos no navbar apenas para admin
        const navCurriculosLink = document.getElementById('navCurriculosLink');
        if (navCurriculosLink) {
            navCurriculosLink.style.display = (role === 'admin') ? '' : 'none';
        }
    }

    // ===== Botão Login/Logout =====
    abrirBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const role = localStorage.getItem('userRole');

        if (role) {
            // Logout
            if (confirm("Deseja realmente sair da sua conta?")) {
                localStorage.removeItem('userRole');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userName');
                updateAuthUI();
                if (window.renderWineCards) window.renderWineCards(window.getCurrentFilter ? window.getCurrentFilter() : 'todos');
                alert("Você saiu da conta.");
            }
        } else {
            // Abrir modal
            isRegisterMode = false;
            modalTitle.textContent = 'Acesso Cliente';
            btnModalLogin.textContent = 'Entrar';
            nameGroup.style.display = 'none';
            toggleWrapper.innerHTML = 'Não tem conta? <a href="#" id="authToggleLink" style="color: #6b2fa0; text-decoration: underline; cursor: pointer;">Cadastre-se</a>';
            document.getElementById('authToggleLink').addEventListener('click', (ev) => {
                ev.preventDefault();
                toggleAuthMode();
            });
            modal.style.display = 'flex';
        }
    });

    if (fecharBtn) {
        fecharBtn.addEventListener('click', function () {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', function (e) {
        if (e.target === modal) modal.style.display = 'none';
    });

    // ===== Botão de Login/Cadastro =====
    if (btnModalLogin) {
        btnModalLogin.addEventListener('click', async function () {
            const email = document.getElementById('modalEmail').value.trim();
            const senha = document.getElementById('modalSenha').value.trim();

            if (!email || !senha) {
                alert("Por favor, preencha e-mail e senha.");
                return;
            }

            try {
                if (isRegisterMode) {
                    // REGISTRO via API
                    const nome = document.getElementById('modalNome').value.trim();
                    const res = await fetch(`${API_BASE}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password: senha, name: nome })
                    });
                    const data = await res.json();
                    if (!res.ok) { alert(data.error || "Erro ao cadastrar."); return; }

                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userName', data.user.name || '');
                    alert("Conta criada com sucesso! Bem-vindo(a)!");
                } else {
                    // LOGIN via API
                    const res = await fetch(`${API_BASE}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password: senha })
                    });
                    const data = await res.json();
                    if (!res.ok) { alert(data.error || "E-mail ou senha incorretos."); return; }

                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userName', data.user.name || '');

                    alert(data.user.role === 'admin' ? "Bem-vindo(a) Administrador!" : "Bem-vindo(a) à área do cliente!");
                }

                modal.style.display = 'none';
                document.getElementById('modalEmail').value = '';
                document.getElementById('modalSenha').value = '';
                const nomeInput = document.getElementById('modalNome');
                if (nomeInput) nomeInput.value = '';
                updateAuthUI();

                if (window.renderWineCards) {
                    window.renderWineCards(window.getCurrentFilter ? window.getCurrentFilter() : 'todos');
                }
            } catch (error) {
                console.error("Erro na autenticação:", error);
                alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
            }
        });
    }

    // Helper global para requisições autenticadas
    window.getAuthHeaders = function () {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    updateAuthUI();
});
