import { describe, expect, it } from 'vitest';
import { defaultFilters } from '../src/domain/catalog.js';
import { compareScanner, findingsCsv, overlapFor, selectFindings, summarize } from '../src/domain/findings.js';
import { createSeed } from '../src/domain/seed.js';

const ids = (findings) => findings.map(({ id }) => id);

describe('Befunde auswählen', () => {
  it('sortiert standardmässig nach Schweregrad und Datum', () => {
    const findings = createSeed();
    expect(ids(selectFindings(findings)).slice(0, 4)).toEqual(['SB-101', 'SB-106', 'SB-102', 'SB-103']);
    expect(ids(findings).slice(0, 4)).toEqual(['SB-101', 'SB-102', 'SB-103', 'SB-104']);
  });

  it('kombiniert Suchwörter aus unterschiedlichen Feldern ohne Akzente', () => {
    const results = selectFindings(createSeed(), { ...defaultFilters, query: '  plattform   ABHANGIGKEIT ' });
    expect(ids(results)).toEqual(['SB-101', 'SB-104']);
  });

  it('kombiniert Scanner, Schweregrad und Status', () => {
    const results = selectFindings(createSeed(), {
      ...defaultFilters,
      scanner: 'sonar',
      severity: 'low',
      state: 'resolved',
    });
    expect(ids(results)).toEqual(['SB-105', 'SB-109']);
  });

  it('findet Advisory-IDs und Dateipfade', () => {
    const results = selectFindings(createSeed(), { ...defaultFilters, query: 'sca/package-lock CVE-2021' });
    expect(ids(results)).toEqual(['SB-101']);
  });

  it('gibt für widersprüchliche Filter eine leere Liste zurück', () => {
    const results = selectFindings(createSeed(), {
      ...defaultFilters,
      state: 'resolved',
      query: 'lodAsh',
    });
    expect(results).toEqual([]);
  });

  it('ordnet bei neuer Sortierung das Datum vor dem Schweregrad ein', () => {
    const results = selectFindings(createSeed(), { ...defaultFilters, sort: 'recent' });
    expect(ids(results).slice(0, 4)).toEqual(['SB-101', 'SB-102', 'SB-103', 'SB-104']);
  });

  it('sortiert gleiche Titel stabil nach ID', () => {
    const [first, second] = createSeed();
    const records = [{ ...second, title: 'Bericht' }, { ...first, title: 'Bericht' }];
    expect(ids(selectFindings(records, { ...defaultFilters, sort: 'title' }))).toEqual([first.id, second.id]);
  });
});

describe('Scanner-Vergleich', () => {
  it('zählt erledigte Funde und aktive Schweregrade getrennt', () => {
    expect(summarize(createSeed())).toEqual({
      status: { open: 5, review: 3, resolved: 2 },
      active: 8,
      highPriority: 2,
      shared: 3,
      distribution: { critical: 0, high: 2, medium: 3, low: 1, info: 2 },
    });
  });

  it('bildet leere Statistikgruppen weiterhin ab', () => {
    expect(summarize([]).distribution).toEqual({ critical: 0, high: 0, medium: 0, low: 0, info: 0 });
    expect(compareScanner([], 'snyk').total).toBe(0);
  });

  it('zählt individuelle und gemeinsame Einträge je Scanner', () => {
    expect(compareScanner(createSeed(), 'snyk')).toEqual({
      total: 4,
      unique: 1,
      shared: 3,
      pending: 4,
      categories: { dependency: 3, quality: 0, coverage: 0, configuration: 1 },
    });
  });

  it('zeigt einen Fund aus drei Scannern in jedem beteiligten Paar', () => {
    const findings = createSeed();
    expect(ids(overlapFor(findings, 'snyk', 'aikido'))).toEqual(['SB-101', 'SB-106', 'SB-110']);
    expect(ids(overlapFor(findings, 'snyk', 'sonar'))).toEqual(['SB-110']);
    expect(ids(overlapFor(findings, 'aikido', 'sonar'))).toEqual(['SB-110']);
  });
});

describe('CSV-Export', () => {
  it('schreibt deutsche Überschriften, UTF-8-Markierung und CRLF', () => {
    const csv = findingsCsv([]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"ID";"Titel";"Kategorie";"Schweregrad"');
    expect(csv.split('\r\n')).toHaveLength(2);
  });

  it('maskiert Anführungszeichen und Tabellenformeln', () => {
    const [example] = createSeed();
    const csv = findingsCsv([{ ...example, title: '  =1+1', owner: 'Team "QA"; Zürich' }]);
    expect(csv).toContain("\"'  =1+1\"");
    expect(csv).toContain('"Team ""QA""; Zürich"');
    expect(csv).toContain('"Snyk, Aikido"');
  });

  it('exportiert die Reihenfolge der übergebenen Treffer', () => {
    const [first, second] = createSeed();
    const [, row1, row2] = findingsCsv([second, first]).split('\r\n');
    expect(row1).toMatch(/^"SB-102"/);
    expect(row2).toMatch(/^"SB-101"/);
  });
});
