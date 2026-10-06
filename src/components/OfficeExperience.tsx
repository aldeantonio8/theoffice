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

  const handleSelect = (department: Department) => {
    setSelected(department);
    setVisited((current) =>
      current.includes(department.id) ? current : [...current, department.id],
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

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
  }, [panel, directoryOpen, selected]);

  const enterOffice = () => {
    if (entering) return;
    setEntering(true);
    window.setTimeout(() => setEntered(true), 620);
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
  };

  const infoPanel =
    panel && panel !== "cv" && panel !== "procurement" && panel !== "supplier"
      ? panelCopy[panel]
      : null;

  return (
    <main className="experience-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="The Office home">
          THE OFFICE
        </a>
        <div className="topbar-meta">
          <span>Portfólio interativo</span>
          <span className="status-dot">Escritório aberto</span>
        </div>
      </header>

      <section className="scene-shell" aria-label="Interactive 3D office">
        <OfficeScene
          onSelect={handleSelect}
          onNearby={setNearby}
          onAreaChange={setCurrentArea}
          activeDepartmentId={selected?.id ?? null}
        />

        <div className="area-indicator">
          <span>Está em</span>
          <strong>{currentArea?.label ?? "Corredor principal"}</strong>
        </div>

        {entered && (
          <aside className="mini-map" aria-label="Office mini map">
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

        <button
          className="directory-toggle"
          type="button"
          onClick={() => setDirectoryOpen((open) => !open)}
        >
          Diretório
          <span>{directoryOpen ? "×" : "+"}</span>
        </button>

        {directoryOpen && (
          <nav className="directory-panel" aria-label="Office directory">
            <span className="eyebrow">Navegação rápida</span>
            {departments.map((department, index) => (
              <button
                key={department.id}
                type="button"
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
          <span className="controls-separator">Aproxime-se de uma pessoa e pressione E</span>
        </div>

        <div className="mobile-dpad" aria-label="Movement controls">
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
              {visited.length === 0
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

        {selected && (
          <aside className="department-card">
            <div className="dialogue-head">
              <span>
                {selected.npcName} · {selected.npcRole}
              </span>
              <button type="button" aria-label="Close conversation" onClick={() => setSelected(null)}>
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
        )}
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
                  <button type="button" aria-label="Close panel" onClick={closePanel}>
                    ×
                  </button>
                </div>
                <div className="info-panel-body">
                  <p>{infoPanel.body}</p>
                  {infoPanel.items && (
                    <div className="info-grid">
                      {infoPanel.items.map((item, index) => (
                        <div key={item} className="info-row">
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{item}</strong>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <button type="button" aria-label="Close form" onClick={closePanel}>
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
            <button className="enter-button" type="button" onClick={enterOffice} disabled={entering}>
              {entering ? "A abrir as portas..." : "Entrar no escritório"}
              <span>→</span>
            </button>
            <div className="intro-controls">
              <span>WASD para mover</span>
              <span>E para interagir</span>
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
