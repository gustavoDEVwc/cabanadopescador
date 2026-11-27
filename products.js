/* ==================== CATÁLOGO ====================
   Única fonte de dados da loja. Vitrine, modal, carrinho e checkout
   leem tudo daqui: para adicionar um produto, copie um objeto abaixo
   e troque os valores.

   Campos de cada produto:
   - id                 identificador único
   - nome               título do card
   - categoria          slug igual ao data-category dos tiles do index.html
   - preco              preço cheio, em reais (número, não texto)
   - precoPromocional   preço com desconto, ou null se não houver
   - variacao           peso, capacidade ou tamanho (texto curto, fixo do produto)
   - descricao          uma frase de até ~110 caracteres
   - detalhes           lista de características (aparece no modal)
   - opcao              (opcional) escolha do cliente: { rotulo: 'Cor', valores: [...] }
                        Se o produto não tiver variação, simplesmente omita
   - imagens            lista de URLs; o card usa a primeira, o modal mostra todas
*/

const CATEGORIAS = [
  { slug: "barracas", nome: "Barracas e abrigos", rotulo: "Barracas" },
  { slug: "pesca", nome: "Pesca", rotulo: "Pesca" },
  { slug: "iluminacao", nome: "Iluminação", rotulo: "Iluminação" },
  { slug: "mochilas", nome: "Mochilas e bolsas", rotulo: "Mochilas" },
  { slug: "cozinha", nome: "Cozinha de camping", rotulo: "Cozinha" },
  { slug: "ferramentas", nome: "Facas e ferramentas", rotulo: "Ferramentas" },
];

/* Fotos de placeholder (Unsplash). São paisagens do universo outdoor,
   não fotos literais de cada produto. Para trocar uma foto, mude só o
   ID aqui; os produtos pegam daqui. Se um ID sair do ar, o app mostra
   uma imagem ilustrada no lugar. */
const FOTOS = {
  barracas: [
    "1504280390367-361c6d9f38f4",
    "1478131143081-80f7f84ca84d",
    "1537905569824-f89f14cceb68",
  ],
  pesca: [
    "1439066615861-d1af74d74000",
    "1501785888041-af3ef285b470",
    "1500375592092-40eb2168fd21",
  ],
  iluminacao: [
    "1419242902214-272b3f66ee7a",
    "1478131143081-80f7f84ca84d",
    "1475274047050-1d0c0975c63e",
  ],
  mochilas: [
    "1553062407-98eeb64c6a62",
    "1501555088652-021faa106b9b",
    "1464822759023-fed622ff2c3b",
  ],
  cozinha: [
    "1523987355523-c7b5b0dd90a7",
    "1470071459604-3b5ec3a7fe05",
    "1441974231531-c6227db76b6e",
  ],
  ferramentas: [
    "1441974231531-c6227db76b6e",
    "1469474968028-56623f02e42e",
    "1506905925346-21bda4d32df4",
  ],
};

const foto = (categoria, i) => {
  const lista = FOTOS[categoria];
  return `https://images.unsplash.com/photo-${lista[i % lista.length]}?auto=format&fit=crop&w=800&h=600&q=75`;
};

