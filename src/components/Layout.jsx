import {
  ArrowUpRight,
  BookOpen,
  GitCompareArrows,
  LayoutDashboard,
  ListFilter,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';
import { routes } from '../domain/catalog.js';
import { routeHref } from '../hooks/useWorkspace.js';

const navIcons = {
  overview: LayoutDashboard,
  findings: ListFilter,
  comparison: GitCompareArrows,
  guide: BookOpen,
};

const repository = 'https://github.com/Tristan-dev-dot/myaikidosecuretytestrepo';

export function Layout({ page, children }) {
  const pageTitle = routes[page].label;

  return (
    <div className="workspace">
      <a className="skip-link" href="#content" onClick={(event) => {
        event.preventDefault();
        document.getElementById('content')?.focus();
      }}>Zum Inhalt</a>
      <aside className="sidebar">
        <a className="brand" href={routeHref('overview')}>
          <span className="brand-icon" aria-hidden="true"><ScanLine size={22} /></span>
          <span>
            <strong>Scanboard</strong>
            <small>Scanner-Vergleich</small>
          </span>
        </a>
        <nav className="side-nav" aria-label="Hauptnavigation">
          {Object.entries(routes).map(([id, route]) => {
            const Icon = navIcons[id];
            return (
              <a
                aria-current={page === id ? 'page' : undefined}
                className="nav-link"
                href={routeHref(id)}
                key={id}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{route.label}</span>
              </a>
            );
          })}
        </nav>
        <a className="repository-link" href={repository}>
          <span className="repository-icon" aria-hidden="true"><ShieldCheck size={17} /></span>
          <span>GitHub-Repository</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <span className="breadcrumb"><span>Scanboard</span><span aria-hidden="true">/</span>{pageTitle}</span>
          <span className="demo-label"><span aria-hidden="true" />Beispieldaten</span>
        </header>
        <main className="content" id="content" tabIndex={-1}>
          {children}
        </main>
        <footer className="footer">
          <span>Scanboard</span>
          <span>Snyk · Aikido · SonarQube</span>
        </footer>
      </div>
    </div>
  );
}
