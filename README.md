# Scanboard

Scanboard ist eine React-Demo für den Vergleich von Snyk, Aikido und SonarQube. Die Oberfläche zeigt einen festen Beispieldatensatz mit Filtern, Triage, lokalen Notizen, CSV-Export und einem Vergleich der Scanner-Zuordnungen.

## Lokal starten

Voraussetzung ist Node.js 20.19 oder Node.js ab 22.12.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run coverage
npm run build
```

Vitest schreibt bei `npm run coverage` die LCOV-Datei nach `coverage/lcov.info`. `npm run build` erzeugt den Produktionsbuild in `dist/`.

## Scanner vergleichen

Notiere vor jedem Lauf den Commit mit `git rev-parse HEAD` und halte Branch, Scanoptionen und aktivierte Produkte im Ergebnis fest. Die Oberfläche arbeitet mit Beispieldaten und speichert Änderungen im Browser. Für den Vergleich zählen die Befunde in den jeweiligen Scanner-Berichten.

### Snyk

Importiere das GitHub-Repo in Snyk oder führe nach der CLI-Anmeldung im Projektordner die folgenden Befehle aus.

```sh
snyk test --all-projects
snyk code test
```

Prüfe im Dependency-Scan beide npm-Manifeste. Falls die automatische Suche das verschachtelte Manifest überspringt, führe die Dependency-Analyse direkt im Ordner `fixtures/sca` aus. [Snyk CLI](https://docs.snyk.io/developer-tools/snyk-cli/commands/test)

### Aikido

Verbinde GitHub in Aikido und erteile der GitHub-App Zugriff auf `Tristan-dev-dot/myaikidosecuretytestrepo`. Wähle das Repository aus und prüfe im Scan, ob die verschachtelte Lockdatei als Abhängigkeitsprojekt erfasst ist. [Aikido GitHub-Integration](https://help.aikido.dev/code-scanning/connect-your-source-code/connect-github-account-to-aikido)

### SonarQube

Erstelle ein Projekt mit dem Schlüssel `myaikidosecuretytestrepo` oder passe den Schlüssel in `sonar-project.properties` an. Setze `SONAR_HOST_URL` und `SONAR_TOKEN` in deiner lokalen Umgebung und führe mit installiertem SonarScanner CLI den Lauf aus.

```sh
npm ci
npm run coverage
sonar-scanner
```

Die Konfiguration ordnet `src/` dem Quellcode und `test/` den Tests zu. Die Analyse importiert den vorher erzeugten LCOV-Bericht. Bei SonarQube Cloud verwende den generierten Projektschlüssel und die Organisation aus dem Cloud-Setup. [SonarQube JavaScript-Coverage](https://docs.sonarsource.com/sonarqube-server/2026.1/analyzing-source-code/test-coverage/javascript-typescript-test-coverage)

## Erwarteter Abhängigkeitsbefund

`fixtures/sca/` enthält ein eigenständiges npm-Manifest mit Lockdatei für `lodash@4.17.20`. Die Fixture dient der statischen Abhängigkeitsanalyse und gehört nicht zum Installationsbaum oder zum Build der React-App. Suche im Bericht nach dem Paket, dem Pfad zur Lockdatei und der Advisory-ID `CVE-2021-23337`. Je nach Feed können weitere Advisories für dieselbe Paketversion erscheinen. [GitHub Advisory](https://github.com/advisories/GHSA-35jh-r3h4-6jhm)

## Absichtliche Befunde im Demo-Bericht

`npm run lab:report` prüft drei fest eingebaute Beispielbefunde und gibt einen JSON-Bericht aus. Das Skript läuft lokal mit Node.js und verwendet ausschliesslich synthetische Daten. SonarQube erfasst die Datei über den bestehenden Analysepfad `src/`.

| Testfall | Stelle in `src/lab/demo-report.js` | Erwarteter Befund |
| --- | --- | --- |
| LAB-SEC-01 | `verifyDemoIntegrity` | Die Integritätsprüfung verwendet MD5. MD5 ist nicht kollisionsresistent und ist daher für eine sicherheitsrelevante Integritätsprüfung ungeeignet. Für echte Berichte wäre eine digitale Signatur mit vertrauenswürdigem Prüfschlüssel geeignet. [CWE-328](https://cwe.mitre.org/data/definitions/328.html) |
| LAB-BUG-01 | `countActiveFindings` | Beide Zweige erhöhen den Zähler. Der Bericht gibt `active: 3` aus, obwohl nur zwei Befunde aktiv sind. Die Korrektur zählt ausschliesslich Einträge mit einem anderen Status als `resolved`. |

- Starte für **Snyk Code** `snyk code test` im Repo und suche im Ergebnis nach `src/lab/demo-report.js` und einem Hinweis auf schwaches Hashing. [Snyk Code CLI](https://docs.snyk.io/developer-tools/snyk-cli/commands/code-test)
- Starte in **Aikido** einen Repository-Scan mit SAST und suche nach derselben Datei und Schwachstelle. [Aikido SAST](https://help.aikido.dev/code-scanning/scanning-practices)
- Prüfe in **SonarQube** die Security Hotspots auf `javascript:S4790` und die Issues auf `javascript:S3923`. Die Regeln müssen im verwendeten Qualitätsprofil aktiv sein. [SonarJS-Regelliste](https://github.com/SonarSource/SonarJS/blob/master/packages/analysis/src/jsts/rules/README.md)

Die lokale Prüfung mit dem ESLint-Plugin SonarJS meldete schwaches Hashing in Zeile 12 und identische Zweige in Zeile 20. Halte für die Repository-Scans je Testfall Scanner, Commit, Fundstelle, Regel-ID und Ergebnis fest. Wenn ein Treffer fehlt, prüfe die indexierten Dateien und aktiven Regeln. Der separate Lodash-Testfall oben prüft die Abhängigkeitsanalyse.
