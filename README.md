# Rezept-Scanner

iPhone-"App" ohne Mac: eine Web-App (PWA), die Kochbuchseiten fotografiert, den Inhalt per Claude
Vision in Titel/Zutaten/Zubereitung extrahiert und als Kärtchen darstellt. Installierbar auf dem
iPhone über Safari ("Zum Home-Bildschirm").

**Wichtig:** Das ist keine native App aus dem App Store, sondern eine Progressive Web App (PWA).
Sie läuft im Vollbild wie eine App, mit eigenem Icon auf dem Home-Bildschirm, aber ohne Xcode/Mac/App-Store-Review.
Der Vollbild-Effekt funktioniert auf iOS nur in Safari.

## Architektur

- Statisches Frontend (`index.html`) — Kamera-Aufnahme, Bildverkleinerung im Browser, Kärtchen-Darstellung, Sammlung in `localStorage`
- Serverfunktion (`netlify/functions/extract-recipe.js`) — ruft die Anthropic API (Claude) mit dem Foto auf und liefert strukturiertes JSON zurück
- Gehostet auf **Netlify** (nicht GitHub Pages, da GitHub Pages keine Serverfunktionen kann — der API-Key muss serverseitig verborgen bleiben)

## Setup

1. Anthropic API-Key erstellen: [console.anthropic.com](https://console.anthropic.com) → Account anlegen → *Settings → API Keys → Create Key*.
2. Auf [app.netlify.com](https://app.netlify.com) mit GitHub anmelden → *Add new site → Import an existing project* → dieses Repo auswählen.
3. Build-Einstellungen leer lassen (kein Build-Command, Publish directory `.` — steckt schon in `netlify.toml`).
4. In den Netlify Site-Settings → *Environment variables* → `ANTHROPIC_API_KEY` mit dem eigenen Key anlegen.
5. Deploy abwarten, dann die Netlify-URL auf dem iPhone in Safari öffnen und über den Teilen-Button **"Zum Home-Bildschirm"** hinzufügen.

## Lokale Entwicklung

Ohne Netlify CLI kann die Serverfunktion nicht lokal getestet werden — Änderungen am Frontend lassen
sich aber direkt als Datei im Browser öffnen (die Kamera-Funktion braucht dafür kein HTTPS im Simulator,
wohl aber auf dem echten iPhone).
