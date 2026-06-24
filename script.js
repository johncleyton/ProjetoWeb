

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
    btnCurriculoContato.addEventListener('click', async function () {
        const msgElement = document.getElementById('msgCurriculoContato');
        
        const token = localStorage.getItem('authToken');
        if (!token) {
            msgElement.innerHTML = 'Você precisa estar logado para enviar um currículo.';
            msgElement.style.color = '#c97e2c';
            // Opcional: abrir o modal de login automaticamente
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'flex';
            return;
        }

        const cargo = document.getElementById('cargoContato').value;
        const experiencia = document.getElementById('curriculoExperiencia').value;
        const arquivo = arquivoInput.files[0];

        if (!arquivo) {
            msgElement.innerHTML = 'Por favor, anexe seu currículo (PDF).';
            msgElement.style.color = '#c97e2c';
            return;
        }

        const formData = new FormData();
        formData.append('cargo', cargo);
        formData.append('experiencia', experiencia);
        formData.append('curriculo', arquivo); // "curriculo" deve bater com upload.single('curriculo')

        try {
            msgElement.innerHTML = 'Enviando...';
            msgElement.style.color = '#2c5f2d';
            
            const res = await fetch('http://localhost:3000/api/curriculum', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // FormData define o Content-Type automaticamente
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                msgElement.innerHTML = 'Currículo recebido com sucesso! Entraremos em contato.';
                msgElement.style.color = '#2c5f2d';
                document.getElementById('curriculoExperiencia').value = '';
                if (arquivoInput) arquivoInput.value = '';
                if (fileUploadText) fileUploadText.textContent = 'Anexar currículo (PDF)';
                if (fileUploadLabel) fileUploadLabel.classList.remove('file-selected');
            } else {
                msgElement.innerHTML = data.error || 'Erro ao enviar currículo.';
                msgElement.style.color = '#c97e2c';
            }
        } catch (error) {
            console.error('Erro:', error);
            msgElement.innerHTML = 'Erro ao conectar ao servidor.';
            msgElement.style.color = '#c97e2c';
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
