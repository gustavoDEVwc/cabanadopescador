/* ==================== VITRINE ====================
   Lê PRODUTOS e CATEGORIAS (products.js), monta filtros, ordenação e grid.
   Fica dentro de uma função para as variáveis não vazarem para os outros
   scripts (scripts comuns compartilham o escopo global). */
(() => {
    'use strict';

    const grid      = document.getElementById('vitrine-grid');
    const filtros   = document.getElementById('vitrine-filtros');
    const contador  = document.getElementById('vitrine-contador');
    const ordenar   = document.getElementById('vitrine-ordenar');

    if (grid && typeof PRODUTOS === 'undefined') {
        console.error('products.js não foi carregado. Confira se o arquivo está na mesma pasta do index.html.');
        grid.innerHTML = '<p class="vitrine__erro">Não encontrei o <strong>products.js</strong>. Confira se todos os arquivos estão na mesma pasta do <strong>index.html</strong> e recarregue a página.</p>';
        return;
    }

    if (!grid || !filtros) return;

    const MAX_PARCELAS = 6;

    let categoriaAtiva = 'todos';
    let ordenacao = 'padrao';

    /* ---------- Funções auxiliares ---------- */
    const precoFinal = (p) => p.precoPromocional ?? p.preco;

    const percentualDesconto = (p) =>
        p.precoPromocional ? Math.round((1 - p.precoPromocional / p.preco) * 100) : 0;

    // Ordenação por preço: sempre compara o preço que o cliente realmente paga
    const ORDENADORES = {
        padrao: null,                                          // mantém a ordem do products.js
        menor:  (a, b) => precoFinal(a) - precoFinal(b),
        maior:  (a, b) => precoFinal(b) - precoFinal(a)
    };

    /* ---------- Templates ---------- */
    function templateCard(p) {
        const desconto = percentualDesconto(p);
        const parcela = brl.format(precoFinal(p) / MAX_PARCELAS);

        return `
            <article class="produto" data-id="${esc(p.id)}">
                <button type="button" class="produto__media" data-quick="${esc(p.id)}" aria-label="Ver detalhes de ${esc(p.nome)}">
                    <img src="${esc(p.imagens[0])}" alt="" width="800" height="600" loading="lazy" decoding="async">
                    ${desconto ? `<span class="produto__badge">-${desconto}%</span>` : ''}
                </button>
                <div class="produto__body">
                    <h3 class="produto__nome"><button type="button" class="produto__nome-btn" data-quick="${esc(p.id)}">${esc(p.nome)}</button></h3>
                    <p class="produto__variacao">${esc(p.variacao)}</p>
                    <p class="produto__descricao">${esc(p.descricao)}</p>
                    <div class="produto__preco">
                        ${p.precoPromocional ? `<del class="produto__preco-antigo"><span class="sr-only">De </span>${brl.format(p.preco)}</del>` : ''}
                        <strong class="produto__preco-atual">${p.precoPromocional ? '<span class="sr-only">Por </span>' : ''}${brl.format(precoFinal(p))}</strong>
                        <span class="produto__parcelas">ou ${MAX_PARCELAS}x de ${parcela}</span>
                    </div>
                    ${p.opcao
                        ? `<button type="button" class="btn btn--outline produto__add" data-quick="${esc(p.id)}" aria-label="Escolher ${esc(p.opcao.rotulo.toLowerCase())} de ${esc(p.nome)}">
                               <i class="fa-solid fa-sliders" aria-hidden="true"></i> Escolher opção
                           </button>`
                        : `<button type="button" class="btn btn--primary produto__add" data-add="${esc(p.id)}" aria-label="Adicionar ${esc(p.nome)} ao carrinho">
                               <i class="fa-solid fa-cart-plus" aria-hidden="true"></i> Adicionar
                           </button>`}
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
        let lista = categoriaAtiva === 'todos'
            ? PRODUTOS
            : PRODUTOS.filter(p => p.categoria === categoriaAtiva);

        const comparar = ORDENADORES[ordenacao];
        if (comparar) lista = [...lista].sort(comparar);    // cópia: nunca altera o array original

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

    if (ordenar) {
        ordenar.addEventListener('change', () => {
            ordenacao = ordenar.value;
            renderProdutos();
        });
    }

    // Cliques nos cards: foto/título/"Escolher opção" abrem o modal; "Adicionar" compra direto
    grid.addEventListener('click', (e) => {
        const rapido = e.target.closest('[data-quick]');
        if (rapido && window.QuickView) return window.QuickView.open(rapido.dataset.quick);

        const compra = e.target.closest('[data-add]');
        if (compra && window.Cart) window.Cart.add(compra.dataset.add);
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
