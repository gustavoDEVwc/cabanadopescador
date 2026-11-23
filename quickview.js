/* ==================== QUICK VIEW (MODAL DO PRODUTO) ====================
   Abre ao clicar na foto ou no título de um card. Mostra galeria, preço,
   detalhes, seleção de variação e o botão de compra.

   Os botões de foto e de variação atualizam o modal "no lugar" (sem
   recriar o HTML), assim o foco do teclado não se perde.

   API pública:  QuickView.open(id) */
(() => {
    'use strict';

    const root = document.getElementById('quick-modal');
    const conteudo = document.getElementById('quick-content');
    if (!root || !conteudo || typeof PRODUTOS === 'undefined') return;

    const dialogo = criarDialogo(root);
    const MAX_PARCELAS = 6;
    let produtoAtual = null;

    const precoFinal = (p) => p.precoPromocional ?? p.preco;

    function template(p) {
        const desconto = p.precoPromocional ? Math.round((1 - p.precoPromocional / p.preco) * 100) : 0;
        const op = p.opcao;

        return `
            <div class="quick">
                <div class="quick__gallery">
                    <div class="quick__main">
                        <img id="quick-img" src="${esc(p.imagens[0])}" alt="${esc(p.nome)}" width="800" height="600">
                        ${desconto ? `<span class="produto__badge">-${desconto}%</span>` : ''}
                    </div>
                    <div class="quick__thumbs">
                        ${p.imagens.map((url, i) => `
                            <button type="button" class="quick__thumb" data-foto="${i}" aria-label="Ver foto ${i + 1} de ${p.imagens.length}" aria-pressed="${i === 0}">
                                <img src="${esc(url)}" alt="" width="120" height="90">
                            </button>`).join('')}
                    </div>
                </div>

                <div class="quick__info">
                    <h2 class="quick__title" id="quick-title" tabindex="-1" data-autofocus>${esc(p.nome)}</h2>
                    <p class="produto__variacao">${esc(p.variacao)}</p>

                    <div class="produto__preco">
                        ${p.precoPromocional ? `<del class="produto__preco-antigo"><span class="sr-only">De </span>${brl.format(p.preco)}</del>` : ''}
                        <strong class="produto__preco-atual">${p.precoPromocional ? '<span class="sr-only">Por </span>' : ''}${brl.format(precoFinal(p))}</strong>
                        <span class="produto__parcelas">ou ${MAX_PARCELAS}x de ${brl.format(precoFinal(p) / MAX_PARCELAS)}</span>
                    </div>

                    <p class="quick__descricao">${esc(p.descricao)}</p>

                    <ul class="quick__detalhes">
                        ${p.detalhes.map(d => `<li><i class="fa-solid fa-check" aria-hidden="true"></i>${esc(d)}</li>`).join('')}
                    </ul>

                    ${op ? `
                    <fieldset class="quick__opcoes">
                        <legend>${esc(op.rotulo)}: <strong id="quick-opcao-escolhida">${esc(op.valores[0])}</strong></legend>
                        <div class="quick__chips">
                            ${op.valores.map((v, i) => `
                                <label class="chip">
                                    <input type="radio" name="quick-opcao" value="${esc(v)}" ${i === 0 ? 'checked' : ''}>
                                    <span>${esc(v)}</span>
                                </label>`).join('')}
                        </div>
                    </fieldset>` : ''}

                    <button type="button" class="btn btn--primary quick__buy" data-comprar>
                        <i class="fa-solid fa-cart-plus" aria-hidden="true"></i> Adicionar ao carrinho
                    </button>
                </div>
            </div>`;
    }

    function abrir(id) {
        const p = PRODUTOS.find(x => x.id === id);
        if (!p) return;
        produtoAtual = p;
        conteudo.innerHTML = template(p);
        dialogo.abrir();
    }

    conteudo.addEventListener('click', (e) => {
        // Troca a foto principal
        const thumb = e.target.closest('[data-foto]');
        if (thumb) {
            const i = Number(thumb.dataset.foto);
            const img = document.getElementById('quick-img');
            delete img.dataset.fallback;
            img.src = produtoAtual.imagens[i];
            conteudo.querySelectorAll('[data-foto]').forEach(b => b.setAttribute('aria-pressed', String(b === thumb)));
            return;
        }

        // Compra: fecha o modal e abre a gaveta do carrinho
        if (e.target.closest('[data-comprar]')) {
            const marcada = conteudo.querySelector('input[name="quick-opcao"]:checked');
            const id = produtoAtual.id;
            dialogo.fechar();
            window.Cart?.add(id, { opcao: marcada ? marcada.value : '' });
        }
    });

    // Mostra no título "Cor: Verde" a opção marcada
    conteudo.addEventListener('change', (e) => {
        if (e.target.name === 'quick-opcao') {
            document.getElementById('quick-opcao-escolhida').textContent = e.target.value;
        }
    });

    // 'error' não borbulha, então ouvimos na fase de captura
    conteudo.addEventListener('error', (e) => {
        const img = e.target;
        if (img.tagName === 'IMG' && !img.dataset.fallback) {
            img.dataset.fallback = 'true';
            img.src = FALLBACK_IMG;
        }
    }, true);

    window.QuickView = { open: abrir };
})();
