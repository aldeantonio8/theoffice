"use client";

import { FormEvent, useState } from "react";
import OfficeScene from "./OfficeScene";
import { Department } from "./officeData";

function dispatchMove(key: string, pressed: boolean) {
  window.dispatchEvent(new KeyboardEvent(pressed ? "keydown" : "keyup", { key }));
}

export default function OfficeExperience() {
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [nearby, setNearby] = useState<Department | null>(null);
  const [showCV, setShowCV] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAction = (action: string) => {
    if (action === "Submit CV") {
      setSubmitted(false);
      setShowCV(true);
    }
  };

  const submitCV = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

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
        <OfficeScene onSelect={setSelected} onNearby={setNearby} />

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

        {nearby && !selected && (
          <button className="talk-prompt" type="button" onClick={() => setSelected(nearby)}>
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
                ×
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

      {showCV && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Submit CV">
          <div className="form-panel">
            <div className="form-panel-head">
              <div>
                <span className="eyebrow">Human Resources</span>
                <h2>Leave your CV with us.</h2>
              </div>
              <button type="button" aria-label="Close form" onClick={() => setShowCV(false)}>
                ×
              </button>
            </div>

            {submitted ? (
              <div className="form-success">
                <span>APPLICATION RECEIVED</span>
                <h3>Thank you.</h3>
                <p>
                  The front-end flow is working. In the next phase we can connect this form to Supabase
                  Storage and Database so the CV is actually saved.
                </p>
                <button type="button" onClick={() => setShowCV(false)}>
                  Back to the office
                </button>
              </div>
            ) : (
              <form className="cv-form" onSubmit={submitCV}>
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
            )}
          </div>
        </div>
      )}

      {!entered && (
        <div className="intro">
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
