export type DepartmentId =
  | "reception"
  | "hr"
  | "operations"
  | "procurement"
  | "director"
  | "projects"
  | "meeting";

export type Department = {
  id: DepartmentId;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  actions: string[];
  npcName: string;
  npcRole: string;
  greeting: string;
  position: [number, number, number];
  size: [number, number, number];
  npcPosition: [number, number, number];
};

export const departments: Department[] = [
  {
    id: "reception",
    label: "Receção",
    eyebrow: "Bem-vindo",
    title: "Bem-vindo ao The Office.",
    body: "Este não é um website normal. Caminhe pelo escritório, conheça os departamentos e descubra a empresa através de conversas.",
    actions: ["Iniciar visita", "Como funciona?"],
    npcName: "Mia",
    npcRole: "Receção",
    greeting: "Olá! Bem-vindo ao The Office. Para onde gostaria de ir?",
    position: [0, 0, 2.3],
    size: [5.2, 0, 3.6],
    npcPosition: [0, 0, 1.6],
  },
  {
    id: "hr",
    label: "Recursos Humanos",
    eyebrow: "Carreiras",
    title: "À procura da próxima oportunidade?",
    body: "Conheça a equipa de Recursos Humanos, descubra a cultura da empresa e submeta o seu CV mesmo quando não existem vagas abertas.",
    actions: ["Submeter CV", "Vida na empresa"],
    npcName: "Sara",
    npcRole: "Pessoas & Cultura",
    greeting: "Olá. Está à procura de uma oportunidade ou gostaria de deixar o seu CV connosco?",
    position: [-5.2, 0, -2.3],
    size: [5.4, 0, 4.2],
    npcPosition: [-4.2, 0, -1.8],
  },
  {
    id: "procurement",
    label: "Procurement",
    eyebrow: "Aquisições",
    title: "O que procura?",
    body: "Solicite produtos, apoio de procurement ou inicie uma conversa como fornecedor dentro do nosso espaço de aquisições.",
    actions: ["Solicitar produto", "Tornar-se fornecedor"],
    npcName: "Joel",
    npcRole: "Procurement",
    greeting: "Bem-vindo ao Procurement. Diga-nos o que precisa e ajudaremos a encontrar a solução certa.",
    position: [5.2, 0, -2.3],
    size: [5.4, 0, 4.2],
    npcPosition: [4.2, 0, -1.8],
  },
  {
    id: "operations",
    label: "Operações",
    eyebrow: "Serviços",
    title: "Onde a logística se transforma em movimento.",
    body: "Explore transporte, armazenagem, desalfandegamento e distribuição a partir de uma sala de controlo visual.",
    actions: ["Explorar serviços", "Ver rotas"],
    npcName: "David",
    npcRole: "Operações",
    greeting: "Esta é a área de Operações. É daqui que coordenamos cargas, rotas e entregas.",
    position: [-5.2, 0, -7.4],
    size: [5.4, 0, 4.2],
    npcPosition: [-4.2, 0, -6.8],
  },
  {
    id: "director",
    label: "Gabinete da Direção",
    eyebrow: "Sobre nós",
    title: "Conheça a história por detrás da empresa.",
    body: "Entre no gabinete da Direção para conhecer a empresa, a sua visão, os seus valores e as pessoas que a constroem.",
    actions: ["A nossa história", "A nossa visão"],
    npcName: "Daniel",
    npcRole: "Diretor Geral",
    greeting: "Bem-vindo. Este gabinete conta a história de por que existimos e para onde queremos ir.",
    position: [5.2, 0, -7.4],
    size: [5.4, 0, 4.2],
    npcPosition: [4.2, 0, -6.8],
  },
  {
    id: "projects",
    label: "Sala de Projetos",
    eyebrow: "Portfólio",
    title: "Veja o trabalho, não apenas a promessa.",
    body: "A Sala de Projetos transforma casos reais em exposições. Cada projeto apresenta o desafio, a abordagem, a execução e o resultado.",
    actions: ["Ver projetos", "Como trabalhamos"],
    npcName: "Amara",
    npcRole: "Gestora de Projetos",
    greeting: "Este é o nosso arquivo de projetos. Escolha um caso e eu mostro-lhe o que foi feito, como funcionou e que impacto teve.",
    position: [-5.2, 0, -12.5],
    size: [5.4, 0, 4.2],
    npcPosition: [-4.2, 0, -11.9],
  },
  {
    id: "meeting",
    label: "Sala de Reuniões",
    eyebrow: "Contacto",
    title: "Pronto para conversar?",
    body: "A Sala de Reuniões é o ponto final da visita: um espaço para iniciar uma conversa, solicitar uma reunião ou deixar um briefing.",
    actions: ["Iniciar conversa", "Marcar reunião"],
    npcName: "Noah",
    npcRole: "Relação com Clientes",
    greeting: "Ainda bem que chegou até aqui. Conte-me o que pretende desenvolver e podemos continuar a conversa.",
    position: [5.2, 0, -12.5],
    size: [5.4, 0, 4.2],
    npcPosition: [4.2, 0, -11.9],
  },
];
