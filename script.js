'use strict';

/* ==================== ELEMENTOS ==================== */
const header      = document.getElementById('header');
const navMenu     = document.getElementById('nav-menu');
const navToggle   = document.getElementById('nav-toggle');
const navClose    = document.getElementById('nav-close');
const navOverlay  = document.getElementById('nav-overlay');
const navLinks    = document.querySelectorAll('.nav__link');
const scrollTop   = document.getElementById('scroll-top');
const cartToggle  = document.getElementById('cart-toggle');
const cartCount   = document.getElementById('cart-count');

/* ==================== MENU MOBILE ==================== */
function setMenu(open, returnFocus = false) {
    navMenu.classList.toggle('show-menu', open);
    navOverlay.classList.toggle('show', open);
    document.body.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', String(open));

    if (open) navClose.focus();
    else if (returnFocus) navToggle.focus();
}

navToggle.addEventListener('click', () => setMenu(true));
navClose.addEventListener('click', () => setMenu(false, true));
navOverlay.addEventListener('click', () => setMenu(false, true));
navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) setMenu(false, true);
});

// Se a tela virar desktop com o menu aberto, fecha e destrava o scroll
window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
});

/* ==================== HEADER E BOTÃO DE TOPO ==================== */
function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    scrollTop.classList.toggle('show', y > 500);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ==================== LINK ATIVO NO MENU ==================== */
// IntersectionObserver avisa qual seção está na faixa central da tela
const sections = document.querySelectorAll('main section[id], footer[id]');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active-link', isActive);
            if (isActive) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(section => sectionObserver.observe(section));

/* ==================== FAQ ==================== */
const faqItems = document.querySelectorAll('.faq__item');

faqItems.forEach(item => {
    const button = item.querySelector('.faq__question');

    button.addEventListener('click', () => {
        const willOpen = !item.classList.contains('active');

        // Só um item aberto por vez
        faqItems.forEach(other => {
            other.classList.remove('active');
            other.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        });

        if (willOpen) {
            item.classList.add('active');
            button.setAttribute('aria-expanded', 'true');
        }
    });
});

/* ==================== CARRINHO (gancho para a Etapa 2) ==================== */
// Por enquanto só atualiza o contador do header. A lógica real
// (adicionar, remover, somar, salvar) entra na Etapa 2.
function updateCartBadge(total = 0) {
    cartCount.textContent = total;
    cartCount.classList.toggle('is-filled', total > 0);
    cartToggle.setAttribute('aria-label', `Carrinho, ${total} ${total === 1 ? 'item' : 'itens'}`);
}
updateCartBadge(0);

/* ==================== RODAPÉ ==================== */
document.getElementById('year').textContent = new Date().getFullYear();
