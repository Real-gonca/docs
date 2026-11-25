/**
 * Línguas de Angola - Dados demonstrativos do protótipo
 *
 * AVISO: Todas as traduções abaixo são dados de demonstração para o protótipo.
 * Não devem ser consideradas traduções validadas por falantes nativos ou linguistas.
 * Em produção, o conteúdo deve ser revisto e validado por especialistas.
 */

const LANGUAGES = [
  {
    id: 'umbundu',
    name: 'Umbundu',
    alt: 'Umbungo',
    code: 'umb',
    region: 'Centro e Sul (Huambo, Benguela, Bié)',
    description: 'Uma das línguas nacionais mais faladas de Angola, com forte presença nas províncias do centro e sul.',
    color: '#CE1126'
  },
  {
    id: 'kimbundu',
    name: 'Kimbundu',
    alt: '',
    code: 'kmb',
    region: 'Luanda, Bengo, Malanje, Cuanza Norte',
    description: 'Língua nacional com grande relevância histórica e cultural, amplamente associada à região de Luanda e arredores.',
    color: '#1A1A1A'
  },
  {
    id: 'cokwe',
    name: 'Côkwe',
    alt: 'Cowke',
    code: 'cjk',
    region: 'Lunda Norte, Lunda Sul, Moxico',
    description: 'Língua nacional do leste de Angola, com rica tradição oral e cultural.',
    color: '#F7D117'
  },
  {
    id: 'kikongo',
    name: 'Kikongo',
    alt: 'Kinkongo',
    code: 'kon',
    region: 'Uíge, Zaire, Cabinda',
    description: 'Língua nacional falada no norte de Angola, com ligações históricas transfronteiriças.',
    color: '#0033A0'
  }
];

const TARGET_LANGUAGES = [
  { id: 'pt', name: 'Português', flag: '🇵🇹', note: 'Idioma oficial de Angola' },
  { id: 'en', name: 'Inglês', flag: '🇬🇧', note: 'Idioma internacional' }
];

const CATEGORIES = [
  { id: 'educacao', name: 'Educação', icon: '📚' },
  { id: 'saude', name: 'Saúde', icon: '🏥' },
  { id: 'agricultura', name: 'Agricultura', icon: '🌱' },
  { id: 'comercio', name: 'Comércio', icon: '🛒' },
  { id: 'construcao', name: 'Construção civil', icon: '🏗️' },
  { id: 'transportes', name: 'Transportes', icon: '🚌' },
  { id: 'hotelaria', name: 'Hotelaria e turismo', icon: '🏨' },
  { id: 'justica', name: 'Justiça', icon: '⚖️' },
  { id: 'administracao', name: 'Administração pública', icon: '🏛️' },
  { id: 'tecnologia', name: 'Tecnologia', icon: '💻' },
  { id: 'financas', name: 'Finanças', icon: '💰' },
  { id: 'comunicacao', name: 'Comunicação social', icon: '📢' },
  { id: 'seguranca', name: 'Segurança no trabalho', icon: '🦺' },
  { id: 'comunitarias', name: 'Organizações comunitárias', icon: '🤝' },
  { id: 'igrejas', name: 'Igrejas', icon: '⛪' },
  { id: 'humanitario', name: 'Trabalho humanitário', icon: '❤️' }
];

const PHRASE_CATEGORIES = [
  { id: 'cumprimentos', name: 'Cumprimentos', icon: '👋' },
  { id: 'emergencias', name: 'Emergências', icon: '🚨' },
  { id: 'consultas', name: 'Consultas médicas', icon: '🩺' },
  { id: 'atendimento', name: 'Atendimento ao cliente', icon: '💬' },
  { id: 'entrevistas', name: 'Entrevistas de emprego', icon: '💼' },
  { id: 'seguranca-trabalho', name: 'Segurança no trabalho', icon: '🦺' },
  { id: 'comercio-pagamentos', name: 'Comércio e pagamentos', icon: '💳' },
  { id: 'viagens', name: 'Viagens', icon: '✈️' },
  { id: 'escola', name: 'Escola e universidade', icon: '🎓' },
  { id: 'agricultura-frases', name: 'Agricultura', icon: '🌾' },
  { id: 'servicos-publicos', name: 'Serviços públicos', icon: '🏢' }
];

