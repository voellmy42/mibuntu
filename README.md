# Mibuntu - Die Plattform für Lehrpersonen

Mibuntu ist eine Webapplikation, die Schweizer Lehrpersonen und Schulen verbindet. Sie bietet eine KI-gestützte Unterrichtsplanung und einen Marktplatz für Stellvertretungen.

## Features

### 1. KI-Unterrichtsplaner
- Erstellung von Lektionsplänen basierend auf Lehrplan 21.
- Upload eigener PDF-Lehrmittel.
- Chat-Interface zur Verfeinerung der Planung.

### 2. Marktplatz für Stellvertretungen
- **Für Schulen**: Inserate aufgeben und Bewerbungen verwalten.
- **Für Lehrpersonen**: Gezielte Stellensuche nach Kanton, Stufe und Fächern.
- **Bewerbungsprozess**:
  - Direktes Bewerben via App.
  - Privater Austausch von Kontaktdaten (Telefon, CV) bei Bewerbung.
  - Automatisches Schliessen von Inseraten bei akzeptierter Bewerbung ("Besetzt").

### 3. Benutzerprofile & Sicherheit
- Rollenbasierter Zugang (Lehrperson / Schulleitung).
- Sicherer CV-Upload (Firebase Storage).
- Authentifizierung via Google.

## Installation & Entwicklung

Voraussetzungen: Node.js und npm installiert.

1. **Repository klonen**
   ```bash
   git clone <repo-url>
   cd mibuntu
   ```

2. **Frontend einrichten**
   ```bash
   cd frontend
   npm install
   ```

3. **Lokalen Server starten**
   ```bash
   npm run dev
   ```
   Die App ist nun unter `http://localhost:5173` erreichbar.

## Deployment (Firebase)

Das Projekt ist für Firebase Hosting konfiguriert.

1. **Build erstellen**
   ```bash
   cd frontend
   npm run build
   ```
   Dies erstellt den optimierten Code im Ordner `frontend/dist`.

2. **Deployen**
   Stellen Sie sicher, dass Sie im Hauptverzeichnis (`mibuntu`) sind:
   ```bash
   firebase deploy
   ```
   Dies lädt die *Firestore Rules*, *Storage Rules* und das *Hosting* (aus `frontend/dist`) hoch.

## Projektstruktur

- `/frontend`: React-App (Vite, TypeScript).
- `/firestore.rules`: Sicherheitsregeln für die Datenbank.
- `/storage.rules`: Sicherheitsregeln für Datei-Uploads (CVs).
- `/firebase.json`: Konfiguration für Hosting & Rules.
