"use client";

import { useState } from "react";
import OfficeScene from "./OfficeScene";
import { Department, departments } from "./officeData";

export default function OfficeExperience() {
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState<Department | null>(departments[0]);

  return (
    <main className="experience-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="The Office home">
          THE OFFICE
        </a>
        <div className="topbar-meta">
          <span>Interactive portfolio</span>
          <span className="status-dot">Live prototype</span>
        </div>
      </header>

      <section className="scene-shell" aria-label="Interactive 3D office">
        <OfficeScene onSelect={setSelected} />

        <div className="controls">
          <span>MOVE</span>
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          <span className="controls-separator">or click a room</span>
        </div>

        {selected && (
          <aside className="department-card">
            <span className="eyebrow">{selected.eyebrow}</span>
            <h2>{selected.title}</h2>
            <p>{selected.body}</p>
            <div className="department-actions">
              {selected.actions.map((action) => (
                <button key={action} type="button">
                  {action}
                  <span>↗</span>
                </button>
              ))}
            </div>
          </aside>
        )}
      </section>

      {!entered && (
        <div className="intro">
          <div className="intro-count">01 — ENTER</div>
          <div className="intro-content">
            <p className="intro-kicker">A portfolio you can walk through.</p>
            <h1>Welcome to<br />The Office.</h1>
            <p className="intro-copy">
              Step inside. Explore departments, meet the people and discover the company like you were actually there.
            </p>
            <button className="enter-button" type="button" onClick={() => setEntered(true)}>
              Enter the office
              <span>→</span>
            </button>
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
