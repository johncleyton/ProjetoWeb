

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

// ===== UPLOAD CURRÍCULO =====
const arquivoInput = document.getElementById('curriculoArquivo');
const fileUploadText = document.getElementById('fileUploadText');
const fileUploadLabel = document.querySelector('.file-upload-label');

if (arquivoInput) {
    arquivoInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024;
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
            if (arquivoInput) arquivoInput.value = '';
            if (fileUploadText) fileUploadText.textContent = 'Anexar currículo (PDF ou Word)';
            if (fileUploadLabel) fileUploadLabel.classList.remove('file-selected');
        } else {
            document.getElementById('msgCurriculoContato').innerHTML = 'Preencha nome e telefone/e-mail para enviar.';
            document.getElementById('msgCurriculoContato').style.color = '#c97e2c';
        }
    });
}

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
