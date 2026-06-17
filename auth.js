// ===== AUTHENTICATION & LOGIN MODAL =====
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('loginModal');
    const abrirBtn = document.getElementById('abrirModalBtn');
    const fecharBtn = document.getElementById('fecharModalBtn');
    const btnModalLogin = document.getElementById('btnModalLogin');

    if (!modal || !abrirBtn) return;

    // Função para atualizar a UI de acordo com a sessão
    function updateAuthUI() {
        const role = localStorage.getItem('userRole');
        if (role === 'admin') {
            abrirBtn.textContent = 'Sair (Admin)';
            abrirBtn.style.color = 'var(--gold-600)';
        } else if (role === 'user') {
            abrirBtn.textContent = 'Sair (Cliente)';
            abrirBtn.style.color = 'var(--gold-600)';
        } else {
            abrirBtn.textContent = 'Fazer Login';
            abrirBtn.style.color = ''; // reset
        }

        // Se estiver na página de vinhos e for admin, mostra botão
        const addWineBtnWrapper = document.getElementById('addWineBtnWrapper');
        if (addWineBtnWrapper) {
            if (role === 'admin') {
                addWineBtnWrapper.style.display = 'block';
            } else {
                addWineBtnWrapper.style.display = 'none';
            }
        }
    }

    abrirBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const role = localStorage.getItem('userRole');
        
        // Se já está logado, funciona como botão de logout
        if (role) {
            if (confirm("Deseja realmente sair da sua conta?")) {
                localStorage.removeItem('userRole');
                updateAuthUI();
                // Se estivermos em vinhos.js, podemos querer recarregar a tela ou sumir os botões
                if (window.renderWineCards) window.renderWineCards(window.getCurrentFilter ? window.getCurrentFilter() : 'todos');
                alert("Você saiu da conta.");
            }
        } else {
            // Se não está logado, abre modal de login
            modal.style.display = 'flex';
        }
    });

    if (fecharBtn) {
        fecharBtn.addEventListener('click', function () {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    if (btnModalLogin) {
        btnModalLogin.addEventListener('click', function () {
            const email = document.getElementById('modalEmail').value;
            const senha = document.getElementById('modalSenha').value;
            
            if (email.trim() === "" || senha.trim() === "") {
                alert("Por favor, preencha e-mail e senha (demonstração)");
            } else {
                // Lógica de papéis
                if (email.toLowerCase() === 'admin@estancia.com') {
                    localStorage.setItem('userRole', 'admin');
                    alert("Bem-vindo(a) Administrador!");
                } else {
                    localStorage.setItem('userRole', 'user');
                    alert("Bem-vindo(a) à área do cliente!");
                }
                
                modal.style.display = 'none';
                document.getElementById('modalEmail').value = '';
                document.getElementById('modalSenha').value = '';
                updateAuthUI();

                // Se houver a função renderWineCards na janela, recarrega para atualizar os botões
                if (window.renderWineCards) {
                    window.renderWineCards(window.getCurrentFilter ? window.getCurrentFilter() : 'todos');
                }
            }
        });
    }

    // Inicializa a UI
    updateAuthUI();
});