const PRODUTOS = [
  /* ---------- Barracas e abrigos ---------- */
  {
    id: "brc-001",
    nome: "Barraca Iglu 3 Pessoas Impermeável",
    categoria: "barracas",
    preco: 449.9,
    precoPromocional: 379.9,
    variacao: "3 pessoas · 3,8 kg",
    descricao:
      "Sobreteto com coluna d’água de 2000 mm e montagem em dois arcos de fibra.",
    detalhes: [
      "Coluna d’água: 2000 mm no sobreteto e 5000 mm no piso",
      "Duas entradas com mosquiteiro",
      "Montagem em cerca de 5 minutos",
      "Acompanha bolsa de transporte e kit de estacas",
    ],
    opcao: { rotulo: "Cor", valores: ["Verde musgo", "Cinza grafite"] },
    imagens: [
      "./img/barraca-iglu-3-pessoas-impermeável-verdemusgo.jpg",
      "./img/barraca-iglu-3-pessoas-impermeável-cinzagrafite.webp",
    ],
  },
  {
    id: "brc-002",
    nome: "Barraca Trilha Ultraleve 2 Pessoas",
    categoria: "barracas",
    preco: 689.0,
    precoPromocional: null,
    variacao: "2 pessoas · 2,1 kg",
    descricao:
      "Estrutura de alumínio e tecido ripstop. Cabe na lateral da mochila cargueira.",
    detalhes: [
      "Varetas de alumínio e tecido ripstop de 20D",
      "Dimensão fechada: 42 × 14 cm",
      "Abside lateral para guardar mochilas",
      "Fitas refletivas nos cabos de estaiamento",
    ],
    opcao: { rotulo: "Cor", valores: ["Verde oliva", "Laranja"] },
    imagens: ["./img/barraca-trilha-ultraleve-2-pessoas-laranja.webp","./img/barraca-trilha-ultraleve-2-pessoas-verdeoliva.webp"],
  },
  {
    id: "brc-003",
    nome: "Tarp Multiuso 3 x 3 m Ripstop",
    categoria: "barracas",
    preco: 129.9,
    precoPromocional: 99.9,
    variacao: "3 × 3 m · 480 g",
    descricao:
      "Cobertura rápida para chuva e sol, com ilhoses reforçados e cordas inclusas.",
    detalhes: [
      "Oito pontos de ancoragem com ilhoses de metal",
      "Poliéster com revestimento impermeável",
      "Fator de proteção solar UPF 50+",
      "Acompanha 4 cordas e 6 estacas",
    ],
    opcao: { rotulo: "Cor", valores: ["Verde", "Areia"] },
    imagens: ["./img/tarp-multiuso-3-x-3-m-ripstop-verde.webp","./img/tarp-multiuso-3-x-3-m-ripstop-areia.jpeg"],
  },

  /* ---------- Pesca ---------- */
  {
    id: "pes-001",
    nome: "Vara Telescópica Carbono 1,80 m",
    categoria: "pesca",
    preco: 219.9,
    precoPromocional: 189.9,
    variacao: "1,80 m · 230 g",
    descricao:
      "Ação rápida para tilápia e traíra. Recolhida, fica com 60 cm e cabe em qualquer mala.",
    detalhes: [
      "Blank em fibra de carbono, 5 seções telescópicas",
      "Capacidade de linha: 8 a 17 lb",
      "Cabo em EVA com porta-molinete de rosca",
      "Acompanha capa de transporte",
    ],
    opcao: { rotulo: "Ação", valores: ["Rápida", "Média"] },
    imagens: ["./img/vara-telescopica-carbono-1,80-m-rapida.webp","./img/vara-telescopica-carbono-1,80-m-media.webp", ],
  },
  {
    id: "pes-002",
    nome: "Molinete 3000 com 6 Rolamentos",
    categoria: "pesca",
    preco: 259.0,
    precoPromocional: null,
    variacao: "Tamanho 3000 · 290 g",
    descricao:
      "Corpo em alumínio, freio progressivo e recolhimento suave de 5,2:1.",
    detalhes: [
      "6 rolamentos de aço inox mais 1 anti-retorno",
      "Freio de arraste de até 8 kg",
      "Carretel de alumínio com recolhimento de 5,2:1",
      "Manivela reversível, acompanha carretel reserva",
    ],
    opcao: { rotulo: "Manivela", valores: ["Destro", "Canhoto"] },
    imagens: ["./img/molinete-3000-com-6-rolamentos.webp"],
  },
  {
    id: "pes-003",
    nome: "Kit de Iscas Artificiais 24 Peças",
    categoria: "pesca",
    preco: 89.9,
    precoPromocional: 69.9,
    variacao: "24 peças · 320 g",
    descricao:
      "Sapinhos, shads e meia-águas em cores variadas, organizados em maleta com divisórias.",
    detalhes: [
      "24 iscas entre sapinhos, shads e meia-águas",
      "Anzóis de aço carbono já montados",
      "Maleta com divisórias removíveis",
      "Indicado para água doce",
    ],
    opcao: { rotulo: "Cores", valores: ["Naturais", "Vibrantes"] },
    imagens: ["./img/isca-naturais.webp"],
  },

  /* ---------- Iluminação ---------- */
  {
    id: "ilu-001",
    nome: "Lanterna de Cabeça Recarregável 800 lm",
    categoria: "iluminacao",
    preco: 139.9,
    precoPromocional: 109.9,
    variacao: "800 lm · 95 g",
    descricao:
      "Três níveis de brilho, luz vermelha para o acampamento e bateria USB-C.",
    detalhes: [
      "Três níveis de brilho e modo estroboscópico",
      "Luz vermelha para não ofuscar o grupo",
      "Bateria de lítio com carga via USB-C",
      "Resistente a respingos (IPX4)",
    ],
    opcao: { rotulo: "Cor", valores: ["Preto", "Laranja"] },
    imagens: ["./img/lanterna-cabeça-preta.webp","./img/lanterna-cabeça-laranja.jpeg"],
  },
  {
    id: "ilu-002",
    nome: "Lampião LED Recarregável 360°",
    categoria: "iluminacao",
    preco: 169.0,
    precoPromocional: null,
    variacao: "600 lm · 410 g",
    descricao:
      "Ilumina a barraca inteira, tem gancho para pendurar e serve de carregador de celular.",
    detalhes: [
      "Luz de 360° com intensidade regulável",
      "Autonomia de até 20 horas no modo baixo",
      "Saída USB para carregar o celular",
      "Gancho retrátil e base antiderrapante",
    ],
    opcao: { rotulo: "Cor", valores: ["Preto", "Verde"] },
    imagens: ["./img/lampiao-preto.webp","./img/lampiao-verde.webp"]
  },
  {
    id: "ilu-003",
    nome: "Lanterna Tática Alumínio com Zoom",
    categoria: "iluminacao",
    preco: 119.9,
    precoPromocional: 94.9,
    variacao: "1000 lm · 210 g",
    descricao:
      "Foco ajustável de 50 a 300 m, resistente a respingos e com corpo antiderrapante.",
    detalhes: [
      "Corpo em alumínio aeronáutico anodizado",
      "Zoom ajustável de foco aberto a foco fechado",
      "Cinco modos de iluminação",
      "Acompanha bateria 18650, carregador USB e cordão",
    ],
    opcao: { rotulo: "Cor", valores: ["Preto", "Cinza"] },
    imagens: ["./img/lanterna-tatica.webp"],
  },

  /* ---------- Mochilas e bolsas ---------- */
  {
    id: "moc-001",
    nome: "Mochila Cargueira 60 L",
    categoria: "mochilas",
    preco: 389.9,
    precoPromocional: 329.9,
    variacao: "60 L · 1,9 kg",
    descricao:
      "Costas ventiladas, cinto lombar acolchoado e capa de chuva embutida.",
    detalhes: [
      "Sistema de costas ventilado e regulável",
      "Cinto lombar e peitoral acolchoados",
      "Capa de chuva embutida no fundo",
      "Entrada pela frente e compartimento inferior para o saco de dormir",
    ],
    opcao: { rotulo: "Cor", valores: ["Verde", "Preto"] },
    imagens: ["./img/mochila-preta.jpg","./img/mochila-verde.jpeg"],
  },
  {
    id: "moc-002",
    nome: "Bolsa Estanque 20 L",
    categoria: "mochilas",
    preco: 149.9,
    precoPromocional: null,
    variacao: "20 L · 380 g",
    descricao:
      "PVC com costura soldada e fecho roll-top. Mantém roupa e documentos secos no barco.",
    detalhes: [
      "PVC 500D com costuras soldadas a alta frequência",
      "Fecho roll-top: submersão momentânea sem entrada de água",
      "Alças de ombro destacáveis",
      "Flutua e não retém odores",
    ],
    opcao: { rotulo: "Cor", valores: ["Laranja", "Preto", "Amarelo"] },
    imagens: ["./img/bolsa-laranja.webp","./img/bolsa-preta.jpeg","./img/bolsa-amarela.jpg"]
  },
  {
    id: "moc-003",
    nome: "Mochila de Hidratação 12 L",
    categoria: "mochilas",
    preco: 199.9,
    precoPromocional: 169.9,
    variacao: "12 L · reservatório 2 L · 650 g",
    descricao:
      "Compacta para caminhadas curtas, com bolso frontal e mangueira com válvula de mordida.",
    detalhes: [
      "Reservatório de 2 L com abertura ampla para limpeza",
      "Mangueira isolada com válvula de mordida",
      "Bolso frontal elástico e bolsos laterais com zíper",
      "Costas em malha respirável",
    ],
    opcao: { rotulo: "Cor", valores: ["Preto", "Cinza"] },
    imagens: ["./img/mochila-hidra-preta.webp","./img/mochila-hidra-cinza.webp"],
  },

  /* ---------- Cozinha de camping ---------- */
  {
    id: "coz-001",
    nome: "Fogareiro Portátil a Gás Compacto",
    categoria: "cozinha",
    preco: 99.9,
    precoPromocional: 79.9,
    variacao: "180 g · acompanha estojo",
    descricao:
      "Encaixe direto em cartucho de gás, chama regulável e suportes dobráveis.",
    detalhes: [
      "Encaixe de rosca em cartuchos de gás butano/propano",
      "Chama regulável com acendimento manual",
      "Suportes dobráveis para panelas de até 18 cm",
      "Dobrado ocupa o espaço de uma lata de refrigerante",
    ],
    imagens: ["./img/fogareiro-port.webp"],
  },
  {
    id: "coz-002",
    nome: "Kit Panelas Camping Alumínio 7 Peças",
    categoria: "cozinha",
    preco: 189.9,
    precoPromocional: null,
    variacao: "7 peças · 1,1 kg",
    descricao:
      "Duas panelas, frigideira, tampa e talheres encaixados em uma só peça de transporte.",
    detalhes: [
      "Duas panelas, frigideira, tampa e dois talheres",
      "Alumínio anodizado com revestimento antiaderente",
      "Cabos dobráveis em silicone",
      "Todas as peças se encaixam na maior",
    ],
    imagens: ["./img/kit-panela.webp"],
  },
  {
    id: "coz-003",
    nome: "Garrafa Térmica Inox 1 L",
    categoria: "cozinha",
    preco: 149.0,
    precoPromocional: 119.0,
    variacao: "1 L · 520 g",
    descricao:
      "Parede dupla a vácuo: mantém bebida quente por 12 horas e gelada por 24.",
    detalhes: [
      "Inox 304 com parede dupla a vácuo",
      "Quente por 12 horas, gelada por 24",
      "Tampa que serve de copo",
      "Boca larga, aceita gelo em cubos",
    ],
    opcao: { rotulo: "Cor", valores: ["Inox", "Preto fosco"] },
    imagens: ["./img/garrafa-L-inox.jpg","./img/garrafa-L-preto.jpg"],
  },

  /* ---------- Facas e ferramentas ---------- */
  {
    id: "fer-001",
    nome: "Faca Tática Lâmina Fixa 10 cm",
    categoria: "ferramentas",
    preco: 159.9,
    precoPromocional: 129.9,
    variacao: "Lâmina 10 cm · 240 g",
    descricao:
      "Aço inox 7Cr17, cabo emborrachado e bainha de nylon com passador de cinto.",
    detalhes: [
      "Lâmina de aço inox 7Cr17 com espiga inteira",
      "Cabo emborrachado antiderrapante",
      "Bainha de nylon com passador de cinto",
      "Comprimento total de 21 cm",
    ],
    opcao: { rotulo: "Cabo", valores: ["Preto", "Verde"] },
    imagens: ["./img/faca-preta.jpg","./img/faca-verde.jpeg"],
  },
  {
    id: "fer-002",
    nome: "Machadinha de Acampamento",
    categoria: "ferramentas",
    preco: 179.9,
    precoPromocional: null,
    variacao: "Cabo 35 cm · 780 g",
    descricao:
      "Cabeça forjada em aço carbono para rachar lenha miúda, com capa de proteção.",
    detalhes: [
      "Cabeça forjada em aço carbono",
      "Cabo de fibra com revestimento de borracha",
      "Capa de couro sintético para a lâmina",
      "Ideal para lenha miúda e preparo do acampamento",
    ],
    imagens: ["./img/machadinha.jpg"],
  },
  {
    id: "fer-003",
    nome: "Canivete Multiuso 12 Funções",
    categoria: "ferramentas",
    preco: 119.9,
    precoPromocional: 89.9,
    variacao: "12 funções · 130 g",
    descricao:
      "Lâmina, serra, abridor, chave de fenda e alicate em um corpo de aço inox.",
    detalhes: [
      "Lâmina, serra, abridor de lata e garrafa",
      "Alicate, chaves de fenda e lima",
      "Corpo em aço inox com travas de segurança",
      "Acompanha estojo de nylon",
    ],
    opcao: { rotulo: "Cor", valores: ["Prata", "Preto"] },
    imagens: ["./img/canivete-prata.jpg","./img/canivete-preto.avif"],
  },
];
