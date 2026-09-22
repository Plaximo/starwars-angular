# 🌌 Star Wars Galactic Archives (Holocron)

Eine moderne Angular-Webanwendung zur Erkundung, Filterung und Verwaltung von Helden und Legenden aus dem Star Wars-Universum (SWAPI). Entwickelt als Coding-Challenge für Medienwerft.

---

## 🚀 Setup & Ausführung

### Voraussetzungen

- **Node.js** (v18+)
- **npm** (v9+)

### Installation & Start

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Entwicklungsserver starten
npm start
# -> Applikation öffnet unter http://localhost:4200/

# 3. Production Build erstellen
npm run build

# 4. E2E-Test ausführen (Playwright)
npm run e2e
```

---

## 📋 Anforderungen & Umsetzungsstatus

### 🎯 Kernanforderungen (Pflichtaufgaben)

- [x] **Eine Übersicht über die Daten, die auch bei größeren Mengen benutzbar bleibt.**
  > _Umsetzung_: Responsive Kartenansicht mit Lade-Skeletons sowie Angular CDK Virtual Scrolling in der Split-Ansicht für performantes Rendern ohne DOM-Überlastung.
- [x] **Suchen, Filtern und Sortieren – frei kombinierbar und reproduzierbar (URL-Sync).**
  > _Umsetzung_: Live-Volltextsuche, Geschlechter-Filter und 4 Sortierfelder (Name, Größe, Gewicht, Geburtsjahr). Alle Filter sind bidirektional mit der Browser-URL synchronisiert (`?search=...&gender=...&sortBy=...&sortDir=...&favorites=...`) und über geteilte Links exakt reproduzierbar.
- [x] **Eine Detailansicht, die die Verknüpfungen eines Datensatzes auflöst und nachvollziehbar macht.**
  > _Umsetzung_: Dedizierte Seite (`/people/:id`) sowie Split-Dossier. Löst asynchron die Heimatwelt (`Planet`) sowie geflogene Raumschiffe (`Starships`) auf und visualisiert alle Attribute.
- [x] **Anlegen, Bearbeiten und Löschen eigener Einträge ohne die API.**
  > _Umsetzung_: Interaktives Modal-Formular mit Feldvalidierung. Eigene Charaktere werden hervorgehoben (`Custom`-Badge) und können vollumfänglich editiert und gelöscht werden.
- [x] **Eigene Einträge überdauern einen Reload und fügen sich konsistent ein.**
  > _Umsetzung_: Persistierung in `localStorage` (`sw_custom_people_v1`). Eigene Einträge werden nahtlos in Such-, Filter- und Sortier-Pipelines integriert.
- [x] **Mindestens eine zweite Entität neben den Personen, sinnvoll mit der ersten verbunden.**
  > _Umsetzung_: Planeten (`Planet`) als Heimatwelt aufgelöst (zusätzlich Raumschiffe als 3. Entität). Eigener Tab für Planeten in der Kopfzeile vorhanden.
- [x] **Eine Möglichkeit, einzelne Einträge dauerhaft zu merken und getrennt anzuzeigen.**
  > _Umsetzung_: Favoriten-/Lesezeichen-System (Stern-Icon). Persistiert in `localStorage` (`sw_bookmarked_people_ids`) und per Schnellfilter ("Gemerkt") mit eigenem Empty-State filterbar.

### 🎨 Gestaltung

- [x] **Fertig ausgestaltete, konsistente Oberfläche.**
  > _Umsetzung_: Hochwertiges Star Wars Sci-Fi Dark-Mode UI mit Tailwind CSS v4, Gold-/Amber-Akzenten, Glassmorphism, dezenten Hover-Animationen und fehlerresistentem Layout.

### 🌟 Optionale Erweiterungen (Alle umgesetzt!)

- [x] **Side-by-side-Ansicht von Liste und Detail mit synchronisiertem Routing**
  > _Umsetzung_: Aufrufbar über `/people-side-by-side` bzw. `/people-side-by-side/:id`. Selektion und URL-Parameter bleiben vollständig synchron.
- [x] **Optimistic Updates mit Rollback im Fehlerfall**
  > _Umsetzung_: Sofortiges UI-Feedback bei Mutationen; bei Netzwerkfehlern (simulierbar über das Netzwerk-Panel) erfolgt ein automatisches Rollback auf den vorherigen Snapshot inklusive Fehler-Toast.
- [x] **Undo für das Löschen eines Eintrags**
  > _Umsetzung_: Nach dem Löschen erscheint ein schwebender Toast mit 6-Sekunden-Countdown, der den Datensatz mit einem Klick vollständig wiederherstellt.
- [x] **Virtual Scrolling über die vollständige Liste**
  > _Umsetzung_: Realisiert mit `@angular/cdk/scrolling` (`cdk-virtual-scroll-viewport`) für verzögerungsfreies Scrollen mit 60 FPS.
- [x] **Offline-Verfügbarkeit bereits geladener Daten**
  > _Umsetzung_: Automatischer lokaler Cache (`repository-cache.utils.ts`). Bei Offline-Status (Netzwerk-Toggle im Header) greift die App transparent auf gecachte Daten zurück.
- [x] **Ein E2E-Test für einen Kernflow**
  > _Umsetzung_: Playwright-Test (`e2e/core-flow.spec.ts`), der Startseite ➔ Live-Suche ➔ Detail-Navigation ➔ Rücksprung in unter 1 Sekunde testet (`npm run e2e`).
- [x] **Mehrsprachigkeit (de/en) oder Dark Mode**
  > _Umsetzung_: Vollständige zweisprachige Lokalisierung (Deutsch / Englisch) per Signal-basiertem `TranslationService` und Sprachumschalter im Header (inklusive `localStorage`-Speicherung). Zusätzlich ist die gesamte App in einem maßgeschneiderten Dark Mode gestaltet.

## 🏛️ Aufbau & Architekturentscheidungen

1. **Angular Standalone & Signal-Architektur**:
   - Durchgängiger Verzicht auf veraltete NgModules.
   - Konsequenter Einsatz von **Angular Signals** (`signal`, `computed`, `input`, `output`) für maximale Performance und Zero-Zone-Overhead.
2. **ViewModel & Dumb-Component Pattern**:
   - Trennung von Präsentation und Business-Logik: Komponenten (`PeopleHeader`, `PeopleFilterBar`, `PeopleListItem`) sind reine Presentational ("Dumb") Components.
   - State, Query-Param-Synchronisation und Datenflüsse werden in dedizierten ViewModels (`PeopleListViewModel`, `PeopleDetailViewModel`) gebündelt.
3. **Optimistische Updates & Rollback**:
   - Sofortiges UI-Feedback bei Anlage, Bearbeitung und Löschung von Einträgen.
   - Automatisches Rollback auf den vorherigen Snapshot im Fehlerfall inkl. sichtbarer Banner-Benachrichtigung und Undo-Option.
4. **Split Master-Detail Ansicht (`/people-side-by-side`)**:
   - Synchronisiertes URL-Routing (`/people-side-by-side/:id`) mit Erhalt aller aktiven Filter-/Sortierparameter.
   - Schnelles **Angular CDK Virtual Scrolling** für flüssige 60 FPS bei großen Listen.
5. **Offline-Verfügbarkeit & Caching**:
   - Automatischer lokaler Cache geladener Entitäten; nahtlose Weiternutzung bei simuliertem oder echtem Verbindungsverlust.
6. **Mehrsprachigkeit (DE / EN)**:
   - Reaktiver `TranslationService` mit `localStorage`-Persistenz und Sprachumschalter `[ 🇩🇪 DE | 🇬🇧 EN ]` im Header ohne Page-Reload.
