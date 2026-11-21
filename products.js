/* ==================== CATÁLOGO ====================
   Única fonte de dados da loja. O app.js lê este arquivo e monta
   filtros e cards sozinho: para adicionar um produto, basta copiar
   um objeto abaixo e trocar os valores.

   Campos de cada produto:
   - id                 identificador único (usado no carrinho depois)
   - nome               título do card
   - categoria          slug igual ao data-category dos tiles do index.html
   - preco              preço cheio, em reais (número, não texto)
   - precoPromocional   preço com desconto, ou null se não houver
   - variacao           peso, capacidade ou tamanho (texto curto)
   - descricao          uma frase de até ~110 caracteres
   - imagens            lista de URLs; o card usa a primeira
*/

const CATEGORIAS = [
    { slug: 'barracas',    nome: 'Barracas e abrigos',  rotulo: 'Barracas' },
    { slug: 'pesca',       nome: 'Pesca',               rotulo: 'Pesca' },
    { slug: 'iluminacao',  nome: 'Iluminação',          rotulo: 'Iluminação' },
    { slug: 'mochilas',    nome: 'Mochilas e bolsas',   rotulo: 'Mochilas' },
    { slug: 'cozinha',     nome: 'Cozinha de camping',  rotulo: 'Cozinha' },
    { slug: 'ferramentas', nome: 'Facas e ferramentas', rotulo: 'Ferramentas' }
];

/* Fotos de placeholder (Unsplash). São paisagens do universo outdoor,
   não fotos literais de cada produto. Para trocar uma foto, mude só o
   ID aqui; os produtos pegam daqui. Se um ID sair do ar, o app.js
   mostra uma imagem ilustrada no lugar. */
const FOTOS = {
    barracas:    ['1504280390367-361c6d9f38f4', '1478131143081-80f7f84ca84d', '1537905569824-f89f14cceb68'],
    pesca:       ['1439066615861-d1af74d74000', '1501785888041-af3ef285b470', '1500375592092-40eb2168fd21'],
    iluminacao:  ['1419242902214-272b3f66ee7a', '1478131143081-80f7f84ca84d', '1475274047050-1d0c0975c63e'],
    mochilas:    ['1553062407-98eeb64c6a62', '1501555088652-021faa106b9b', '1464822759023-fed622ff2c3b'],
    cozinha:     ['1523987355523-c7b5b0dd90a7', '1470071459604-3b5ec3a7fe05', '1441974231531-c6227db76b6e'],
    ferramentas: ['1441974231531-c6227db76b6e', '1469474968028-56623f02e42e', '1506905925346-21bda4d32df4']
};

const foto = (categoria, i) => {
    const lista = FOTOS[categoria];
    return `https://images.unsplash.com/photo-${lista[i % lista.length]}?auto=format&fit=crop&w=800&h=600&q=75`;
};

