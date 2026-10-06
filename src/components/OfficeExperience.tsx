"use client";

import { FormEvent, useEffect, useState } from "react";
import OfficeScene from "./OfficeScene";
import { Department, departments } from "./officeData";

type Panel =
  | null
  | "cv"
  | "culture"
  | "procurement"
  | "supplier"
  | "services"
  | "routes"
  | "story"
  | "vision"
  | "tour"
  | "help"
  | "projects"
  | "projectMethod"
  | "contact"
  | "meeting";

function dispatchMove(key: string, pressed: boolean) {
  window.dispatchEvent(new KeyboardEvent(pressed ? "keydown" : "keyup", { key }));
}

type ProjectCase = {
  title: string;
  category: string;
  challenge: string;
  solution: string;
  process: string[];
  result: string;
  services: string[];
};

const projectCases: ProjectCase[] = [
  {
    title: "Otimização de distribuição",
    category: "Distribuição",
    challenge: "Uma operação com múltiplos pontos de entrega precisa de reduzir atrasos, melhorar a visibilidade das rotas e organizar melhor cada passagem de responsabilidade.",
    solution: "Estruturar um fluxo central de planeamento, acompanhamento e confirmação de entregas, com informação operacional reunida num único ponto.",
    process: ["Mapeamento da operação", "Definição de rotas", "Pontos de controlo", "Acompanhamento", "Revisão de desempenho"],
    result: "Caso demonstrativo de como o portfólio pode explicar claramente o problema, a intervenção e o resultado esperado de uma operação logística.",
    services: ["Transporte rodoviário", "Planeamento de rotas", "Distribuição final"],
  },
  {
    title: "Operação de carga regional",
    category: "Transporte regional",
    challenge: "Coordenar uma carga entre mercados diferentes exige documentação, controlo de prazos e comunicação consistente entre várias equipas.",
    solution: "Criar uma operação coordenada com responsabilidades definidas, acompanhamento por etapas e visibilidade sobre o estado da carga.",
    process: ["Preparação documental", "Coordenação de transporte", "Fronteira e trânsito", "Entrega", "Fecho da operação"],
    result: "Caso demonstrativo para apresentar como uma operação regional pode ser contada de forma visual e compreensível dentro do The Office.",
    services: ["Frete regional", "Coordenação operacional", "Desalfandegamento"],
  },
  {
    title: "Solução de armazenagem",
    category: "Armazém",
    challenge: "Uma operação de armazenagem precisa de melhorar organização, localização de mercadoria e preparação de pedidos sem aumentar a complexidade para a equipa.",
    solution: "Organizar zonas, fluxos de entrada e saída e pontos de controlo para tornar a movimentação de stock mais previsível.",
    process: ["Receção", "Classificação", "Armazenagem", "Picking", "Expedição"],
    result: "Caso demonstrativo focado em mostrar processos de armazém como uma sequência clara de decisões e movimentos.",
    services: ["Armazenagem", "Gestão de stock", "Preparação de pedidos"],
  },
  {
    title: "Projeto de procurement",
    category: "Aquisições",
    challenge: "Encontrar materiais adequados dentro de prazo exige fornecedores confiáveis, especificações claras e acompanhamento da compra até à entrega.",
    solution: "Centralizar o pedido, comparar opções e acompanhar o fornecimento desde a necessidade inicial até à receção do material.",
    process: ["Briefing", "Pesquisa de fornecedores", "Comparação", "Compra", "Entrega"],
    result: "Caso demonstrativo de como o The Office pode apresentar procurement como um serviço completo e não apenas como uma lista de fornecedores.",
    services: ["Sourcing", "Gestão de fornecedores", "Aquisições"],
  },
];

const panelCopy: Record<
  Exclude<Panel, null | "cv" | "procurement" | "supplier">,
  { eyebrow: string; title: string; body: string; items?: string[] }
