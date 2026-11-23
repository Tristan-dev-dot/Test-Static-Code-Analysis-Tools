import { describe, expect, it } from 'vitest';
import { createSeed } from '../src/domain/seed.js';
import { appendNote, changeFindingState, hydrateFindings, noteLimit, removeNote, serializeFindings } from '../src/domain/storage.js';
import { readRoute, routeHref } from '../src/hooks/useWorkspace.js';

const note = { id: 'note-1', body: 'Im nächsten Scan abgleichen.', createdAt: '2026-11-23T09:30:00Z' };

describe('Persistenz', () => {
  it('lädt die Beispieldaten bei fehlendem oder beschädigtem Speicher', () => {
    expect(hydrateFindings(null)).toEqual(createSeed());
    expect(hydrateFindings('{')).toEqual(createSeed());
    expect(hydrateFindings('{"version":2,"findings":[]}')).toEqual(createSeed());
  });

  it('behält Status und Notizen beim erneuten Laden', () => {
    const findings = appendNote(changeFindingState(createSeed(), 'SB-101', 'resolved'), 'SB-101', note);
    expect(hydrateFindings(serializeFindings(findings))).toEqual(findings);
  });

  it('übernimmt keine neuen IDs, Stammdaten oder ungültigen Notizen', () => {
    const records = {
      version: 1,
      findings: [
        {
          id: 'SB-101',
          title: 'Externer Titel',
          state: '__proto__',
          notes: [note, { ...note, id: 'broken', createdAt: 'kein Datum' }],
        },
        { id: 'SB-999', state: 'resolved' },
        null,
      ],
    };
    const hydrated = hydrateFindings(JSON.stringify(records));
    expect(hydrated).toHaveLength(10);
    expect(hydrated[0].title).toBe(createSeed()[0].title);
    expect(hydrated[0].state).toBe('open');
    expect(hydrated[0].notes).toEqual([note]);
  });
});

describe('Triage und Notizen', () => {
  it('bearbeitet nur den ausgewählten Befund', () => {
    const initial = createSeed();
    const current = changeFindingState(initial, 'SB-101', 'review');
    expect(current[0].state).toBe('review');
    expect(initial[0].state).toBe('open');
    expect(current[1]).toBe(initial[1]);
  });

  it('ignoriert Status ausserhalb des Katalogs', () => {
    const initial = createSeed();
    expect(changeFindingState(initial, 'SB-101', 'archived')).toBe(initial);
  });

  it('lehnt leere oder zu lange Notizen ab', () => {
    const initial = createSeed();
    expect(appendNote(initial, 'SB-101', { ...note, body: '   ' })).toBe(initial);
    expect(appendNote(initial, 'SB-101', { ...note, body: 'a'.repeat(noteLimit + 1) })).toBe(initial);
  });

  it('listet neueste Notizen zuerst und ignoriert doppelte IDs', () => {
    const first = appendNote(createSeed(), 'SB-101', note);
    const secondNote = { ...note, id: 'note-2', createdAt: '2026-11-23T09:45:00Z' };
    const second = appendNote(first, 'SB-101', secondNote);
    expect(second[0].notes).toEqual([secondNote, note]);
    expect(appendNote(second, 'SB-101', secondNote)[0]).toBe(second[0]);
  });

  it('löscht eine einzelne Notiz des ausgewählten Befunds', () => {
    const first = appendNote(createSeed(), 'SB-101', note);
    const withTwo = appendNote(first, 'SB-102', note);
    const updated = removeNote(withTwo, 'SB-101', note.id);
    expect(updated[0].notes).toEqual([]);
    expect(updated[1].notes).toEqual([note]);
  });
});

describe('Navigation', () => {
  it('behält die Vorauswahl beim Öffnen einer Scanner-Verknüpfung', () => {
    expect(readRoute(routeHref('findings', 'snyk'))).toEqual({ page: 'findings', scanner: 'snyk' });
  });

  it('ignoriert Scanner-Auswahlen auf anderen Seiten', () => {
    expect(routeHref('comparison', 'aikido')).toBe('#page=comparison');
    expect(readRoute('#page=guide&scanner=aikido')).toEqual({ page: 'guide', scanner: '' });
  });

  it('fällt für leere und unbekannte Routen auf die Übersicht zurück', () => {
    expect(readRoute('')).toEqual({ page: 'overview', scanner: '' });
    expect(readRoute('#page=__proto__')).toEqual({ page: 'overview', scanner: '' });
  });
});
