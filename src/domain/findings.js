import { categories, defaultFilters, scanners, severities, states } from './catalog.js';

const collator = new Intl.Collator('de-CH', { sensitivity: 'base', numeric: true });

function searchable(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('de-CH');
}

export function selectFindings(findings, filters = defaultFilters) {
  const normalized = searchable(filters.query.trim());
  const words = normalized.split(/\s+/).filter(Boolean);

  return findings
    .filter((finding) => {
      if (filters.scanner && !finding.scanners.includes(filters.scanner)) return false;
      if (filters.severity && finding.severity !== filters.severity) return false;
      if (filters.state && finding.state !== filters.state) return false;
      if (!words.length) return true;

      const haystack = searchable([
        finding.id,
        finding.title,
        finding.file,
        finding.reference,
        finding.owner,
        categories[finding.category],
        ...finding.scanners.map((scanner) => scanners[scanner].label),
      ].join(' '));

      return words.every((word) => haystack.includes(word));
    })
    .sort((first, second) => {
      if (filters.sort === 'title') {
        return collator.compare(first.title, second.title) || collator.compare(first.id, second.id);
      }

      const byDate = second.date.localeCompare(first.date);
      if (filters.sort === 'recent') return byDate || collator.compare(first.id, second.id);

      const bySeverity = severities[second.severity].rank - severities[first.severity].rank;
      return bySeverity || byDate || collator.compare(first.id, second.id);
    });
}

export function countBy(findings, key, values) {
  const counts = Object.fromEntries(values.map((value) => [value, 0]));

  for (const finding of findings) {
    if (Object.hasOwn(counts, finding[key])) counts[finding[key]] += 1;
  }

  return counts;
}

export function summarize(findings) {
  const status = countBy(findings, 'state', Object.keys(states));
  const active = findings.filter((finding) => finding.state !== 'resolved');

  return {
    status,
    active: active.length,
    highPriority: active.filter(({ severity }) => ['high', 'critical'].includes(severity)).length,
    shared: findings.filter(({ scanners: sources }) => sources.length > 1).length,
    distribution: countBy(active, 'severity', Object.keys(severities)),
  };
}

export function compareScanner(findings, id) {
  const matching = findings.filter((finding) => finding.scanners.includes(id));
  const unique = matching.filter((finding) => finding.scanners.length === 1).length;

  return {
    total: matching.length,
    unique,
    shared: matching.length - unique,
    pending: matching.filter((finding) => finding.state !== 'resolved').length,
    categories: countBy(matching, 'category', Object.keys(categories)),
  };
}

export function overlapFor(findings, left, right) {
  return findings.filter((finding) =>
    finding.scanners.includes(left) && finding.scanners.includes(right),
  );
}

function safeCsvCell(value) {
  const text = String(value ?? '');
  const safe = /^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/u.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

export function findingsCsv(findings) {
  const rows = [
    ['ID', 'Titel', 'Kategorie', 'Schweregrad', 'Status', 'Datei', 'Referenz', 'Team', 'Datum', 'Scanner'],
    ...findings.map((finding) => [
      finding.id,
      finding.title,
      categories[finding.category],
      severities[finding.severity].label,
      states[finding.state],
      finding.file,
      finding.reference,
      finding.owner,
      finding.date,
      finding.scanners.map((id) => scanners[id].label).join(', '),
    ]),
  ];

  return '\uFEFF' + rows.map((row) => row.map(safeCsvCell).join(';')).join('\r\n') + '\r\n';
}
