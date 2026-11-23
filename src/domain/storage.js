import { states } from './catalog.js';
import { createSeed } from './seed.js';

export const storageKey = 'scanboard-workspace-v1';
export const noteLimit = 500;

function validNote(note) {
  return note &&
    typeof note.id === 'string' &&
    typeof note.body === 'string' &&
    note.body.trim().length > 0 &&
    note.body.length <= noteLimit &&
    typeof note.createdAt === 'string' &&
    Number.isFinite(Date.parse(note.createdAt));
}

export function hydrateFindings(raw) {
  const findings = createSeed();

  try {
    const payload = JSON.parse(raw);
    if (payload?.version !== 1 || !Array.isArray(payload.findings)) return findings;

    const saved = new Map(payload.findings
      .filter((record) => record && typeof record.id === 'string')
      .map((record) => [record.id, record]));

    return findings.map((finding) => {
      const record = saved.get(finding.id);
      if (!record) return finding;

      return {
        ...finding,
        state: Object.hasOwn(states, record.state) ? record.state : finding.state,
        notes: Array.isArray(record.notes) ? record.notes.filter(validNote).slice(0, 100) : [],
      };
    });
  } catch {
    return findings;
  }
}

export function serializeFindings(findings) {
  return JSON.stringify({
    version: 1,
    findings: findings.map(({ id, state, notes }) => ({ id, state, notes })),
  });
}

export function changeFindingState(findings, id, state) {
  if (!Object.hasOwn(states, state)) return findings;
  return findings.map((finding) => finding.id === id ? { ...finding, state } : finding);
}

export function appendNote(findings, findingId, note) {
  if (!validNote(note)) return findings;

  return findings.map((finding) => {
    if (finding.id !== findingId || finding.notes.some(({ id }) => id === note.id)) return finding;
    return { ...finding, notes: [note, ...finding.notes].slice(0, 100) };
  });
}

export function removeNote(findings, findingId, noteId) {
  return findings.map((finding) => finding.id === findingId
    ? { ...finding, notes: finding.notes.filter(({ id }) => id !== noteId) }
    : finding,
  );
}
