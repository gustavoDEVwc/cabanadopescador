/* ==================== CARRINHO ====================
   Gaveta lateral + estado salvo no localStorage.

   Regra de ouro: no localStorage guardamos só { id, opcao, qtd }. Nome e
   preço são sempre lidos do products.js, então se um preço mudar o carrinho
   já aparece atualizado (e ninguém consegue "editar" o preço no navegador).

   A mesma barraca em duas cores são DUAS linhas: a identidade de cada
   linha é a chave "id::opcao".

   API pública:  Cart.add(id, { opcao, qtd })  Cart.open()  Cart.close()
                 Cart.clear()  Cart.snapshot()  Cart.FRETE_GRATIS */
(() => {
    'use strict';

    const STORAGE_KEY = 'cabana-do-pescador:carrinho';
    const FRETE_GRATIS = 15000;   // em centavos (R$ 150,00). Centavos evitam erro de ponto flutuante
    const QTD_MAX = 10;

    const byId = (id) => document.getElementById(id);
    const el = {
        drawer: byId('cart-drawer'),
        overlay: byId('cart-overlay'),
        toggle: byId('cart-toggle'),
        close: byId('cart-close'),
        count: byId('cart-count'),
        titleCount: byId('cart-title-count'),
        shippingText: byId('cart-shipping-text'),
        bar: byId('cart-bar'),
        barFill: byId('cart-bar-fill'),
        list: byId('cart-list'),
        empty: byId('cart-empty'),
        footer: byId('cart-footer'),
        subtotal: byId('cart-subtotal'),
        savingsRow: byId('cart-savings-row'),
        savings: byId('cart-savings'),
        shippingValue: byId('cart-shipping-value'),
        clear: byId('cart-clear'),
        checkout: byId('cart-checkout')
    };

    if (!el.drawer || typeof PRODUTOS === 'undefined') return;

    const produtoPorId = new Map(PRODUTOS.map(p => [p.id, p]));
    const centavos = (p) => Math.round((p.precoPromocional ?? p.preco) * 100);
    const formatar = (c) => brl.format(c / 100);
    const chave = (id, opcao) => `${id}::${opcao}`;

    // Garante que a opção guardada ainda existe no catálogo (senão usa a primeira)
    function opcaoValida(p, opcao) {
        if (!p.opcao) return '';
        return p.opcao.valores.includes(opcao) ? opcao : p.opcao.valores[0];
    }

    let itens = carregar();
    let aberto = false;
    let focoAnterior = null;

    /* ---------- Persistência ---------- */
    function carregar() {
        try {
            const bruto = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            if (!Array.isArray(bruto)) return [];
            const mapa = new Map();
            bruto.forEach(i => {
                if (!i || !produtoPorId.has(i.id) || !Number.isInteger(i.qtd) || i.qtd < 1) return;
                const opcao = opcaoValida(produtoPorId.get(i.id), i.opcao);
                const k = chave(i.id, opcao);
                const atual = mapa.get(k);
                mapa.set(k, { id: i.id, opcao, qtd: Math.min((atual?.qtd || 0) + i.qtd, QTD_MAX) });
            });
            return [...mapa.values()];
        } catch {
            return [];
        }
    }

    function salvar() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
        } catch {
            // Modo privado ou armazenamento cheio: o carrinho segue funcionando, só não persiste
        }
    }

    /* ---------- Ações sobre o estado ---------- */
    function adicionar(id, { opcao = '', qtd = 1 } = {}) {
        const p = produtoPorId.get(id);
        if (!p) return;
        opcao = opcaoValida(p, opcao);
        const existente = itens.find(i => chave(i.id, i.opcao) === chave(id, opcao));
        if (existente) existente.qtd = Math.min(existente.qtd + qtd, QTD_MAX);
        else itens.push({ id, opcao, qtd: Math.min(qtd, QTD_MAX) });
        salvar();
        render();
        bumpBadge();
        abrir();
    }

    function alterarQtd(k, delta) {
        const item = itens.find(i => chave(i.id, i.opcao) === k);
        if (!item) return;
        item.qtd = Math.min(Math.max(item.qtd + delta, 1), QTD_MAX);
        salvar();
        render();
    }

    function remover(k) {
        itens = itens.filter(i => chave(i.id, i.opcao) !== k);
        salvar();
        render();
    }

    function esvaziar() {
        itens = [];
        salvar();
        render();
    }

    /* ---------- Cálculos ---------- */
    function totais() {
        let quantidade = 0, subtotal = 0, economia = 0;
        const linhas = itens.map(({ id, opcao, qtd }) => {
            const p = produtoPorId.get(id);
            const unit = centavos(p);
            quantidade += qtd;
            subtotal += unit * qtd;
            economia += (Math.round(p.preco * 100) - unit) * qtd;
            return { key: chave(id, opcao), id, opcao, qtd, p, unit };
        });
        return { linhas, quantidade, subtotal, economia, gratis: subtotal >= FRETE_GRATIS };
    }

    /* ---------- Renderização ---------- */
    function templateItem({ key, opcao, qtd, p, unit }) {
        const nome = esc(p.nome);
        const k = esc(key);
        return `
            <li class="cart__item">
                <img class="cart__thumb" src="${esc(p.imagens[0])}" alt="" width="72" height="72" loading="lazy">
                <div class="cart__info">
                    <div class="cart__info-top">
                        <p class="cart__name">${nome}</p>
                        <button type="button" class="cart__remove" data-action="remove" data-key="${k}" aria-label="Remover ${nome} do carrinho">
                            <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                        </button>
                    </div>
                    <p class="cart__variacao">${esc(p.variacao)}${opcao ? ` · ${esc(p.opcao.rotulo)}: ${esc(opcao)}` : ''}</p>
                    <div class="cart__info-bottom">
                        <div class="cart__qty" role="group" aria-label="Quantidade de ${nome}">
                            <button type="button" data-action="dec" data-key="${k}" aria-label="Diminuir quantidade" ${qtd <= 1 ? 'disabled' : ''}>
                                <i class="fa-solid fa-minus" aria-hidden="true"></i>
                            </button>
                            <span class="cart__qty-value" aria-live="polite">${qtd}</span>
                            <button type="button" data-action="inc" data-key="${k}" aria-label="Aumentar quantidade" ${qtd >= QTD_MAX ? 'disabled' : ''}>
                                <i class="fa-solid fa-plus" aria-hidden="true"></i>
                            </button>
                        </div>
                        <p class="cart__line-price">${formatar(unit * qtd)}</p>
                    </div>
                </div>
            </li>`;
    }

    function render() {
        const { linhas, quantidade, subtotal, economia, gratis } = totais();
        const vazio = linhas.length === 0;

        // Contador do header
        el.count.textContent = quantidade > 99 ? '99+' : quantidade;
        el.count.classList.toggle('is-filled', quantidade > 0);
        el.toggle.setAttribute('aria-label', `Carrinho, ${quantidade} ${quantidade === 1 ? 'item' : 'itens'}`);
        el.titleCount.textContent = quantidade ? `(${quantidade})` : '';

        // Barra de frete grátis
        let mensagem;
        if (vazio) mensagem = `Frete grátis a partir de <strong>${formatar(FRETE_GRATIS)}</strong>`;
        else if (gratis) mensagem = '<i class="fa-solid fa-check" aria-hidden="true"></i> Você ganhou <strong>frete grátis</strong>!';
        else mensagem = `Faltam <strong>${formatar(FRETE_GRATIS - subtotal)}</strong> para o frete grátis`;

        el.shippingText.innerHTML = mensagem;
        el.barFill.style.transform = `scaleX(${Math.min(subtotal / FRETE_GRATIS, 1)})`;
        el.bar.setAttribute('aria-valuenow', (Math.min(subtotal, FRETE_GRATIS) / 100).toFixed(2));
        el.bar.setAttribute('aria-valuetext', el.shippingText.textContent.trim());

        // Lista e resumo
        el.list.innerHTML = linhas.map(templateItem).join('');
        el.list.hidden = vazio;
        el.empty.hidden = !vazio;
        el.footer.hidden = vazio;

        el.subtotal.textContent = formatar(subtotal);
        el.savingsRow.hidden = economia <= 0;
        el.savings.textContent = `- ${formatar(economia)}`;
        el.shippingValue.textContent = gratis ? 'Grátis' : 'Calculado no checkout';
        el.shippingValue.classList.toggle('is-free', gratis);
    }

    function bumpBadge() {
        el.count.classList.remove('is-bump');
        void el.count.offsetWidth;          // força o navegador a reiniciar a animação
        el.count.classList.add('is-bump');
    }

    /* ---------- Abrir e fechar a gaveta ---------- */
    function abrir() {
        if (aberto) return;
        if (typeof setMenu === 'function') setMenu(false);   // fecha o menu mobile, se estiver aberto
        aberto = true;
        focoAnterior = document.activeElement;
        el.drawer.classList.add('is-open');
        el.overlay.classList.add('show');
        document.body.classList.add('cart-open');
        el.toggle.setAttribute('aria-expanded', 'true');
        el.close.focus({ preventScroll: true });
    }

    function fechar() {
        if (!aberto) return;
        aberto = false;
        el.drawer.classList.remove('is-open');
        el.overlay.classList.remove('show');
        document.body.classList.remove('cart-open');
        el.toggle.setAttribute('aria-expanded', 'false');
        if (focoAnterior && document.contains(focoAnterior)) focoAnterior.focus({ preventScroll: true });
    }

    /* ---------- Eventos ---------- */
    el.toggle.addEventListener('click', abrir);
    el.close.addEventListener('click', fechar);
    el.overlay.addEventListener('click', fechar);
    el.clear.addEventListener('click', esvaziar);
    document.querySelectorAll('[data-cart-close]').forEach(b => b.addEventListener('click', fechar));

    // Finalizar compra: fecha a gaveta e abre o checkout (checkout.js)
    el.checkout.addEventListener('click', () => {
        fechar();
        if (window.Checkout) window.Checkout.open();
    });

    // Delegação: um ouvinte para todos os botões +, − e remover
    el.list.addEventListener('click', (e) => {
        const botao = e.target.closest('button[data-action]');
        if (!botao) return;
        const { action, key } = botao.dataset;

        if (action === 'inc') alterarQtd(key, 1);
        if (action === 'dec') alterarQtd(key, -1);
        if (action === 'remove') remover(key);

        // render() recria o HTML, então devolvemos o foco para não perder a posição no teclado
        const k = CSS.escape(key);
        const alvo = el.list.querySelector(`button[data-action="${action}"][data-key="${k}"]:not([disabled])`)
            || el.list.querySelector(`button[data-action="inc"][data-key="${k}"]:not([disabled])`);
        (alvo || el.drawer).focus({ preventScroll: true });
    });

    document.addEventListener('keydown', (e) => {
        if (!aberto) return;
        if (e.key === 'Escape') return fechar();

        // Prende o Tab dentro da gaveta enquanto ela está aberta
        if (e.key === 'Tab') {
            const focaveis = [...el.drawer.querySelectorAll('a[href], button:not([disabled])')]
                .filter(n => n.offsetParent !== null);
            if (!focaveis.length) return;
            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
        }
    });

    // Fotos quebradas na gaveta também caem no placeholder
    el.list.addEventListener('error', (e) => {
        const img = e.target;
        if (img.tagName === 'IMG' && !img.dataset.fallback) {
            img.dataset.fallback = 'true';
            img.src = FALLBACK_IMG;
        }
    }, true);

    // Mantém várias abas do navegador sincronizadas
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            itens = carregar();
            render();
        }
    });

    window.Cart = {
        add: adicionar,
        open: abrir,
        close: fechar,
        clear: esvaziar,
        snapshot: totais,
        FRETE_GRATIS
    };
    render();
})();
