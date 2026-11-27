# Cabana do Pescador (loja fictícia de portfólio)

## Como rodar

1. Deixe **todos os arquivos juntos na mesma pasta** (sem subpastas):

   ```
   index.html   style.css
   utils.js     products.js   cart.js   quickview.js   checkout.js   app.js   script.js
   ```

2. Dê dois cliques no `index.html`. Ele abre no navegador, não precisa instalar nada.
   (Opcional: no VS Code, clique com o botão direito no `index.html` e escolha *Open with Live Server*.)

3. É preciso estar **conectado à internet**: as fontes (Google Fonts), os ícones (Font Awesome) e as fotos (Unsplash) vêm de fora.

## Se algo não funcionar

- Abra o console: tecla **F12**, aba **Console**. Erros em vermelho dizem o arquivo que faltou.
- Se a vitrine mostrar um aviso sobre o `products.js`, o arquivo não está na mesma pasta do `index.html`.
- Os nomes precisam ser idênticos aos de cima (minúsculas, sem espaços e sem "(1)" no final).
- A ordem dos `<script>` no final do `index.html` importa: utils → products → cart → quickview → checkout → app → script.

## O que cada arquivo faz

| Arquivo | Função |
| --- | --- |
| `index.html` | Estrutura da página e dos modais |
| `style.css` | Visual (variáveis de cor e espaçamento no topo) |
| `utils.js` | Funções compartilhadas (moeda, segurança, modal acessível) |
| `products.js` | Catálogo: edite aqui para mudar produtos e preços |
| `cart.js` | Carrinho e `localStorage` |
| `quickview.js` | Modal de detalhes do produto |
| `checkout.js` | Checkout simulado (CEP, PIX, confirmação) |
| `app.js` | Vitrine: filtros, ordenação e cards |
| `script.js` | Menu, FAQ e rolagem |
