export const scanners = {
  snyk: { label: 'Snyk', short: 'SY', color: 'violet', description: 'Abhängigkeiten und Quellcode' },
  aikido: { label: 'Aikido', short: 'AI', color: 'orange', description: 'Repository-Sicherheitsanalyse' },
  sonar: { label: 'SonarQube', short: 'SQ', color: 'blue', description: 'Quellcodequalität und Coverage' },
};

export const categories = {
  dependency: 'Abhängigkeit',
  quality: 'Codequalität',
  coverage: 'Testabdeckung',
  configuration: 'Konfiguration',
};

export const severities = {
  critical: { label: 'Kritisch', rank: 4 },
  high: { label: 'Hoch', rank: 3 },
  medium: { label: 'Mittel', rank: 2 },
  low: { label: 'Niedrig', rank: 1 },
  info: { label: 'Info', rank: 0 },
};

export const states = {
  open: 'Offen',
  review: 'In Prüfung',
  resolved: 'Erledigt',
};

export const defaultFilters = {
  query: '',
  scanner: '',
  severity: '',
  state: '',
  sort: 'severity',
};

export const routes = {
  overview: { label: 'Übersicht', description: 'Funde einordnen und Scanner vergleichen' },
  findings: { label: 'Befunde', description: 'Befunde durchsuchen und triagieren' },
  comparison: { label: 'Vergleich', description: 'Überschneidungen je Scanner prüfen' },
  guide: { label: 'Testanleitung', description: 'Echte Scans mit demselben Commit ausführen' },
};

export const dateFormat = new Intl.DateTimeFormat('de-CH', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(value) {
  return dateFormat.format(new Date(value));
}
