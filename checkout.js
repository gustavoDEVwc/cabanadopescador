/* ==================== CHECKOUT SIMULADO ====================
   Três etapas dentro de um modal:
     1. Resumo do pedido + CEP + frete (simulado)
     2. Pagamento via PIX (código copia-e-cola e QR fictícios)
     3. Confirmação do pedido (esvazia o carrinho)

   Nada aqui conversa com servidor, banco ou API: é uma demonstração.
   Numa loja real, o cálculo de frete, o código PIX e a confirmação do
   pagamento vêm de um back-end / gateway de pagamento.

   API pública:  Checkout.open() */
(() => {
    'use strict';

    const root = document.getElementById('checkout-modal');
    const corpo = document.getElementById('checkout-body');
    if (!root || !corpo || !window.Cart) return;

    // Ao fechar, o foco volta ao ícone do carrinho (a gaveta já está fechada)
    const dialogo = criarDialogo(root, { retornoFoco: () => document.getElementById('cart-toggle') });

    const fmt = (c) => brl.format(c / 100);

    /* ---------- Frete simulado ----------
       Valores fictícios por região, pelo primeiro dígito do CEP.
       Econômico fica grátis acima do valor da barra de frete grátis do carrinho. */
    const REGIOES = {
        sudeste:  { nome: 'Sudeste',      eco: { valor: 2490, dias: 5 },  exp: { valor: 4490, dias: 2 } },
        sul:      { nome: 'Sul',          eco: { valor: 2990, dias: 6 },  exp: { valor: 4990, dias: 3 } },
        centro:   { nome: 'Centro-Oeste', eco: { valor: 3490, dias: 7 },  exp: { valor: 5990, dias: 4 } },
        nordeste: { nome: 'Nordeste',     eco: { valor: 3990, dias: 8 },  exp: { valor: 6490, dias: 4 } },
        norte:    { nome: 'Norte',        eco: { valor: 4990, dias: 10 }, exp: { valor: 7990, dias: 6 } }
    };
    const REGIAO_POR_DIGITO = {
        '0': 'sudeste', '1': 'sudeste', '2': 'sudeste', '3': 'sudeste',
        '4': 'nordeste', '5': 'nordeste', '6': 'norte', '7': 'centro',
        '8': 'sul', '9': 'sul'
    };

    let estado = null;     // tudo que o checkout sabe sobre o pedido em andamento
    let token = 0;         // identifica o cálculo de frete "vigente" (ignora respostas antigas)

    /* ---------- Ajudantes ---------- */
    const el = (id) => document.getElementById(id);

    function totalPedido() {
        const frete = estado.fretes?.find(f => f.id === estado.freteId);
        return { frete, total: estado.snap.subtotal + (frete ? frete.centavos : 0) };
    }

    function tlv(id, valor) {            // formato dos códigos PIX: id + tamanho + valor
        return id + String(valor.length).padStart(2, '0') + valor;
    }

    function gerarCodigoPix(numero, totalCentavos) {
        // Fictício de propósito: chave e CRC inválidos, então nenhum banco aceita
        return tlv('00', '01') +
            tlv('26', tlv('00', 'br.gov.bcb.pix') + tlv('01', 'demo@cabana.exemplo')) +
            tlv('52', '0000') + tlv('53', '986') +
            tlv('54', (totalCentavos / 100).toFixed(2)) +
            tlv('58', 'BR') + tlv('59', 'CABANA DO PESCADOR') + tlv('60', 'SAO PAULO') +
            tlv('62', tlv('05', numero.replace('-', ''))) + '6304DEMO';
    }

    // QR "de mentira": desenho determinístico gerado a partir do código, só para a demonstração
    function qrFalso(texto) {
        const N = 29;
        let h = 2166136261;
        for (const ch of texto) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
        const rand = () => {
            h += 0x6D2B79F5;
            let t = h;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const cantos = [[0, 0], [N - 7, 0], [0, N - 7]];
        const noCanto = (x, y) => cantos.some(([cx, cy]) => x >= cx - 1 && x <= cx + 7 && y >= cy - 1 && y <= cy + 7);
        let d = '';
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                if (noCanto(x, y)) continue;
                if (rand() > 0.52) d += `M${x} ${y}h1v1h-1z`;
            }
        }
        cantos.forEach(([cx, cy]) => {   // três quadrados de posição, como em todo QR
            d += `M${cx} ${cy}h7v7h-7zM${cx + 1} ${cy + 1}v5h5v-5z`;
            d += `M${cx + 2} ${cy + 2}h3v3h-3z`;
        });
        return `<svg class="pix__qr-svg" viewBox="-2 -2 ${N + 4} ${N + 4}" shape-rendering="crispEdges" role="img" aria-label="QR Code fictício de demonstração">
                    <rect x="-2" y="-2" width="${N + 4}" height="${N + 4}" fill="#fff"/>
                    <path d="${d}" fill="#121212" fill-rule="evenodd"/>
                </svg>`;
    }

    function focar() {
        const alvo = corpo.querySelector('[data-autofocus]');
        if (alvo) alvo.focus({ preventScroll: true });
        root.querySelector('.modal__panel').scrollTop = 0;
    }

    /* ---------- Etapa 1: resumo, CEP e frete ---------- */
    function renderEtapa1() {
        estado.etapa = 1;
        const { linhas, subtotal } = estado.snap;

        corpo.innerHTML = `
            <header class="checkout__header">
                <p class="checkout__step">Etapa 1 de 3</p>
                <h2 class="checkout__title" id="checkout-title" tabindex="-1">Resumo do pedido</h2>
            </header>

            <ul class="checkout__items">
                ${linhas.map(l => `
                    <li class="checkout__item">
                        <span>${l.qtd}× ${esc(l.p.nome)}${l.opcao ? `<small>${esc(l.p.opcao.rotulo)}: ${esc(l.opcao)}</small>` : ''}</span>
                        <span>${fmt(l.unit * l.qtd)}</span>
                    </li>`).join('')}
            </ul>

            <form class="checkout__cep" id="cep-form" novalidate>
                <label for="cep">CEP de entrega</label>
                <div class="checkout__cep-row">
                    <input id="cep" name="cep" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="9"
                           placeholder="00000-000" value="${estado.cep ? estado.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2') : ''}"
                           aria-describedby="cep-msg" data-autofocus>
                    <button type="submit" class="btn btn--outline" id="cep-btn">Calcular frete</button>
                </div>
                <p class="checkout__msg" id="cep-msg" role="status" aria-live="polite"></p>
            </form>

            <fieldset class="checkout__fretes" id="fretes" hidden>
                <legend>Opções de entrega</legend>
            </fieldset>

            <fieldset class="checkout__pagamento">
                <legend>Pagamento</legend>
                <label class="opcao-pagamento">
                    <input type="radio" name="pagamento" value="pix" checked>
                    <span><strong>PIX</strong><small>Aprovação imediata, pague pelo app do seu banco</small></span>
                </label>
            </fieldset>

            <dl class="cart__summary checkout__totais">
                <div class="cart__row"><dt>Subtotal</dt><dd>${fmt(subtotal)}</dd></div>
                <div class="cart__row"><dt>Frete</dt><dd id="ck-frete">Informe o CEP</dd></div>
                <div class="cart__row cart__row--total"><dt>Total</dt><dd id="ck-total">${fmt(subtotal)}</dd></div>
            </dl>

            <div class="checkout__actions">
                <button type="button" class="btn btn--outline" data-ck="voltar-carrinho">Voltar ao carrinho</button>
                <button type="button" class="btn btn--primary" data-ck="ir-pix" id="ck-pagar" disabled>Pagar com PIX</button>
            </div>`;

        if (estado.fretes) pintarFretes();
        atualizarTotais();
        focar();
    }

    function pintarFretes() {
        const campo = el('fretes');
        campo.hidden = false;
        campo.innerHTML = `<legend>Opções de entrega</legend>` + estado.fretes.map(f => `
            <label class="opcao-pagamento">
                <input type="radio" name="frete" value="${f.id}" ${f.id === estado.freteId ? 'checked' : ''}>
                <span><strong>${f.nome} <em class="${f.centavos === 0 ? 'is-free' : ''}">${f.centavos === 0 ? 'Grátis' : fmt(f.centavos)}</em></strong>
                <small>Chega em até ${f.dias} dias úteis</small></span>
            </label>`).join('');
        el('cep-msg').textContent = `Entrega para a região ${estado.regiao.nome}. Valores simulados.`;
    }

    function atualizarTotais() {
        const { frete, total } = totalPedido();
        el('ck-frete').textContent = frete ? (frete.centavos === 0 ? 'Grátis' : fmt(frete.centavos)) : 'Informe o CEP';
        el('ck-total').textContent = fmt(total);
        el('ck-pagar').disabled = !frete;
    }

    function calcularFrete() {
        const campo = el('cep');
        const cep = campo.value.replace(/\D/g, '');
        const msg = el('cep-msg');

        if (cep.length !== 8) {
            campo.setAttribute('aria-invalid', 'true');
            msg.textContent = 'Digite um CEP com 8 números.';
            msg.classList.add('is-error');
            campo.focus();
            return;
        }

        campo.removeAttribute('aria-invalid');
        msg.classList.remove('is-error');
        msg.textContent = 'Calculando frete…';
        const botao = el('cep-btn');
        botao.disabled = true;
        const meu = ++token;

        // Simula a espera de uma consulta a um servidor
        setTimeout(() => {
            if (meu !== token || !dialogo.aberto || estado.etapa !== 1) return;
            const regiao = REGIOES[REGIAO_POR_DIGITO[cep[0]]];
            const gratis = estado.snap.gratis;
            estado.cep = cep;
            estado.regiao = regiao;
            estado.freteId = 'eco';
            estado.fretes = [
                { id: 'eco', nome: 'Econômico', dias: regiao.eco.dias, centavos: gratis ? 0 : regiao.eco.valor },
                { id: 'exp', nome: 'Expresso', dias: regiao.exp.dias, centavos: regiao.exp.valor }
            ];
            botao.disabled = false;
            pintarFretes();
            atualizarTotais();
        }, 700);
    }

    /* ---------- Etapa 2: PIX ---------- */
    function renderEtapa2() {
        estado.etapa = 2;
        const { frete, total } = totalPedido();

        if (!estado.pedido) {
            const numero = 'CP-' + Date.now().toString(36).slice(-6).toUpperCase();
            estado.pedido = { numero, codigo: gerarCodigoPix(numero, total) };
        }

        corpo.innerHTML = `
            <header class="checkout__header">
                <p class="checkout__step">Etapa 2 de 3</p>
                <h2 class="checkout__title" id="checkout-title" tabindex="-1" data-autofocus>Pague com PIX</h2>
            </header>

            <p class="checkout__lead">Total do pedido <strong>${fmt(total)}</strong></p>

            <div class="pix">
                <div class="pix__qr">${qrFalso(estado.pedido.codigo)}</div>
                <div class="pix__codigo">
                    <label for="pix-code">PIX copia e cola</label>
                    <textarea id="pix-code" readonly rows="5">${esc(estado.pedido.codigo)}</textarea>
                    <button type="button" class="btn btn--outline" data-ck="copiar"><i class="fa-regular fa-copy" aria-hidden="true"></i> Copiar código</button>
                    <p class="checkout__msg" id="pix-msg" role="status" aria-live="polite"></p>
                </div>
            </div>

            <p class="checkout__aviso"><i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                Ambiente de demonstração: este código e este QR são fictícios e não geram cobrança. Em uma loja real, o pagamento seria confirmado automaticamente pelo banco.</p>

            <div class="checkout__actions">
                <button type="button" class="btn btn--outline" data-ck="voltar-entrega">Voltar</button>
                <button type="button" class="btn btn--primary" data-ck="confirmar" id="ck-confirmar">Já paguei (simular)</button>
            </div>`;
        focar();
    }

    async function copiar() {
        const area = el('pix-code');
        const msg = el('pix-msg');
        let ok = false;
        try {
            await navigator.clipboard.writeText(area.value);
            ok = true;
        } catch {
            area.select();                       // plano B para navegadores sem a API (ex.: arquivo aberto direto)
            try { ok = document.execCommand('copy'); } catch { ok = false; }
        }
        msg.classList.toggle('is-error', !ok);
        msg.textContent = ok ? 'Código copiado!' : 'Não consegui copiar. Selecione o texto e copie manualmente.';
    }

    function confirmarPagamento() {
        const botao = el('ck-confirmar');
        botao.disabled = true;
        botao.textContent = 'Confirmando pagamento…';
        setTimeout(() => {
            if (!dialogo.aberto || estado.etapa !== 2) return;
            renderEtapa3();
        }, 1200);
    }

    /* ---------- Etapa 3: confirmação ---------- */
    function renderEtapa3() {
        estado.etapa = 3;
        const { linhas } = estado.snap;
        const { frete, total } = totalPedido();

        corpo.innerHTML = `
            <div class="confirmacao">
                <span class="confirmacao__icone" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                <p class="checkout__step">Etapa 3 de 3</p>
                <h2 class="checkout__title" id="checkout-title" tabindex="-1" data-autofocus>Pedido confirmado!</h2>
                <p class="checkout__lead">Número do pedido <strong>${esc(estado.pedido.numero)}</strong></p>
            </div>

            <ul class="checkout__items">
                ${linhas.map(l => `
                    <li class="checkout__item">
                        <span>${l.qtd}× ${esc(l.p.nome)}${l.opcao ? `<small>${esc(l.p.opcao.rotulo)}: ${esc(l.opcao)}</small>` : ''}</span>
                        <span>${fmt(l.unit * l.qtd)}</span>
                    </li>`).join('')}
            </ul>

            <dl class="cart__summary checkout__totais">
                <div class="cart__row"><dt>Pagamento</dt><dd>PIX, aprovado</dd></div>
                <div class="cart__row"><dt>Entrega (${esc(frete.nome)})</dt><dd>${frete.centavos === 0 ? 'Grátis' : fmt(frete.centavos)}</dd></div>
                <div class="cart__row"><dt>Previsão</dt><dd>até ${frete.dias} dias úteis</dd></div>
                <div class="cart__row cart__row--total"><dt>Total pago</dt><dd>${fmt(total)}</dd></div>
            </dl>

            <p class="checkout__aviso"><i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                Pedido simulado para demonstração. Nenhuma cobrança foi feita e nenhum produto será enviado.</p>

            <div class="checkout__actions checkout__actions--single">
                <button type="button" class="btn btn--primary" data-ck="fim">Voltar à loja</button>
            </div>`;

        window.Cart.clear();     // o pedido foi concluído: esvazia o carrinho
        focar();
    }

    /* ---------- Eventos (delegação no corpo do modal) ---------- */
    corpo.addEventListener('submit', (e) => {
        if (e.target.id === 'cep-form') {
            e.preventDefault();
            calcularFrete();
        }
    });

    corpo.addEventListener('input', (e) => {
        if (e.target.id !== 'cep') return;
        // Máscara 00000-000
        const d = e.target.value.replace(/\D/g, '').slice(0, 8);
        e.target.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
        e.target.removeAttribute('aria-invalid');

        // Mudou o CEP depois de calcular: o frete antigo deixa de valer
        if (estado.fretes && d !== estado.cep) {
            token++;
            estado.fretes = null;
            estado.cep = '';
            el('fretes').hidden = true;
            el('cep-msg').textContent = '';
            atualizarTotais();
        }
    });

    corpo.addEventListener('change', (e) => {
        if (e.target.name === 'frete') {
            estado.freteId = e.target.value;
            atualizarTotais();
        }
    });

    corpo.addEventListener('click', (e) => {
        const botao = e.target.closest('[data-ck]');
        if (!botao) return;

        switch (botao.dataset.ck) {
            case 'voltar-carrinho': dialogo.fechar(); window.Cart.open(); break;
            case 'ir-pix':          renderEtapa2(); break;
            case 'voltar-entrega':  renderEtapa1(); break;
            case 'copiar':          copiar(); break;
            case 'confirmar':       confirmarPagamento(); break;
            case 'fim':             dialogo.fechar(); break;
        }
    });

    function abrir() {
        const snap = window.Cart.snapshot();
        if (!snap.linhas.length) return;
        token++;
        estado = { snap, etapa: 1, cep: '', regiao: null, fretes: null, freteId: 'eco', pedido: null };
        renderEtapa1();
        dialogo.abrir();
    }

    window.Checkout = { open: abrir };
})();