> = {
  culture: {
    eyebrow: "Pessoas & Cultura",
    title: "A vida dentro do The Office.",
    body: "Uma boa empresa de logística é construída por pessoas que comunicam com clareza, resolvem problemas rapidamente e assumem responsabilidade em cada etapa.",
    items: ["Aprendizagem e crescimento", "Segurança em primeiro lugar", "Responsabilidade da equipa", "Foco no cliente"],
  },
  services: {
    eyebrow: "Operações",
    title: "Mover carga de A para B é apenas o começo.",
    body: "A área de Operações representa os serviços que mantêm a carga visível, controlada e em movimento.",
    items: ["Transporte rodoviário", "Transporte marítimo", "Transporte aéreo", "Desalfandegamento", "Armazenagem", "Distribuição final"],
  },
  routes: {
    eyebrow: "Operações",
    title: "Uma sala. Muitas rotas.",
    body: "Este protótipo usa a metáfora de uma sala de controlo. Numa versão final, os ecrãs podem transformar-se num mapa interativo com escritórios, corredores logísticos e rotas reais.",
    items: ["Maputo", "Nacala", "Beira", "Joanesburgo", "Corredores regionais"],
  },
  story: {
    eyebrow: "Gabinete da Direção",
    title: "Construído à volta de movimento e confiança.",
    body: "The Office é um conceito de portfólio para uma empresa de logística: em vez de explicar a empresa através de páginas estáticas, o visitante conhece-a como um lugar, sala por sala.",
    items: ["História da empresa", "Capacidades", "Projetos", "Equipa", "Contacto"],
  },
  vision: {
    eyebrow: "Gabinete da Direção",
    title: "Fazer o website sentir-se como a própria empresa.",
    body: "A visão é criar um escritório 3D explorável onde cada departamento se transforma num serviço digital real: carreiras, procurement, projetos, reuniões e operações logísticas.",
    items: ["Imersivo", "Útil", "Rápido", "Humano", "Memorável"],
  },
  tour: {
    eyebrow: "Receção",
    title: "Escolha por onde começar.",
    body: "Pode caminhar normalmente com WASD ou usar o diretório para perceber o que cada sala representa.",
    items: departments.map((department) => `${department.label} — ${department.eyebrow}`),
  },
  help: {
    eyebrow: "Receção",
    title: "Como funciona o The Office.",
    body: "Aproxime-se de um membro da equipa. Quando surgir a indicação, pressione E ou clique na pessoa. Cada conversa substitui uma secção tradicional de website.",
    items: ["WASD / setas para mover", "E para conversar", "Clique numa pessoa no computador", "Controlos direcionais no telemóvel"],
  },
  projects: {
    eyebrow: "Sala de Projetos",
    title: "Os projetos selecionados vivem aqui.",
    body: "Cada caso transforma-se numa exposição dentro da sala, combinando contexto, processo, execução e resultados.",
    items: ["Caso 01 — Otimização de distribuição", "Caso 02 — Operação de carga regional", "Caso 03 — Solução de armazenagem", "Caso 04 — Projeto de procurement"],
  },
  projectMethod: {
    eyebrow: "Sala de Projetos",
    title: "Do briefing ao resultado.",
    body: "A sala mostra não apenas o resultado final, mas também como as decisões foram tomadas, que limitações existiam e o que mudou depois da entrega.",
    items: ["Contexto", "Desafio", "Abordagem", "Execução", "Resultado"],
  },
  contact: {
    eyebrow: "Sala de Reuniões",
    title: "Inicie uma conversa.",
    body: "A Sala de Reuniões funciona como a área de contacto do portfólio. A versão final poderá ligar este fluxo ao email, CRM ou Supabase.",
    items: ["Novo projeto", "Parceria", "Pedido de informação", "Colaboração"],
  },
  meeting: {
    eyebrow: "Sala de Reuniões",
    title: "Marque uma reunião dentro do The Office.",
    body: "Este espaço pode tornar-se num fluxo simples de agendamento, onde o visitante escolhe o objetivo, a data preferida e os dados de contacto sem sair da experiência.",
    items: ["Reunião inicial", "Revisão de projeto", "Reunião de parceria", "Apresentação do portfólio"],
  },
};

