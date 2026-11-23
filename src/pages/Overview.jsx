import { ArrowRight, BookOpen, GitCompareArrows, ListChecks, TriangleAlert } from 'lucide-react';
import { EmptyState, PageHeading, Panel, ScannerMark, SectionHeading, Severity, Status, TextLink } from '../components/Ui.jsx';
import { scanners, severities } from '../domain/catalog.js';
import { compareScanner, selectFindings, summarize } from '../domain/findings.js';
import { routeHref } from '../hooks/useWorkspace.js';

function Metric({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className="panel metric">
      <div className={'metric-icon metric-' + tone}><Icon size={19} aria-hidden="true" /></div>
      <div>
        <h2>{label}</h2>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}

function SeverityDistribution({ distribution }) {
  const entries = Object.entries(distribution);
  const maximum = Math.max(1, ...entries.map(([, count]) => count));

  return (
    <Panel className="severity-panel">
      <SectionHeading title="Aktive Befunde" description="Verteilung nach Schweregrad" />
      <ul className="bar-chart">
        {entries.map(([severity, count]) => (
          <li className={'bar-row severity-' + severity} key={severity}>
            <span>{severities[severity].label}</span>
            <span className="bar-track" aria-hidden="true">
              <span style={{ width: (count / maximum) * 100 + '%' }} />
            </span>
            <strong>{count}</strong>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ScannerSnapshot({ findings }) {
  return (
    <Panel className="scanner-panel">
      <SectionHeading title="Scanner" description="Zuordnung in den Beispieldaten" />
      <ul className="scanner-list">
        {Object.entries(scanners).map(([id, scanner]) => {
          const stats = compareScanner(findings, id);
          return (
            <li key={id}>
              <a className="scanner-row" href={routeHref('findings', id)}>
                <ScannerMark id={id} />
                <span><strong>{scanner.label}</strong><small>{scanner.description}</small></span>
                <span className="scanner-total">{stats.total}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function PriorityList({ findings }) {
  const active = selectFindings(findings.filter(({ state }) => state !== 'resolved')).slice(0, 4);

  return (
    <Panel className="priority-panel">
      <SectionHeading title="Priorisierte Befunde" description="Sortiert nach Schweregrad und Datum">
        <TextLink href={routeHref('findings')}>Alle Befunde</TextLink>
      </SectionHeading>
      {active.length ? (
        <ul className="priority-list">
          {active.map((finding) => (
            <li key={finding.id}>
              <div className="priority-name"><strong>{finding.title}</strong><small>{finding.id} · {finding.owner}</small></div>
              <Severity value={finding.severity} />
              <Status value={finding.state} />
            </li>
          ))}
        </ul>
      ) : <EmptyState title="Keine aktiven Befunde" />}
    </Panel>
  );
}

export function Overview({ findings }) {
  const { status, active, highPriority, shared, distribution } = summarize(findings);

  return (
    <>
      <PageHeading title="Scanner-Übersicht" description="Vergleiche Funde aus drei Scannern anhand desselben Projekts.">
        <a className="button primary" href={routeHref('guide')}><BookOpen size={17} aria-hidden="true" /> Testanleitung</a>
      </PageHeading>
      <div className="metric-grid">
        <Metric icon={ListChecks} tone="teal" label="Aktive Befunde" value={active} detail={status.review + ' in Prüfung'} />
        <Metric icon={TriangleAlert} tone="amber" label="Hohe Priorität" value={highPriority} detail="Hoch oder kritisch" />
        <Metric icon={GitCompareArrows} tone="violet" label="Überschneidungen" value={shared} detail="Bei mehreren Scannern" />
      </div>
      <div className="overview-grid">
        <SeverityDistribution distribution={distribution} />
        <ScannerSnapshot findings={findings} />
      </div>
      <PriorityList findings={findings} />
    </>
  );
}