const PRODUTOS = [
    /* ---------- Barracas e abrigos ---------- */
    {
        id: 'brc-001',
        nome: 'Barraca Iglu 3 Pessoas Impermeável',
        categoria: 'barracas',
        preco: 449.90,
        precoPromocional: 379.90,
        variacao: '3 pessoas · 3,8 kg',
        descricao: 'Sobreteto com coluna d’água de 2000 mm e montagem em dois arcos de fibra.',
        imagens: [foto('barracas', 0), foto('barracas', 1)]
    },
    {
        id: 'brc-002',
        nome: 'Barraca Trilha Ultraleve 2 Pessoas',
        categoria: 'barracas',
        preco: 689.00,
        precoPromocional: null,
        variacao: '2 pessoas · 2,1 kg',
        descricao: 'Estrutura de alumínio e tecido ripstop. Cabe na lateral da mochila cargueira.',
        imagens: [foto('barracas', 1), foto('barracas', 2)]
    },
    {
        id: 'brc-003',
        nome: 'Tarp Multiuso 3 x 3 m Ripstop',
        categoria: 'barracas',
        preco: 129.90,
        precoPromocional: 99.90,
        variacao: '3 × 3 m · 480 g',
        descricao: 'Cobertura rápida para chuva e sol, com ilhoses reforçados e cordas inclusas.',
        imagens: [foto('barracas', 2), foto('barracas', 0)]
    },

    /* ---------- Pesca ---------- */
    {
        id: 'pes-001',
        nome: 'Vara Telescópica Carbono 1,80 m',
        categoria: 'pesca',
        preco: 219.90,
        precoPromocional: 189.90,
        variacao: '1,80 m · 230 g',
        descricao: 'Ação rápida para tilápia e traíra. Recolhida, fica com 60 cm e cabe em qualquer mala.',
        imagens: [foto('pesca', 0), foto('pesca', 1)]
    },
    {
        id: 'pes-002',
        nome: 'Molinete 3000 com 6 Rolamentos',
        categoria: 'pesca',
        preco: 259.00,
        precoPromocional: null,
        variacao: 'Tamanho 3000 · 290 g',
        descricao: 'Corpo em alumínio, freio progressivo e recolhimento suave de 5,2:1.',
        imagens: [foto('pesca', 1), foto('pesca', 2)]
    },
    {
        id: 'pes-003',
        nome: 'Kit de Iscas Artificiais 24 Peças',
        categoria: 'pesca',
        preco: 89.90,
        precoPromocional: 69.90,
        variacao: '24 peças · 320 g',
        descricao: 'Sapinhos, shads e meia-águas em cores variadas, organizados em maleta com divisórias.',
        imagens: [foto('pesca', 2), foto('pesca', 0)]
    },

    /* ---------- Iluminação ---------- */
    {
        id: 'ilu-001',
        nome: 'Lanterna de Cabeça Recarregável 800 lm',
        categoria: 'iluminacao',
        preco: 139.90,
        precoPromocional: 109.90,
        variacao: '800 lm · 95 g',
        descricao: 'Três níveis de brilho, luz vermelha para o acampamento e bateria USB-C.',
        imagens: [foto('iluminacao', 0), foto('iluminacao', 1)]
    },
    {
        id: 'ilu-002',
        nome: 'Lampião LED Recarregável 360°',
        categoria: 'iluminacao',
        preco: 169.00,
        precoPromocional: null,
        variacao: '600 lm · 410 g',
        descricao: 'Ilumina a barraca inteira, tem gancho para pendurar e serve de carregador de celular.',
        imagens: [foto('iluminacao', 1), foto('iluminacao', 2)]
    },
    {
        id: 'ilu-003',
        nome: 'Lanterna Tática Alumínio com Zoom',
        categoria: 'iluminacao',
        preco: 119.90,
        precoPromocional: 94.90,
        variacao: '1000 lm · 210 g',
        descricao: 'Foco ajustável de 50 a 300 m, resistente a respingos e com corpo antiderrapante.',
        imagens: [foto('iluminacao', 2), foto('iluminacao', 0)]
    },

    /* ---------- Mochilas e bolsas ---------- */
    {
        id: 'moc-001',
        nome: 'Mochila Cargueira 60 L',
        categoria: 'mochilas',
        preco: 389.90,
        precoPromocional: 329.90,
        variacao: '60 L · 1,9 kg',
        descricao: 'Costas ventiladas, cinto lombar acolchoado e capa de chuva embutida.',
        imagens: [foto('mochilas', 0), foto('mochilas', 1)]
    },
    {
        id: 'moc-002',
        nome: 'Bolsa Estanque 20 L',
        categoria: 'mochilas',
        preco: 149.90,
        precoPromocional: null,
        variacao: '20 L · 380 g · Laranja',
        descricao: 'PVC com costura soldada e fecho roll-top. Mantém roupa e documentos secos no barco.',
        imagens: [foto('mochilas', 1), foto('mochilas', 2)]
    },
    {
        id: 'moc-003',
        nome: 'Mochila de Hidratação 12 L',
        categoria: 'mochilas',
        preco: 199.90,
        precoPromocional: 169.90,
        variacao: '12 L · reservatório 2 L · 650 g',
        descricao: 'Compacta para caminhadas curtas, com bolso frontal e mangueira com válvula de mordida.',
        imagens: [foto('mochilas', 2), foto('mochilas', 0)]
    },

    /* ---------- Cozinha de camping ---------- */
    {
        id: 'coz-001',
        nome: 'Fogareiro Portátil a Gás Compacto',
        categoria: 'cozinha',
        preco: 99.90,
        precoPromocional: 79.90,
        variacao: '180 g · acompanha estojo',
        descricao: 'Encaixe direto em cartucho de gás, chama regulável e suportes dobráveis.',
        imagens: [foto('cozinha', 0), foto('cozinha', 1)]
    },
    {
        id: 'coz-002',
        nome: 'Kit Panelas Camping Alumínio 7 Peças',
        categoria: 'cozinha',
        preco: 189.90,
        precoPromocional: null,
        variacao: '7 peças · 1,1 kg',
        descricao: 'Duas panelas, frigideira, tampa e talheres encaixados em uma só peça de transporte.',
        imagens: [foto('cozinha', 1), foto('cozinha', 2)]
    },
    {
        id: 'coz-003',
        nome: 'Garrafa Térmica Inox 1 L',
        categoria: 'cozinha',
        preco: 149.00,
        precoPromocional: 119.00,
        variacao: '1 L · 520 g',
        descricao: 'Parede dupla a vácuo: mantém bebida quente por 12 horas e gelada por 24.',
        imagens: [foto('cozinha', 2), foto('cozinha', 0)]
    },

    /* ---------- Facas e ferramentas ---------- */
    {
        id: 'fer-001',
        nome: 'Faca Tática Lâmina Fixa 10 cm',
        categoria: 'ferramentas',
        preco: 159.90,
        precoPromocional: 129.90,
        variacao: 'Lâmina 10 cm · 240 g',
        descricao: 'Aço inox 7Cr17, cabo emborrachado e bainha de nylon com passador de cinto.',
        imagens: [foto('ferramentas', 0), foto('ferramentas', 1)]
    },
    {
        id: 'fer-002',
        nome: 'Machadinha de Acampamento',
        categoria: 'ferramentas',
        preco: 179.90,
        precoPromocional: null,
        variacao: 'Cabo 35 cm · 780 g',
        descricao: 'Cabeça forjada em aço carbono para rachar lenha miúda, com capa de proteção.',
        imagens: [foto('ferramentas', 1), foto('ferramentas', 2)]
    },
    {
        id: 'fer-003',
        nome: 'Canivete Multiuso 12 Funções',
        categoria: 'ferramentas',
        preco: 119.90,
        precoPromocional: 89.90,
        variacao: '12 funções · 130 g',
        descricao: 'Lâmina, serra, abridor, chave de fenda e alicate em um corpo de aço inox.',
        imagens: [foto('ferramentas', 2), foto('ferramentas', 0)]
    }
];
