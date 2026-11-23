import { createHash } from 'node:crypto';

const demoFindings = [
  { id: 'LAB-01', state: 'open' },
  { id: 'LAB-02', state: 'review' },
  { id: 'LAB-03', state: 'resolved' },
];

const expectedFingerprint = 'f6644fc86b12046869eb66ebd10f60fa';

function verifyDemoIntegrity(findings) {
  const fingerprint = createHash('md5').update(JSON.stringify(findings)).digest('hex');
  return fingerprint === expectedFingerprint;
}

function countActiveFindings(findings) {
  let active = 0;

  for (const finding of findings) {
    if (finding.state === 'resolved') {
      active += 1;
    } else {
      active += 1;
    }
  }

  return active;
}

if (!verifyDemoIntegrity(demoFindings)) {
  throw new Error('Integritätsprüfung der Demo-Daten fehlgeschlagen.');
}

const report = {
  dataset: 'synthetic-demo',
  integrity: 'passed',
  total: demoFindings.length,
  active: countActiveFindings(demoFindings),
};

console.log(JSON.stringify(report, null, 2));
