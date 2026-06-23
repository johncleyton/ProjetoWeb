
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

// ===== MARMITA =====
const proteinas = document.querySelectorAll('.proteina');
const acomps = document.querySelectorAll('.acomp');
const telefoneInput = document.getElementById('telefoneMarmita');
const observacoes = document.getElementById('observacoesMarmita');
const resumoDiv = document.getElementById('resumoPedido');
const msgProteina = document.getElementById('msgProteina');

document.querySelectorAll('.chip').forEach(chip => {
    const input = chip.querySelector('input');
    input.addEventListener('change', () => {
        if (input.type === 'radio') {
            document.querySelectorAll(`input[name="${input.name}"]`).forEach(r => {
                r.closest('.chip').classList.remove('chip-selected');
            });
        }
        chip.classList.toggle('chip-selected', input.checked);
        atualizarMarmita();
    });
});

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

document.getElementById('btnFinalizarPedido').addEventListener('click', function () {
    const msgFin = document.getElementById('msgFinalizacao');
    const protSel = [...proteinas].filter(p => p.checked);
    const feijaoEl = document.querySelector('input[name="feijao"]:checked');
    const carbEl = document.querySelector('input[name="carboidrato"]:checked');
    const acompSel = [...acomps].filter(a => a.checked).map(a => a.value);

    if (protSel.length !== 2) {
        msgFin.style.color = '#a82d4e';
        msgFin.textContent = 'Selecione exatamente 2 misturas.';
        return;
    }
    if (!feijaoEl) {
        msgFin.style.color = '#a82d4e';
        msgFin.textContent = 'Escolha o tipo de feijão.';
        return;
    }
    if (!carbEl) {
        msgFin.style.color = '#a82d4e';
        msgFin.textContent = 'Escolha batata, massa ou nenhum.';
        return;
    }
    if (!telefoneInput.value.trim()) {
        msgFin.style.color = '#a82d4e';
        msgFin.textContent = 'Informe um telefone para contato.';
        return;
    }

    // Montar a mensagem do pedido para o WhatsApp
    const misturas = protSel.map(p => p.value).join(', ');
    const feijao = feijaoEl.value;
    const carboidrato = carbEl.value;
    const acompanhamentos = acompSel.length ? acompSel.join(', ') : 'Nenhum';
    const obs = observacoes && observacoes.value.trim() ? observacoes.value.trim() : 'Nenhuma';
    const telefone = telefoneInput.value.trim();

    let mensagem = `*Pedido de Marmita - Estância d'Oliveira*\n\n`;
    mensagem += `*Misturas:* ${misturas}\n`;
    mensagem += `*Feijão:* ${feijao}\n`;
    mensagem += `*Acompanhamentos:* ${acompanhamentos}\n`;
    mensagem += `*Batata/Massa:* ${carboidrato}\n`;
    mensagem += `*Observações:* ${obs}\n`;
    mensagem += `*Telefone:* ${telefone}\n\n`;
    mensagem += `*Valor:* R$ 24,00`;

    // Número do WhatsApp do restaurante (19) 3342-8859
    const numeroWhatsApp = '551933428859';
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    // Feedback visual antes de redirecionar
    msgFin.style.color = '#2c5f2d';
    msgFin.textContent = 'Redirecionando para o WhatsApp...';

    // Abrir o WhatsApp em nova aba
    window.open(urlWhatsApp, '_blank');
});

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
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
