import { useMemo, useRef, useState } from 'react';
import { Download, RotateCcw, Search } from 'lucide-react';
import { FindingDetail } from '../components/FindingDetail.jsx';
import { EmptyState, PageHeading, Panel, ScannerList, Severity, Status } from '../components/Ui.jsx';
import { categories, defaultFilters, scanners, severities, states } from '../domain/catalog.js';
import { findingsCsv, selectFindings } from '../domain/findings.js';
import { appendNote, changeFindingState, removeNote } from '../domain/storage.js';

const sortOptions = {
  severity: 'Schweregrad',
  recent: 'Neuste zuerst',
  title: 'Titel A–Z',
};

const scannerOptions = Object.fromEntries(Object.entries(scanners).map(([id, value]) => [id, value.label]));
const severityOptions = Object.fromEntries(Object.entries(severities).map(([id, value]) => [id, value.label]));

function FilterSelect({ label, value, options, emptyLabel, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {emptyLabel && <option value="">{emptyLabel}</option>}
        {Object.entries(options).map(([key, title]) => (
          <option value={key} key={key}>{title}</option>
        ))}
      </select>
    </label>
  );
}

function Filters({ filters, setFilter, clear }) {
  return (
    <div className="filter-panel">
      <label className="field search-field">
        <span>Suche</span>
        <span className="input-with-icon">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            placeholder="Titel, Datei oder Referenz"
            value={filters.query}
            onChange={(event) => setFilter('query', event.target.value)}
          />
        </span>
      </label>
      <FilterSelect label="Scanner" options={scannerOptions} emptyLabel="Alle Scanner" value={filters.scanner} onChange={(value) => setFilter('scanner', value)} />
      <FilterSelect label="Schweregrad" options={severityOptions} emptyLabel="Alle Stufen" value={filters.severity} onChange={(value) => setFilter('severity', value)} />
      <FilterSelect label="Status" options={states} emptyLabel="Alle Status" value={filters.state} onChange={(value) => setFilter('state', value)} />
      <FilterSelect label="Sortieren" options={sortOptions} value={filters.sort} onChange={(value) => setFilter('sort', value)} />
      <button className="button secondary reset-button" onClick={clear} type="button" aria-label="Filter zurücksetzen">
        <RotateCcw size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

function FindingTable({ findings, open }) {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Befundtabelle">
      <table className="finding-table">
        <thead>
          <tr>
            <th scope="col">Befund</th>
            <th scope="col">Schweregrad</th>
            <th scope="col">Status</th>
            <th scope="col">Scanner</th>
            <th scope="col">Team</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((finding) => (
            <tr key={finding.id}>
              <td>
                <button className="finding-link" type="button" onClick={(event) => open(finding.id, event.currentTarget)}>
                  <strong>{finding.title}</strong>
                  <small>{finding.id} · {categories[finding.category]}</small>
                </button>
              </td>
              <td><Severity value={finding.severity} /></td>
              <td><Status value={finding.state} /></td>
              <td><ScannerList ids={finding.scanners} /></td>
              <td>{finding.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function exportCsv(findings) {
  const blob = new Blob([findingsCsv(findings)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'scanboard-befunde.csv';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Findings({ findings, setFindings, initialScanner, storageProblem }) {
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    scanner: Object.hasOwn(scanners, initialScanner) ? initialScanner : '',
  }));
  const [activeId, setActiveId] = useState(null);
  const lastTrigger = useRef(null);
  const resultsHeading = useRef(null);
  const results = useMemo(() => selectFindings(findings, filters), [findings, filters]);
  const active = findings.find(({ id }) => id === activeId);

  const clearFilters = () => setFilters(defaultFilters);
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const open = (id, trigger) => {
    lastTrigger.current = trigger;
    setActiveId(id);
  };

  const close = () => {
    setActiveId(null);
    window.requestAnimationFrame(() => {
      if (lastTrigger.current?.isConnected) lastTrigger.current.focus();
      else resultsHeading.current?.focus();
    });
  };

  return (
    <>
      <PageHeading title="Befunde" description="Durchsuche, exportiere und dokumentiere die Beispielbefunde.">
        <button className="button primary" type="button" disabled={results.length === 0} onClick={() => exportCsv(results)}>
          <Download size={17} aria-hidden="true" /> CSV exportieren
        </button>
      </PageHeading>
      {storageProblem && <p role="status" className="notice">Der Browser konnte Änderungen für diese Sitzung nicht speichern.</p>}
      <Panel className="results-panel">
        <Filters filters={filters} setFilter={setFilter} clear={clearFilters} />
        <div className="results-meta">
          <h2 ref={resultsHeading} tabIndex={-1} aria-live="polite">{results.length} von {findings.length} Befunden</h2>
          <span>Demo-Datensatz</span>
        </div>
        {results.length > 0 ? <FindingTable findings={results} open={open} /> : (
          <EmptyState title="Keine passenden Befunde">
            <p>Passe die Suche an oder setze die Filter zurück.</p>
            <button className="button secondary" onClick={clearFilters} type="button">Filter zurücksetzen</button>
          </EmptyState>
        )}
      </Panel>
      {active && (
        <FindingDetail
          finding={active}
          onClose={close}
          changeState={(id, state) => setFindings((current) => changeFindingState(current, id, state))}
          addNote={(id, note) => setFindings((current) => appendNote(current, id, note))}
          deleteNote={(id, noteId) => setFindings((current) => removeNote(current, id, noteId))}
        />
      )}
    </>
  );
}
