// Modal de login (popup)
const modal = document.getElementById('loginModal');
const abrirBtn = document.getElementById('abrirModalBtn');
const fecharBtn = document.getElementById('fecharModalBtn');
const btnModalLogin = document.getElementById('btnModalLogin');

abrirBtn.addEventListener('click', function (e) {
    e.preventDefault();
    modal.style.display = 'flex';
});
fecharBtn.addEventListener('click', function () {
    modal.style.display = 'none';
});
window.addEventListener('click', function (e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});
btnModalLogin.addEventListener('click', function () {
    const email = document.getElementById('modalEmail').value;
    const senha = document.getElementById('modalSenha').value;
    if (email.trim() === "" || senha.trim() === "") {
        alert("Por favor, preencha e-mail e senha (demonstração)");
    } else {
        alert("Bem-vindo(a) à área do cliente! (ambiente demonstrativo)");
        modal.style.display = 'none';
        document.getElementById('modalEmail').value = '';
        document.getElementById('modalSenha').value = '';
    }
});

// Menu responsivo
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');

hamburger.addEventListener('click', (e) => {
    e.stopPropagation(); // Evita que o clique feche imediatamente
    const isMenuOpen = hamburger.classList.toggle('open');
    navbar.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', isMenuOpen);
});

// Fecha o menu ao clicar num link
document.querySelectorAll('#navbar a.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navbar.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

// Fecha se o usuário clicar fora do menu
document.addEventListener('click', (e) => {
    if (navbar.classList.contains('nav-open') && !navbar.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('open');
        navbar.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
    }
});


// Lógica da marmita (novo sistema simplificado)
const proteinas = document.querySelectorAll('.proteina');
const acomps = document.querySelectorAll('.acomp');
const telefoneInput = document.getElementById('telefoneMarmita');
const observacoes = document.getElementById('observacoesMarmita');
const resumoDiv = document.getElementById('resumoPedido');
const msgProteina = document.getElementById('msgProteina');

// Chips interativos (marcar/desmarcar visualmente)
document.querySelectorAll('.chip').forEach(chip => {
    const input = chip.querySelector('input');
    input.addEventListener('change', () => {
        // Para radio: desmarcar irmãos
        if (input.type === 'radio') {
            document.querySelectorAll(`input[name="${input.name}"]`).forEach(r => {
                r.closest('.chip').classList.remove('chip-selected');
            });
        }
        chip.classList.toggle('chip-selected', input.checked);
        atualizarMarmita();
    });
});

// Controlar limite de 2 proteínas
proteinas.forEach(cb => {
    cb.addEventListener('change', () => {
        const selecionadas = [...proteinas].filter(p => p.checked);
        if (selecionadas.length > 2) {
            cb.checked = false;
            cb.closest('.chip').classList.remove('chip-selected');
        }
        const total = [...proteinas].filter(p => p.checked).length;
        document.getElementById('contadorProteina').textContent = `${total}/2`;
        document.getElementById('contadorProteina').style.color = total === 2 ? '#2c5f2d' : '#c97e2c';
        if (total === 2) {
            // Desabilitar as não selecionadas
            proteinas.forEach(p => {
                if (!p.checked) p.closest('.chip').classList.add('chip-disabled');
            });
        } else {
            proteinas.forEach(p => p.closest('.chip').classList.remove('chip-disabled'));
        }
        msgProteina.textContent = total === 2 ? '' : `Selecione mais ${2 - total} mistura(s).`;
    });
});

function atualizarMarmita() {
    const protSel = [...proteinas].filter(p => p.checked).map(p => p.value);
    const feijaoEl = document.querySelector('input[name="feijao"]:checked');
    const carbEl = document.querySelector('input[name="carboidrato"]:checked');
    const acompSel = [...acomps].filter(a => a.checked).map(a => a.value);

    let html = '';
    html += `<div class="resumo-linha"><span>Misturas:</span> ${protSel.length ? protSel.join(', ') : '<em>nenhuma</em>'}</div>`;
    html += `<div class="resumo-linha"><span>Feijão:</span> ${feijaoEl ? feijaoEl.value : '<em>não selecionado</em>'}</div>`;
    html += `<div class="resumo-linha"><span>Acompanhamentos:</span> ${acompSel.length ? acompSel.join(', ') : '<em>nenhum</em>'}</div>`;
    html += `<div class="resumo-linha"><span>Batata/Massa:</span> ${carbEl ? carbEl.value : '<em>não selecionado</em>'}</div>`;
    if (observacoes && observacoes.value.trim()) html += `<div class="resumo-linha"><span>Obs:</span> ${observacoes.value}</div>`;
    if (telefoneInput && telefoneInput.value.trim()) html += `<div class="resumo-linha"><span>Contato:</span> ${telefoneInput.value}</div>`;
    resumoDiv.innerHTML = html;
}

if (observacoes) observacoes.addEventListener('input', atualizarMarmita);
if (telefoneInput) telefoneInput.addEventListener('input', atualizarMarmita);
atualizarMarmita();

// Finalizar pedido
document.getElementById('btnFinalizarPedido').addEventListener('click', function () {
    const msgFin = document.getElementById('msgFinalizacao');
    const protSel = [...proteinas].filter(p => p.checked);
    const feijaoEl = document.querySelector('input[name="feijao"]:checked');
    const carbEl = document.querySelector('input[name="carboidrato"]:checked');

    if (protSel.length !== 2) {
        msgFin.style.color = '#b94a2c';
        msgFin.textContent = '❌ Selecione exatamente 2 misturas.';
        return;
    }
    if (!feijaoEl) {
        msgFin.style.color = '#b94a2c';
        msgFin.textContent = '❌ Escolha o tipo de feijão.';
        return;
    }
    if (!carbEl) {
        msgFin.style.color = '#b94a2c';
        msgFin.textContent = '❌ Escolha batata, massa ou nenhum.';
        return;
    }
    if (!telefoneInput.value.trim()) {
        msgFin.style.color = '#b94a2c';
        msgFin.textContent = '❌ Informe um telefone para contato.';
        return;
    }
    msgFin.style.color = '#2c5f2d';
    msgFin.textContent = '✅ Pedido enviado! Logo entraremos em contato. Obrigado!';
    setTimeout(() => msgFin.textContent = '', 5000);
});

// Upload de currículo - feedback visual do arquivo selecionado
const arquivoInput = document.getElementById('curriculoArquivo');
const fileUploadText = document.getElementById('fileUploadText');
const fileUploadLabel = document.querySelector('.file-upload-label');

if (arquivoInput) {
    arquivoInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024; // 5 MB
            if (file.size > maxSize) {
                fileUploadText.textContent = 'Arquivo muito grande (máx. 5 MB)';
                fileUploadLabel.classList.remove('file-selected');
                this.value = '';
                return;
            }
            fileUploadText.textContent = file.name;
            fileUploadLabel.classList.add('file-selected');
        } else {
            fileUploadText.textContent = 'Anexar currículo (PDF ou Word)';
            fileUploadLabel.classList.remove('file-selected');
        }
    });
}

// Simulação de currículo
const btnCurriculoContato = document.getElementById('btnCurriculoContato');
if (btnCurriculoContato) {
    btnCurriculoContato.addEventListener('click', function () {
        const nome2 = document.getElementById('curriculoContatoNome').value;
        const contato2 = document.getElementById('curriculoContatoEmail').value;
        if (nome2 && contato2) {
            document.getElementById('msgCurriculoContato').innerHTML = 'Currículo recebido! Entraremos em contato em breve.';
            document.getElementById('msgCurriculoContato').style.color = '#2c5f2d';
            document.getElementById('curriculoContatoNome').value = '';
            document.getElementById('curriculoContatoEmail').value = '';
            document.getElementById('curriculoExperiencia').value = '';
            // Limpar arquivo
            if (arquivoInput) arquivoInput.value = '';
            if (fileUploadText) fileUploadText.textContent = 'Anexar currículo (PDF ou Word)';
            if (fileUploadLabel) fileUploadLabel.classList.remove('file-selected');
        } else {
            document.getElementById('msgCurriculoContato').innerHTML = '⚠️ Preencha nome e telefone/e-mail para enviar.';
            document.getElementById('msgCurriculoContato').style.color = '#c97e2c';
        }
    });
}