export default function OfficeExperience() {
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [nearby, setNearby] = useState<Department | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [submitted, setSubmitted] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState<Department | null>(null);
  const [visited, setVisited] = useState<Department["id"][]>([]);
  const [entering, setEntering] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [unlockedDepartments, setUnlockedDepartments] = useState<Department["id"][]>([]);
  const [restrictedDepartment, setRestrictedDepartment] = useState<Department | null>(null);
  const [accessError, setAccessError] = useState("");
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessGrantedDepartment, setAccessGrantedDepartment] =
    useState<Department["id"] | null>(null);
  const [receptionCleared, setReceptionCleared] = useState(false);
  const [miaStep, setMiaStep] = useState<0 | 1 | 2>(0);

  const requestRestrictedAccess = (department: Department) => {
    setAccessError("");
    setRestrictedDepartment(department);
    setSelected(null);
  };

  const handleSelect = (department: Department) => {
    if (!receptionCleared && department.id !== "reception") return;

    if (
      department.requiresCredentials &&
      !unlockedDepartments.includes(department.id)
    ) {
      requestRestrictedAccess(department);
      return;
    }

    setSelected(department);
    if (department.id === "reception") setMiaStep(0);
    setVisited((current) =>
      current.includes(department.id) ? current : [...current, department.id],
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (restrictedDepartment) {
        setRestrictedDepartment(null);
        setAccessError("");
        return;
      }

      if (selectedProject !== null) {
        setSelectedProject(null);
        return;
      }

      if (panel) {
        setPanel(null);
        setSubmitted(false);
        return;
      }

      if (directoryOpen) {
        setDirectoryOpen(false);
        return;
      }

      if (selected) setSelected(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panel, directoryOpen, selected, selectedProject, restrictedDepartment]);

  const enterOffice = () => {
    if (entering) return;
    setEntering(true);
    window.setTimeout(() => setEntered(true), 620);
  };

  const submitDoorCredentials = async (
    department: Department,
    email: string,
    password: string,
  ) => {
    if (accessLoading) return;

    setAccessError("");
    setAccessLoading(true);

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          departmentId: department.id,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        setAccessError(result.message || "Não foi possível validar as credenciais.");
        return;
      }

      setAccessGrantedDepartment(department.id);
      setAccessError("");

      window.setTimeout(() => {
        setUnlockedDepartments((current) =>
          current.includes(department.id)
            ? current
            : [...current, department.id],
        );
        setRestrictedDepartment(null);
        setAccessGrantedDepartment(null);
      }, 850);
    } catch {
      setAccessError("Erro de ligação. Tente novamente.");
    } finally {
      setAccessLoading(false);
    }
  };

  const openPanel = (next: Panel) => {
    setSubmitted(false);
    setPanel(next);
  };

  const handleAction = (action: string) => {
    const actions: Record<string, Panel> = {
      "Submeter CV": "cv",
      "Vida na empresa": "culture",
      "Solicitar produto": "procurement",
      "Tornar-se fornecedor": "supplier",
      "Explorar serviços": "services",
      "Ver rotas": "routes",
      "A nossa história": "story",
      "A nossa visão": "vision",
      "Iniciar visita": "tour",
      "Como funciona?": "help",
      "Ver projetos": "projects",
      "Como trabalhamos": "projectMethod",
      "Iniciar conversa": "contact",
      "Marcar reunião": "meeting",
    };

    openPanel(actions[action] ?? null);
  };

  const submitDemo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const closePanel = () => {
    setPanel(null);
    setSubmitted(false);
    setSelectedProject(null);
  };

  const infoPanel =
    panel && panel !== "cv" && panel !== "procurement" && panel !== "supplier"
      ? panelCopy[panel]
      : null;

  return (
    <main className="experience-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Página inicial do The Office">
          THE OFFICE
        </a>
        <div className="topbar-meta">
          <span>Portfólio interativo</span>
          <span className="status-dot">Escritório aberto</span>
        </div>
      </header>

      <section className="scene-shell" aria-label="Escritório 3D interativo">
        <OfficeScene
          onSelect={handleSelect}
          onNearby={setNearby}
          onAreaChange={setCurrentArea}
          activeDepartmentId={selected?.id ?? null}
          unlockedDepartments={unlockedDepartments}
          onRestrictedAttempt={requestRestrictedAccess}
          restrictedDepartmentId={restrictedDepartment?.id ?? null}
          accessError={accessError}
          accessLoading={accessLoading}
          accessGrantedDepartmentId={accessGrantedDepartment}
          onSubmitCredentials={submitDoorCredentials}
          onCloseAccess={() => {
            setRestrictedDepartment(null);
            setAccessError("");
          }}
          receptionCleared={receptionCleared}
        />

        <div className="area-indicator">
          <span>Está em</span>
          <strong>{currentArea?.label ?? "Corredor principal"}</strong>
        </div>

        {entered && receptionCleared && (
          <aside className="mini-map" aria-label="Mini-mapa do escritório">
            <div className="mini-map-head">
              <span>Mapa do escritório</span>
              <strong>{visited.length}/{departments.length}</strong>
            </div>
            <div className="mini-map-grid">
              {departments.map((department) => (
                <button
                  key={department.id}
                  type="button"
                  className={[
                    "mini-room",
                    `mini-room--${department.id}`,
                    visited.includes(department.id) ? "is-visited" : "",
                    currentArea?.id === department.id ? "is-current" : "",
                    department.requiresCredentials &&
                    !unlockedDepartments.includes(department.id)
                      ? "is-locked"
                      : "",
                  ].filter(Boolean).join(" ")}
                  title={department.label}
                  aria-label={department.label}
                  onClick={() => handleSelect(department)}
                >
                  <span>{department.label}</span>
                </button>
              ))}
              <div className="mini-corridor" aria-hidden="true" />
              <div className="mini-you" aria-hidden="true">VOCÊ</div>
            </div>
          </aside>
        )}

        {receptionCleared && (
        <button
          className="directory-toggle"
          type="button"
          onClick={() => setDirectoryOpen((open) => !open)}
        >
          Diretório
          <span>{directoryOpen ? "×" : "+"}</span>
        </button>
        )}

        {receptionCleared && directoryOpen && (
          <nav className="directory-panel" aria-label="Diretório do escritório">
            <span className="eyebrow">Navegação rápida</span>
            {departments.map((department, index) => (
              <button
                key={department.id}
                type="button"
                className={
                  department.requiresCredentials &&
                  !unlockedDepartments.includes(department.id)
                    ? "is-locked"
                    : ""
                }
                onClick={() => {
                  handleSelect(department);
                  setDirectoryOpen(false);
                }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{department.label}</strong>
                <em>{department.eyebrow}</em>
              </button>
            ))}
          </nav>
        )}

        <div className="controls">
          <span>MOVER</span>
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          <span className="controls-separator">Clique no chão para caminhar · clique numa pessoa para falar</span>
        </div>

        <div className="mobile-dpad" aria-label="Controlos de movimento">
          <button
            type="button"
            onPointerDown={() => dispatchMove("w", true)}
            onPointerUp={() => dispatchMove("w", false)}
            onPointerLeave={() => dispatchMove("w", false)}
          >
            ↑
          </button>
          <div>
            <button
              type="button"
              onPointerDown={() => dispatchMove("a", true)}
              onPointerUp={() => dispatchMove("a", false)}
              onPointerLeave={() => dispatchMove("a", false)}
            >
              ←
            </button>
            <button
              type="button"
              onPointerDown={() => dispatchMove("s", true)}
              onPointerUp={() => dispatchMove("s", false)}
              onPointerLeave={() => dispatchMove("s", false)}
            >
              ↓
            </button>
            <button
              type="button"
              onPointerDown={() => dispatchMove("d", true)}
              onPointerUp={() => dispatchMove("d", false)}
              onPointerLeave={() => dispatchMove("d", false)}
            >
              →
            </button>
          </div>
        </div>

        {entered && (
          <div className="objective-card">
            <span>Objetivo atual</span>
            <strong>
              {!receptionCleared
                ? "Fale com a Mia na Receção"
                : visited.length < departments.length
                  ? `Explore o escritório · ${visited.length}/${departments.length}`
                  : "Visita ao escritório concluída"}
            </strong>
          </div>
        )}

        {nearby && !selected && (
          <button className="talk-prompt" type="button" onClick={() => handleSelect(nearby)}>
            <span className="talk-key">E</span>
            Falar com {nearby.npcName}
          </button>
        )}

        {selected?.id === "reception" && !receptionCleared ? (
          <aside className="mia-chat">
            <div className="mia-chat-head">
              <div>
                <strong>Mia</strong>
                <span>Receção</span>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Fechar conversa">
                ×
              </button>
            </div>

            <div className="mia-chat-body">
              <div className="chat-message chat-message--mia">
                <span>Mia</span>
                <p>Olá 👋 Bem-vindo ao The Office.</p>
              </div>

              {miaStep >= 1 && (
                <div className="chat-message chat-message--mia">
                  <span>Mia</span>
                  <p>Antes de continuar, diga-me: o que o trouxe até aqui hoje?</p>
                </div>
              )}

              {miaStep === 2 && (
                <>
                  <div className="chat-message chat-message--visitor">
                    <span>Você</span>
                    <p>Quero conhecer melhor a empresa e explorar o escritório.</p>
                  </div>
                  <div className="chat-message chat-message--mia">
                    <span>Mia</span>
                    <p>Perfeito. Pode avançar. Algumas áreas são restritas e podem pedir credenciais.</p>
                  </div>
                </>
              )}
            </div>

            <div className="mia-chat-actions">
              {miaStep === 0 && (
                <button type="button" onClick={() => setMiaStep(1)}>
                  Olá, Mia. <span>→</span>
                </button>
              )}

              {miaStep === 1 && (
                <>
                  <button type="button" onClick={() => setMiaStep(2)}>
                    Quero conhecer a empresa <span>→</span>
                  </button>
                  <button type="button" onClick={() => setMiaStep(2)}>
                    Vim conhecer os serviços <span>→</span>
                  </button>
                  <button type="button" onClick={() => setMiaStep(2)}>
                    Estou à procura de oportunidades <span>→</span>
                  </button>
                </>
              )}

              {miaStep === 2 && (
                <button
                  className="mia-chat-continue"
                  type="button"
                  onClick={() => {
                    setReceptionCleared(true);
                    setSelected(null);
                    setVisited((current) =>
                      current.includes("reception") ? current : ["reception", ...current],
                    );
                  }}
                >
                  Continuar para o escritório <span>→</span>
                </button>
              )}
            </div>
          </aside>
        ) : selected ? (
          <aside className="department-card">
            <div className="dialogue-head">
              <span>
                {selected.npcName} · {selected.npcRole}
              </span>
              <button type="button" aria-label="Fechar conversa" onClick={() => setSelected(null)}>
                <span aria-hidden="true">×</span>
                <small>ESC</small>
              </button>
            </div>
            <span className="eyebrow">{selected.eyebrow}</span>
            <p className="npc-greeting">“{selected.greeting}”</p>
            <h2>{selected.title}</h2>
            <p>{selected.body}</p>
            <div className="department-actions">
              {selected.actions.map((action) => (
                <button key={action} type="button" onClick={() => handleAction(action)}>
                  {action}
                  <span>↗</span>
                </button>
              ))}
            </div>
          </aside>
        ) : null}
      </section>

      {panel && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="form-panel">
            {infoPanel ? (
              <>
                <div className="form-panel-head">
                  <div>
                    <span className="eyebrow">{infoPanel.eyebrow}</span>
                    <h2>{infoPanel.title}</h2>
                  </div>
                  <button type="button" aria-label="Fechar painel" onClick={closePanel}>
                    ×
                  </button>
                </div>
                <div className="info-panel-body">
                  <p>{infoPanel.body}</p>
                  {panel === "projects" && selectedProject !== null ? (
                    <article className="case-study">
                      <button
                        className="case-study-back"
                        type="button"
                        onClick={() => setSelectedProject(null)}
                      >
                        ← Voltar aos projetos
                      </button>
                      <div className="case-study-hero">
                        <span>CASO 0{selectedProject + 1}</span>
                        <small>{projectCases[selectedProject].category}</small>
                        <h3>{projectCases[selectedProject].title}</h3>
                      </div>
                      <div className="case-study-section">
                        <span>01 — Desafio</span>
                        <p>{projectCases[selectedProject].challenge}</p>
                      </div>
                      <div className="case-study-section">
                        <span>02 — Solução</span>
                        <p>{projectCases[selectedProject].solution}</p>
                      </div>
                      <div className="case-study-section">
                        <span>03 — Processo</span>
                        <div className="case-process">
                          {projectCases[selectedProject].process.map((step, index) => (
                            <div key={step}>
                              <small>{String(index + 1).padStart(2, "0")}</small>
                              <strong>{step}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="case-study-section">
                        <span>04 — Serviços envolvidos</span>
                        <div className="case-tags">
                          {projectCases[selectedProject].services.map((service) => (
                            <span key={service}>{service}</span>
                          ))}
                        </div>
                      </div>
                      <div className="case-study-section">
                        <span>05 — Resultado</span>
                        <p>{projectCases[selectedProject].result}</p>
                      </div>
                    </article>
                  ) : infoPanel.items && panel === "projects" ? (
                    <div className="project-grid">
                      {projectCases.map((project, index) => (
                        <article key={project.title} className="project-card">
                          <span>0{index + 1}</span>
                          <div>
                            <small>{project.category}</small>
                            <h3>{project.title}</h3>
                            <p>
                              Caso demonstrativo do portfólio com desafio, solução, processo e
                              resultado apresentados dentro da experiência.
                            </p>
                          </div>
                          <button type="button" onClick={() => setSelectedProject(index)}>
                            Ver caso →
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : infoPanel.items ? (
                    <div className="info-grid">
                      {infoPanel.items.map((item, index) => (
                        <div key={item} className="info-row">
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{item}</strong>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button className="panel-back" type="button" onClick={closePanel}>
                    Voltar ao escritório <span>→</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="form-panel-head">
                  <div>
                    <span className="eyebrow">
                      {panel === "cv"
                        ? "Recursos Humanos"
                        : panel === "supplier"
                          ? "Procurement · Fornecedores"
                          : "Procurement · Pedido"}
                    </span>
                    <h2>
                      {panel === "cv"
                        ? "Deixe o seu CV connosco."
                        : panel === "supplier"
                          ? "Torne-se nosso fornecedor."
                          : "Diga-nos do que precisa."}
                    </h2>
                  </div>
                  <button type="button" aria-label="Fechar formulário" onClick={closePanel}>
                    ×
                  </button>
                </div>

                {submitted ? (
                  <div className="form-success">
                    <span>PEDIDO RECEBIDO</span>
                    <h3>Obrigado.</h3>
                    <p>
                      A interação está concluída no front-end. O próximo passo será guardar os
                      pedidos e ficheiros enviados no Supabase.
                    </p>
                    <button type="button" onClick={closePanel}>
                      Voltar ao escritório
                    </button>
                  </div>
                ) : panel === "cv" ? (
                  <form className="cv-form" onSubmit={submitDemo}>
                    <label>
                      Nome completo
                      <input name="name" type="text" placeholder="O seu nome" required />
                    </label>
                    <label>
                      Email
                      <input name="email" type="email" placeholder="voce@email.com" required />
                    </label>
                    <label>
                      Telefone
                      <input name="phone" type="tel" placeholder="+258" />
                    </label>
                    <label>
                      Área de interesse
                      <select name="area" defaultValue="">
                        <option value="" disabled>
                          Selecione uma área
                        </option>
                        <option>Operações</option>
                        <option>Procurement</option>
                        <option>Comercial</option>
                        <option>Tecnologia</option>
                        <option>Administração</option>
                      </select>
                    </label>
                    <label className="form-full">
                      CV
                      <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
                    </label>
                    <label className="form-full">
                      Mensagem
                      <textarea name="message" rows={4} placeholder="Conte-nos um pouco sobre si." />
                    </label>
                    <button className="submit-button form-full" type="submit">
                      Submeter candidatura <span>→</span>
                    </button>
                  </form>
                ) : panel === "supplier" ? (
                  <form className="cv-form" onSubmit={submitDemo}>
                    <label>
                      Nome da empresa
                      <input name="company" type="text" placeholder="Empresa" required />
                    </label>
                    <label>
                      Pessoa de contacto
                      <input name="contact" type="text" placeholder="Nome completo" required />
                    </label>
                    <label>
                      Email empresarial
                      <input name="email" type="email" placeholder="voce@empresa.com" required />
                    </label>
                    <label>
                      Categoria
                      <input name="category" type="text" placeholder="O que fornece?" required />
                    </label>
                    <label className="form-full">
                      Perfil da empresa
                      <input name="profile" type="file" accept=".pdf,.doc,.docx" />
                    </label>
                    <label className="form-full">
                      Message
                      <textarea name="message" rows={4} placeholder="Apresente a sua empresa." />
                    </label>
                    <button className="submit-button form-full" type="submit">
                      Submeter perfil de fornecedor <span>→</span>
                    </button>
                  </form>
                ) : (
                  <form className="cv-form" onSubmit={submitDemo}>
                    <label>
                      Produto / material
                      <input name="product" type="text" placeholder="O que precisa?" required />
                    </label>
                    <label>
                      Quantidade
                      <input name="quantity" type="text" placeholder="ex.: 50 unidades" required />
                    </label>
                    <label>
                      Local de entrega
                      <input name="location" type="text" placeholder="Cidade / país" required />
                    </label>
                    <label>
                      Necessário até
                      <input name="date" type="date" />
                    </label>
                    <label className="form-full">
                      Ficheiro de referência
                      <input name="reference" type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
                    </label>
                    <label className="form-full">
                      Especificações
                      <textarea name="details" rows={4} placeholder="Descreva o produto ou os requisitos." />
                    </label>
                    <button className="submit-button form-full" type="submit">
                      Enviar pedido <span>→</span>
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {!entered && (
        <div className={`intro ${entering ? "intro--leaving" : ""}`}>
          <div className="intro-count">01 — ENTRAR</div>
          <div className="intro-content">
            <p className="intro-kicker">Um portfólio onde pode entrar.</p>
            <h1>
              Bem-vindo ao
              <br />
              The Office.
            </h1>
            <p className="intro-copy">
              Entre. Percorra os departamentos, conheça as pessoas e descubra a empresa
              como se estivesse realmente lá.
            </p>

            <button
              className="enter-button"
              type="button"
              onClick={enterOffice}
              disabled={entering}
            >
              {entering ? "A abrir as portas..." : "Entrar no escritório"}
              <span>→</span>
            </button>

            <div className="intro-controls">
              <span>Clique no chão para caminhar</span>
              <span>WASD também funciona</span>
              <span>ESC para fechar</span>
            </div>
          </div>
          <div className="intro-footer">
            <span>EXPERIÊNCIA 3D / WEB</span>
            <span>© 2026</span>
          </div>
        </div>
      )}
    </main>
  );
}