// Dicionário demonstrativo - conteúdo de protótipo, não validado
const DICTIONARY = [
  {
    id: 'd1', sourceLang: 'kimbundu', word: '[Palavra demonstrativa]',
    pt: '[Tradução em Português]', en: '[English translation]',
    example: 'Exemplo demonstrativo de utilização numa frase.',
    pronunciation: null, category: 'cumprimentos', region: 'Luanda',
    validated: false, confidence: 'low'
  },
  {
    id: 'd2', sourceLang: 'umbundu', word: '[Palavra demonstrativa]',
    pt: '[Tradução em Português]', en: '[English translation]',
    example: 'Exemplo demonstrativo de utilização numa frase.',
    pronunciation: null, category: 'educacao', region: 'Huambo',
    validated: false, confidence: 'low'
  },
  {
    id: 'd3', sourceLang: 'kikongo', word: '[Palavra demonstrativa]',
    pt: '[Tradução em Português]', en: '[English translation]',
    example: 'Exemplo demonstrativo de utilização numa frase.',
    pronunciation: null, category: 'saude', region: 'Uíge',
    validated: false, confidence: 'low'
  },
  {
    id: 'd4', sourceLang: 'cokwe', word: '[Palavra demonstrativa]',
    pt: '[Tradução em Português]', en: '[English translation]',
    example: 'Exemplo demonstrativo de utilização numa frase.',
    pronunciation: null, category: 'comercio', region: 'Lunda Norte',
    validated: false, confidence: 'low'
  },
  {
    id: 'd5', sourceLang: 'kimbundu', word: '[Saudação demonstrativa]',
    pt: '[Bom dia / Saudação]', en: '[Good morning / Greeting]',
    example: 'Utilizado ao cumprimentar alguém pela manhã.',
    pronunciation: null, category: 'cumprimentos', region: 'Luanda',
    validated: false, confidence: 'low'
  },
  {
    id: 'd6', sourceLang: 'umbundu', word: '[Termo de saúde]',
    pt: '[Dor / Sintoma]', en: '[Pain / Symptom]',
    example: 'Utilizado para descrever um sintoma numa consulta.',
    pronunciation: null, category: 'saude', region: 'Benguela',
    validated: false, confidence: 'low'
  },
  {
    id: 'd7', sourceLang: 'kikongo', word: '[Termo agrícola]',
    pt: '[Semente / Plantação]', en: '[Seed / Crop]',
    example: 'Utilizado no contexto de agricultura familiar.',
    pronunciation: null, category: 'agricultura', region: 'Zaire',
    validated: false, confidence: 'low'
  },
  {
    id: 'd8', sourceLang: 'cokwe', word: '[Termo comercial]',
    pt: '[Preço / Valor]', en: '[Price / Value]',
    example: 'Utilizado numa negociação no mercado.',
    pronunciation: null, category: 'comercio', region: 'Moxico',
    validated: false, confidence: 'low'
  }
];

// Frases úteis demonstrativas - protótipo, não validado
const PHRASES = [
  { id: 'p1', category: 'cumprimentos', sourceLang: 'kimbundu', original: '[Saudação em Kimbundu]', pt: '[Olá, como está?]', en: '[Hello, how are you?]', validated: false },
  { id: 'p2', category: 'cumprimentos', sourceLang: 'umbundu', original: '[Saudação em Umbundu]', pt: '[Bom dia!]', en: '[Good morning!]', validated: false },
  { id: 'p3', category: 'emergencias', sourceLang: 'kikongo', original: '[Frase de emergência em Kikongo]', pt: '[Preciso de ajuda, por favor.]', en: '[I need help, please.]', validated: false },
  { id: 'p4', category: 'emergencias', sourceLang: 'cokwe', original: '[Frase de emergência em Côkwe]', pt: '[Chame uma ambulância.]', en: '[Call an ambulance.]', validated: false },
  { id: 'p5', category: 'consultas', sourceLang: 'kimbundu', original: '[Frase médica em Kimbundu]', pt: '[Estou com dor aqui.]', en: '[I have pain here.]', validated: false },
  { id: 'p6', category: 'atendimento', sourceLang: 'umbundu', original: '[Frase de atendimento em Umbundu]', pt: '[Como posso ajudá-lo?]', en: '[How can I help you?]', validated: false },
  { id: 'p7', category: 'entrevistas', sourceLang: 'kikongo', original: '[Frase de entrevista em Kikongo]', pt: '[Tenho experiência nesta área.]', en: '[I have experience in this area.]', validated: false },
  { id: 'p8', category: 'seguranca-trabalho', sourceLang: 'cokwe', original: '[Frase de segurança em Côkwe]', pt: '[Use o equipamento de proteção.]', en: '[Use protective equipment.]', validated: false },
  { id: 'p9', category: 'comercio-pagamentos', sourceLang: 'kimbundu', original: '[Frase de comércio em Kimbundu]', pt: '[Quanto custa este produto?]', en: '[How much does this product cost?]', validated: false },
  { id: 'p10', category: 'viagens', sourceLang: 'umbundu', original: '[Frase de viagem em Umbundu]', pt: '[Onde fica a paragem de autocarro?]', en: '[Where is the bus stop?]', validated: false },
  { id: 'p11', category: 'escola', sourceLang: 'kikongo', original: '[Frase escolar em Kikongo]', pt: '[O aluno precisa de apoio.]', en: '[The student needs support.]', validated: false },
  { id: 'p12', category: 'agricultura-frases', sourceLang: 'cokwe', original: '[Frase agrícola em Côkwe]', pt: '[A colheita começa esta semana.]', en: '[The harvest starts this week.]', validated: false },
  { id: 'p13', category: 'servicos-publicos', sourceLang: 'kimbundu', original: '[Frase de serviço público em Kimbundu]', pt: '[Preciso de informações sobre este documento.]', en: '[I need information about this document.]', validated: false },
  { id: 'p14', category: 'consultas', sourceLang: 'umbundu', original: '[Frase médica em Umbundu]', pt: '[Tem alergia a algum medicamento?]', en: '[Are you allergic to any medication?]', validated: false },
  { id: 'p15', category: 'atendimento', sourceLang: 'cokwe', original: '[Frase de atendimento em Côkwe]', pt: '[Obrigado pela sua paciência.]', en: '[Thank you for your patience.]', validated: false },
  { id: 'p16', category: 'comercio-pagamentos', sourceLang: 'kikongo', original: '[Frase de pagamento em Kikongo]', pt: '[Posso pagar em dinheiro?]', en: '[Can I pay in cash?]', validated: false }
];
