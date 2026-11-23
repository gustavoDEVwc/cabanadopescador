/* ==================== UTILIDADES COMPARTILHADAS ====================
   Carregado antes de todos os outros scripts. Tudo aqui é usado por
   mais de um arquivo (app.js e cart.js), por isso fica num lugar só. */

// Formata número como moeda brasileira: 379.9 -> "R$ 379,90"
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Impede que texto dos dados vire HTML (importante se um dia vier de uma API)
const esc = (texto) => String(texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Imagem ilustrada, usada quando uma foto do Unsplash não carrega
const FALLBACK_IMG = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
    '<rect width="800" height="600" fill="#2a2c2f"/>' +
    '<g fill="none" stroke="#4a4d52" stroke-opacity=".6" stroke-width="2">' +
    '<path d="M-20 420C120 340 240 470 400 390S660 330 820 410"/>' +
    '<path d="M-20 370C120 290 240 420 400 340S660 280 820 360"/>' +
    '<path d="M-20 320C120 240 240 370 400 290S660 230 820 310"/></g>' +
    '<g transform="translate(340 210)"><rect width="120" height="120" rx="6" fill="#ff6a13"/>' +
    '<polygon points="60,26 97,92 23,92" fill="#121212"/>' +
    '<polygon points="60,54 45,92 75,92" fill="#ff6a13"/></g></svg>'
);

/* ==================== DIÁLOGO (MODAL) REUTILIZÁVEL ====================
   Usado pelo Quick View e pelo Checkout. Cuida do que todo modal acessível
   precisa: abrir/fechar, Esc, clique fora, travar o scroll da página, prender
   o Tab dentro dele e devolver o foco ao elemento de onde veio.

   HTML esperado:  <div class="modal" id="..."> <div class="modal__overlay"></div>
                     <div class="modal__panel" role="dialog" ...> ... </div> </div>
   Qualquer elemento com [data-modal-close] dentro dele fecha o modal. */
function criarDialogo(root, { retornoFoco } = {}) {
    const panel = root.querySelector('.modal__panel');
    let aberto = false;
    let anterior = null;

    const focaveis = () => [...panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    )].filter(n => n.offsetParent !== null);

    function abrir() {
        if (aberto) return;
        aberto = true;
        anterior = document.activeElement;
        root.classList.add('is-open');
        document.body.classList.add('modal-open');
        const inicial = panel.querySelector('[data-autofocus]') || panel.querySelector('[data-modal-close]');
        inicial.focus({ preventScroll: true });
    }

    function fechar() {
        if (!aberto) return;
        aberto = false;
        root.classList.remove('is-open');
        document.body.classList.remove('modal-open');
        const volta = retornoFoco ? retornoFoco() : anterior;
        if (volta && document.contains(volta)) volta.focus({ preventScroll: true });
    }

    root.addEventListener('click', (e) => {
        if (e.target.closest('[data-modal-close]') || e.target.classList.contains('modal__overlay')) fechar();
    });

    document.addEventListener('keydown', (e) => {
        if (!aberto) return;
        if (e.key === 'Escape') return fechar();
        if (e.key === 'Tab') {
            const lista = focaveis();
            if (!lista.length) return;
            const primeiro = lista[0], ultimo = lista[lista.length - 1];
            if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
        }
    });

    return { abrir, fechar, panel, get aberto() { return aberto; } };
}
