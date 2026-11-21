/* ==================== VITRINE ====================
   Lê PRODUTOS e CATEGORIAS (products.js), monta os filtros e o grid.
   Fica dentro de uma função para as variáveis não vazarem para o
   script.js (scripts comuns compartilham o escopo global). */
(() => {
    'use strict';

    const grid      = document.getElementById('vitrine-grid');
    const filtros   = document.getElementById('vitrine-filtros');
    const contador  = document.getElementById('vitrine-contador');

    if (!grid || !filtros || typeof PRODUTOS === 'undefined') return;

    const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const MAX_PARCELAS = 6;

    // Imagem ilustrada, usada se uma foto não carregar
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

    let categoriaAtiva = 'todos';

    /* ---------- Funções auxiliares ---------- */
    // Evita que texto dos dados vire HTML (importante se um dia vier de uma API)
    const esc = (texto) => String(texto)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const precoFinal = (p) => p.precoPromocional ?? p.preco;

    const percentualDesconto = (p) =>
        p.precoPromocional ? Math.round((1 - p.precoPromocional / p.preco) * 100) : 0;

    /* ---------- Templates ---------- */
    function templateCard(p) {
        const desconto = percentualDesconto(p);
        const parcela = brl.format(precoFinal(p) / MAX_PARCELAS);

        return `
            <article class="produto" data-id="${esc(p.id)}">
                <div class="produto__media">
                    <img src="${esc(p.imagens[0])}" alt="${esc(p.nome)}" width="800" height="600" loading="lazy" decoding="async">
                    ${desconto ? `<span class="produto__badge">-${desconto}%</span>` : ''}
                </div>
                <div class="produto__body">
                    <h3 class="produto__nome">${esc(p.nome)}</h3>
                    <p class="produto__variacao">${esc(p.variacao)}</p>
                    <p class="produto__descricao">${esc(p.descricao)}</p>
                    <div class="produto__preco">
                        ${p.precoPromocional ? `<del class="produto__preco-antigo"><span class="sr-only">De </span>${brl.format(p.preco)}</del>` : ''}
                        <strong class="produto__preco-atual">${p.precoPromocional ? '<span class="sr-only">Por </span>' : ''}${brl.format(precoFinal(p))}</strong>
                        <span class="produto__parcelas">ou ${MAX_PARCELAS}x de ${parcela}</span>
                    </div>
                </div>
            </article>`;
    }

    function templateFiltro(slug, rotulo) {
        return `<button type="button" class="filtro" data-filtro="${esc(slug)}" aria-pressed="${slug === categoriaAtiva}">${esc(rotulo)}</button>`;
    }

    /* ---------- Renderização ---------- */
    function renderFiltros() {
        const botoes = [templateFiltro('todos', 'Todos')]
            .concat(CATEGORIAS.map(c => templateFiltro(c.slug, c.rotulo)));
        filtros.innerHTML = botoes.join('');
    }

    function renderProdutos() {
        const lista = categoriaAtiva === 'todos'
            ? PRODUTOS
            : PRODUTOS.filter(p => p.categoria === categoriaAtiva);

        grid.innerHTML = lista.map(templateCard).join('');

        const nomeCategoria = CATEGORIAS.find(c => c.slug === categoriaAtiva)?.nome;
        const total = `${lista.length} ${lista.length === 1 ? 'produto' : 'produtos'}`;
        contador.textContent = nomeCategoria ? `${total} em ${nomeCategoria}` : `${total} na loja`;
    }

    function setCategoria(slug) {
        if (slug === categoriaAtiva) return;
        categoriaAtiva = slug;

        filtros.querySelectorAll('.filtro').forEach(btn => {
            btn.setAttribute('aria-pressed', String(btn.dataset.filtro === slug));
        });
        renderProdutos();
    }

    /* ---------- Eventos ---------- */
    // Delegação: um único ouvinte cobre todos os botões de filtro
    filtros.addEventListener('click', (e) => {
        const botao = e.target.closest('.filtro');
        if (botao) setCategoria(botao.dataset.filtro);
    });

    // Tiles da seção de categorias aplicam o filtro (o scroll até a vitrine é do próprio link)
    document.querySelectorAll('.categoria__card[data-category]').forEach(tile => {
        tile.addEventListener('click', () => setCategoria(tile.dataset.category));
    });

    // 'error' não borbulha, então ouvimos na fase de captura
    grid.addEventListener('error', (e) => {
        const img = e.target;
        if (img.tagName === 'IMG' && !img.dataset.fallback) {
            img.dataset.fallback = 'true';
            img.src = FALLBACK_IMG;
        }
    }, true);

    renderFiltros();
    renderProdutos();
})();
