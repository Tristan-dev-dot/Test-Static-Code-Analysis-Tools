import { ArrowRight, CircleHelp } from 'lucide-react';
import { scanners, severities, states } from '../domain/catalog.js';

export function PageHeading({ title, description, children }) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}

export function SectionHeading({ title, description, children }) {
  return (
    <header className="section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </header>
  );
}

export function ScannerMark({ id }) {
  const scanner = scanners[id];
  return (
    <span className={'scanner-mark scanner-' + scanner.color} aria-hidden="true">
      {scanner.short}
    </span>
  );
}

export function ScannerList({ ids }) {
  return (
    <ul className="scanner-tags" aria-label="Scanner">
      {ids.map((id) => <li key={id}>{scanners[id].label}</li>)}
    </ul>
  );
}

export function Severity({ value }) {
  return (
    <span className={'severity severity-' + value}>
      <span aria-hidden="true" />
      {severities[value].label}
    </span>
  );
}

export function Status({ value }) {
  return <span className={'status status-' + value}>{states[value]}</span>;
}

export function TextLink({ href, children }) {
  return (
    <a className="text-link" href={href}>
      {children}
      <ArrowRight size={15} aria-hidden="true" />
    </a>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty-state">
      <CircleHelp size={26} aria-hidden="true" />
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function Panel({ className = '', children }) {
  return <section className={'panel ' + className}>{children}</section>;
}
