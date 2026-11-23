import { useState } from 'react';
import { ArrowUpRight, Check, Clipboard, Terminal } from 'lucide-react';
import { PageHeading, Panel, ScannerMark, SectionHeading } from '../components/Ui.jsx';
import { scanners } from '../domain/catalog.js';

const workflows = [
  {
    id: 'snyk',
    instruction: 'Importiere das Repository in Snyk oder verwende die authentifizierte CLI. Der Dependency-Scan erfasst bei Bedarf auch das verschachtelte npm-Projekt.',
    commands: 'snyk test --all-projects\nsnyk code test',
    url: 'https://docs.snyk.io/developer-tools/snyk-cli/commands/test',
  },
  {
    id: 'aikido',
    instruction: 'Verbinde GitHub in Aikido und gib der GitHub-App Zugriff auf dieses Repo. Prüfe im ersten Bericht, ob die verschachtelte npm-Lockdatei aufgenommen wurde.',
    url: 'https://help.aikido.dev/code-scanning/connect-your-source-code/connect-github-account-to-aikido',
  },
  {
    id: 'sonar',
    instruction: 'Erstelle das Projekt in SonarQube und setze SONAR_HOST_URL und SONAR_TOKEN lokal. Der Scanner liest die Projektdatei und den erzeugten LCOV-Bericht.',
    commands: 'npm ci\nnpm run coverage\nsonar-scanner',
    url: 'https://docs.sonarsource.com/sonarqube-server/2026.1/analyzing-source-code/test-coverage/javascript-typescript-test-coverage',
  },
];

const comparisonSteps = [
  ['Commit festhalten', 'Notiere den Commit-SHA und den Zeitpunkt jedes Laufs.'],
  ['Scan-Umfang abgleichen', 'Halte den Branch, die aktivierten Scanner und den Umgang mit Entwicklungsabhängigkeiten fest.'],
  ['Abhängigkeit prüfen', 'Suche den Lodash-Befund anhand der Advisory-ID CVE-2021-23337 und des Pfads fixtures/sca/package-lock.json.'],
  ['Qualitätsdaten erfassen', 'Dokumentiere in SonarQube das Quality Gate und die importierte Coverage. Vergleiche die angezeigte Coverage mit dem LCOV-Export.'],
];

function CommandBlock({ command }) {
  const [result, setResult] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setResult('Kopiert');
    } catch {
      setResult('Markiere den Text, um ihn zu kopieren.');
    }
  }

  return (
    <div className="command-block">
      <div className="command-top">
        <span><Terminal size={15} aria-hidden="true" /> Terminal</span>
        <button className="text-button" type="button" onClick={copy}>
          {result === 'Kopiert' ? <Check size={15} aria-hidden="true" /> : <Clipboard size={15} aria-hidden="true" />}
          {result === 'Kopiert' ? 'Kopiert' : 'Kopieren'}
        </button>
      </div>
      <pre><code>{command}</code></pre>
      <span className={result === 'Kopiert' ? 'sr-only' : 'copy-feedback'} role="status">{result}</span>
    </div>
  );
}

export function Guide() {
  return (
    <>
      <PageHeading title="Testanleitung" description="Führe die drei Analysen mit demselben Git-Commit aus." />
      <div className="guide-grid">
        <div className="workflow-list">
          {workflows.map(({ id, instruction, commands, url }) => (
            <Panel className="workflow-panel" key={id}>
              <div className="workflow-title">
                <ScannerMark id={id} />
                <h2>{scanners[id].label}</h2>
              </div>
              <p>{instruction}</p>
              {commands && <CommandBlock command={commands} />}
              <a className="text-link" href={url}>Anbieter-Dokumentation <ArrowUpRight size={15} aria-hidden="true" /></a>
            </Panel>
          ))}
        </div>
        <Panel className="checklist-panel">
          <SectionHeading title="Vergleichsprotokoll" />
          <ol className="guide-checklist">
            {comparisonSteps.map(([label, description]) => (
              <li key={label}><strong>{label}</strong><p>{description}</p></li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}
