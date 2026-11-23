import { useEffect, useRef, useState } from 'react';
import { FileCode2, MessageSquarePlus, X } from 'lucide-react';
import { categories, formatDate, states } from '../domain/catalog.js';
import { noteLimit } from '../domain/storage.js';
import { ScannerList, Severity, Status } from './Ui.jsx';

export function FindingDetail({ finding, onClose, changeState, addNote, deleteNote }) {
  const dialog = useRef(null);
  const [body, setBody] = useState('');

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  const submit = (event) => {
    event.preventDefault();

    const text = body.trim();
    if (!text) return;

    addNote(finding.id, {
      id: crypto.randomUUID(),
      body: text,
      createdAt: new Date().toISOString(),
    });
    setBody('');
  };

  return (
    <dialog
      className="detail-dialog"
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="finding-title"
    >
      <div className="detail-header">
        <span className="mono">{finding.id}</span>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Befund schliessen">
          <X size={21} />
        </button>
      </div>
      <div className="detail-body">
        <div className="detail-title">
          <span>{categories[finding.category]}</span>
          <h2 id="finding-title">{finding.title}</h2>
          <p>{finding.summary}</p>
        </div>
        <div className="detail-badges">
          <Severity value={finding.severity} />
          <Status value={finding.state} />
        </div>
        <div className="file-reference">
          <FileCode2 size={18} aria-hidden="true" />
          <code>{finding.file}</code>
        </div>
        <dl className="detail-facts">
          <div><dt>Referenz</dt><dd>{finding.reference}</dd></div>
          <div><dt>Team</dt><dd>{finding.owner}</dd></div>
          <div><dt>Erfasst</dt><dd>{formatDate(finding.date)}</dd></div>
          <div><dt>Scanner</dt><dd><ScannerList ids={finding.scanners} /></dd></div>
        </dl>
        <section className="detail-section">
          <h3>Nächster Prüfschritt</h3>
          <p>{finding.next}</p>
          <label className="field detail-state">
            <span>Status ändern</span>
            <select value={finding.state} onChange={(event) => changeState(finding.id, event.target.value)}>
              {Object.entries(states).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
        </section>
        <section className="detail-section">
          <h3>Notizen <span>{finding.notes.length}</span></h3>
          <form className="note-form" onSubmit={submit}>
            <label className="field">
              <span>Neue Notiz</span>
              <textarea
                placeholder="Ergebnisse deiner Prüfung festhalten"
                maxLength={noteLimit}
                rows={3}
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
            </label>
            <div className="note-actions">
              <small>{body.length} / {noteLimit}</small>
              <button className="button primary" type="submit" disabled={!body.trim()}>
                <MessageSquarePlus size={16} aria-hidden="true" /> Speichern
              </button>
            </div>
          </form>
          {finding.notes.length > 0 && (
            <ul className="note-list">
              {finding.notes.map((note) => (
                <li key={note.id}>
                  <p>{note.body}</p>
                  <div>
                    <time dateTime={note.createdAt}>{formatDate(note.createdAt)}</time>
                    <button className="text-button" type="button" onClick={() => deleteNote(finding.id, note.id)}>Löschen</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </dialog>
  );
}
