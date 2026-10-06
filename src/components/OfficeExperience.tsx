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
  | "help";

function dispatchMove(key: string, pressed: boolean) {
  window.dispatchEvent(new KeyboardEvent(pressed ? "keydown" : "keyup", { key }));
}

const panelCopy: Record<
  Exclude<Panel, null | "cv" | "procurement" | "supplier">,
  { eyebrow: string; title: string; body: string; items?: string[] }
> = {
  culture: {
    eyebrow: "People & Culture",
    title: "Life inside The Office.",
    body: "A good logistics company is built by people who communicate clearly, solve problems quickly and take ownership of every handover.",
    items: ["Learning & growth", "Safety first", "Team accountability", "Customer focus"],
  },
  services: {
    eyebrow: "Operations",
    title: "Moving cargo from A to B is only the beginning.",
    body: "The Operations room represents the services that keep cargo visible, controlled and moving.",
    items: ["Road freight", "Sea freight", "Air freight", "Customs clearance", "Warehousing", "Last-mile delivery"],
  },
  routes: {
    eyebrow: "Operations",
    title: "One room. Many routes.",
    body: "This prototype uses a control-room metaphor. In a production version, the wall screens can become an interactive map with real offices, corridors and project routes.",
    items: ["Maputo", "Nacala", "Beira", "Johannesburg", "Regional corridors"],
  },
  story: {
    eyebrow: "Director's Office",
    title: "Built around movement and trust.",
    body: "The Office is a portfolio concept for a logistics business: instead of explaining the company through static pages, visitors meet it as a place, room by room.",
    items: ["Company story", "Capabilities", "Projects", "Team", "Contact"],
  },
  vision: {
    eyebrow: "Director's Office",
    title: "Make the website feel like the company.",
    body: "The long-term vision is an explorable 3D office where every department becomes a real digital service: careers, procurement, project cases, meetings and logistics operations.",
    items: ["Immersive", "Useful", "Fast", "Human", "Memorable"],
  },
  tour: {
    eyebrow: "Reception",
    title: "Choose where to start.",
    body: "You can walk naturally with WASD, or use this directory to understand what each room represents.",
    items: departments.map((department) => `${department.label} — ${department.eyebrow}`),
  },
  help: {
    eyebrow: "Reception",
    title: "How The Office works.",
    body: "Walk close to a team member. When the prompt appears, press E or click the person. Every conversation replaces a traditional website section.",
    items: ["WASD / arrows to move", "E to talk", "Click a person on desktop", "Directional controls on mobile"],
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
      "Submit CV": "cv",
      "Life at the company": "culture",
      "Request a product": "procurement",
      "Become a supplier": "supplier",
      "Explore services": "services",
      "View routes": "routes",
      "Our story": "story",
      "Our vision": "vision",
      "Start tour": "tour",
      "How does this work?": "help",
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
          <span>Interactive portfolio</span>
          <span className="status-dot">Office open</span>
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
          <span>You are in</span>
          <strong>{currentArea?.label ?? "Main corridor"}</strong>
        </div>

        {entered && (
          <aside className="mini-map" aria-label="Office mini map">
            <div className="mini-map-head">
              <span>Office map</span>
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
              <div className="mini-you" aria-hidden="true">YOU</div>
            </div>
          </aside>
        )}

        <button
          className="directory-toggle"
          type="button"
          onClick={() => setDirectoryOpen((open) => !open)}
        >
          Directory
          <span>{directoryOpen ? "×" : "+"}</span>
        </button>

        {directoryOpen && (
          <nav className="directory-panel" aria-label="Office directory">
            <span className="eyebrow">Quick navigation</span>
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
          <span>MOVE</span>
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          <span className="controls-separator">Walk to a person and press E</span>
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
            <span>Current objective</span>
            <strong>
              {visited.length === 0
                ? "Meet Mia at Reception"
                : visited.length < departments.length
                  ? `Explore the office · ${visited.length}/${departments.length}`
                  : "Office tour complete"}
            </strong>
          </div>
        )}

        {nearby && !selected && (
          <button className="talk-prompt" type="button" onClick={() => handleSelect(nearby)}>
            <span className="talk-key">E</span>
            Talk to {nearby.npcName}
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
                    Back to the office <span>→</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="form-panel-head">
                  <div>
                    <span className="eyebrow">
                      {panel === "cv"
                        ? "Human Resources"
                        : panel === "supplier"
                          ? "Procurement · Suppliers"
                          : "Procurement · Request"}
                    </span>
                    <h2>
                      {panel === "cv"
                        ? "Leave your CV with us."
                        : panel === "supplier"
                          ? "Become a supplier."
                          : "Tell us what you need."}
                    </h2>
                  </div>
                  <button type="button" aria-label="Close form" onClick={closePanel}>
                    ×
                  </button>
                </div>

                {submitted ? (
                  <div className="form-success">
                    <span>REQUEST RECEIVED</span>
                    <h3>Thank you.</h3>
                    <p>
                      The interaction is complete on the front end. The next backend step is to store
                      submissions and uploaded files in Supabase.
                    </p>
                    <button type="button" onClick={closePanel}>
                      Back to the office
                    </button>
                  </div>
                ) : panel === "cv" ? (
                  <form className="cv-form" onSubmit={submitDemo}>
                    <label>
                      Full name
                      <input name="name" type="text" placeholder="Your name" required />
                    </label>
                    <label>
                      Email
                      <input name="email" type="email" placeholder="you@email.com" required />
                    </label>
                    <label>
                      Phone
                      <input name="phone" type="tel" placeholder="+258" />
                    </label>
                    <label>
                      Area of interest
                      <select name="area" defaultValue="">
                        <option value="" disabled>
                          Select an area
                        </option>
                        <option>Operations</option>
                        <option>Procurement</option>
                        <option>Commercial</option>
                        <option>Technology</option>
                        <option>Administration</option>
                      </select>
                    </label>
                    <label className="form-full">
                      CV
                      <input name="cv" type="file" accept=".pdf,.doc,.docx" required />
                    </label>
                    <label className="form-full">
                      Message
                      <textarea name="message" rows={4} placeholder="Tell us a little about yourself." />
                    </label>
                    <button className="submit-button form-full" type="submit">
                      Submit application <span>→</span>
                    </button>
                  </form>
                ) : panel === "supplier" ? (
                  <form className="cv-form" onSubmit={submitDemo}>
                    <label>
                      Company name
                      <input name="company" type="text" placeholder="Company" required />
                    </label>
                    <label>
                      Contact person
                      <input name="contact" type="text" placeholder="Full name" required />
                    </label>
                    <label>
                      Business email
                      <input name="email" type="email" placeholder="you@company.com" required />
                    </label>
                    <label>
                      Category
                      <input name="category" type="text" placeholder="What do you supply?" required />
                    </label>
                    <label className="form-full">
                      Company profile
                      <input name="profile" type="file" accept=".pdf,.doc,.docx" />
                    </label>
                    <label className="form-full">
                      Message
                      <textarea name="message" rows={4} placeholder="Introduce your company." />
                    </label>
                    <button className="submit-button form-full" type="submit">
                      Submit supplier profile <span>→</span>
                    </button>
                  </form>
                ) : (
                  <form className="cv-form" onSubmit={submitDemo}>
                    <label>
                      Product / material
                      <input name="product" type="text" placeholder="What do you need?" required />
                    </label>
                    <label>
                      Quantity
                      <input name="quantity" type="text" placeholder="e.g. 50 units" required />
                    </label>
                    <label>
                      Delivery location
                      <input name="location" type="text" placeholder="City / country" required />
                    </label>
                    <label>
                      Needed by
                      <input name="date" type="date" />
                    </label>
                    <label className="form-full">
                      Reference file
                      <input name="reference" type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
                    </label>
                    <label className="form-full">
                      Specifications
                      <textarea name="details" rows={4} placeholder="Describe the item or requirements." />
                    </label>
                    <button className="submit-button form-full" type="submit">
                      Send request <span>→</span>
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
          <div className="intro-count">01 — ENTER</div>
          <div className="intro-content">
            <p className="intro-kicker">A portfolio you can walk through.</p>
            <h1>
              Welcome to
              <br />
              The Office.
            </h1>
            <p className="intro-copy">
              Step inside. Walk through the departments, meet the people and discover the company
              like you were actually there.
            </p>
            <button className="enter-button" type="button" onClick={enterOffice} disabled={entering}>
              {entering ? "Opening the doors..." : "Enter the office"}
              <span>→</span>
            </button>
            <div className="intro-controls">
              <span>WASD to move</span>
              <span>E to interact</span>
              <span>ESC to close</span>
            </div>
          </div>
          <div className="intro-footer">
            <span>3D / WEB EXPERIENCE</span>
            <span>© 2026</span>
          </div>
        </div>
      )}
    </main>
  );
}
