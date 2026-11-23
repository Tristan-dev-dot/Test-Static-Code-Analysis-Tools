import { useState } from 'react';
import { ArrowRight, GitCompareArrows } from 'lucide-react';
import { EmptyState, PageHeading, Panel, ScannerMark, SectionHeading, Severity, TextLink } from '../components/Ui.jsx';
import { categories, scanners } from '../domain/catalog.js';
import { compareScanner, overlapFor, selectFindings } from '../domain/findings.js';
import { routeHref } from '../hooks/useWorkspace.js';

const pairs = [
  ['snyk', 'aikido'],
  ['snyk', 'sonar'],
  ['aikido', 'sonar'],
];

function ScannerCard({ id, findings }) {
  const scanner = scanners[id];
  const stats = compareScanner(findings, id);

  return (
    <article className="panel scanner-card">
      <header>
        <ScannerMark id={id} />
        <div><h2>{scanner.label}</h2><p>{scanner.description}</p></div>
      </header>
      <dl className="scanner-stats">
        <div><dt>Gesamt</dt><dd>{stats.total}</dd></div>
        <div><dt>Aktiv</dt><dd>{stats.pending}</dd></div>
        <div><dt>Nur hier</dt><dd>{stats.unique}</dd></div>
      </dl>
      <ul className="category-list">
        {Object.entries(categories).map(([category, label]) => (
          <li key={category}><span>{label}</span><strong>{stats.categories[category]}</strong></li>
        ))}
      </ul>
      <TextLink href={routeHref('findings', id)}>Befunde anzeigen</TextLink>
    </article>
  );
}

function Overlap({ findings }) {
  const [pairIndex, setPairIndex] = useState(0);
  const [first, second] = pairs[pairIndex];
  const matching = selectFindings(overlapFor(findings, first, second));

  return (
    <Panel className="overlap-panel">
      <SectionHeading title="Gemeinsame Befunde" description="Ein Befund kann in mehreren Scanner-Paaren erscheinen." />
      <fieldset className="pair-switcher">
        <legend>Scanner-Paar</legend>
        <div>
          {pairs.map(([left, right], index) => (
            <label key={left + right}>
              <input
                type="radio"
                name="scanner-pair"
                checked={pairIndex === index}
                onChange={() => setPairIndex(index)}
              />
              <span>{scanners[left].label} + {scanners[right].label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="overlap-summary" aria-live="polite">
        <GitCompareArrows size={17} aria-hidden="true" />
        {matching.length === 1 ? '1 gemeinsamer Befund' : matching.length + ' gemeinsame Befunde'}
      </p>
      {matching.length ? (
        <ul className="overlap-list">
          {matching.map((finding) => (
            <li key={finding.id}>
              <span className="mono">{finding.id}</span>
              <strong>{finding.title}</strong>
              <Severity value={finding.severity} />
            </li>
          ))}
        </ul>
      ) : <EmptyState title="Keine gemeinsamen Befunde" />}
    </Panel>
  );
}

export function Comparison({ findings }) {
  return (
    <>
      <PageHeading title="Scanner vergleichen" description="Prüfe, welche Beispielbefunde sich überschneiden.">
        <a className="button secondary" href={routeHref('findings')}>
          Befunde durchsuchen <ArrowRight size={17} aria-hidden="true" />
        </a>
      </PageHeading>
      <div className="comparison-grid">
        {Object.keys(scanners).map((id) => <ScannerCard key={id} id={id} findings={findings} />)}
      </div>
      <Overlap findings={findings} />
    </>
  );
}
