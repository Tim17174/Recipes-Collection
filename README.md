# iPhone Web App Test

Test-Setup, um eine "App" ohne Mac zu bauen: eine Web-App (PWA), gehostet auf GitHub Pages,
die sich auf dem iPhone über Safari installieren lässt ("Zum Home-Bildschirm").

**Wichtig:** Das ist keine native App aus dem App Store, sondern eine Progressive Web App (PWA).
Sie läuft im Vollbild wie eine App, mit eigenem Icon auf dem Home-Bildschirm, aber ohne Xcode/Mac/App-Store-Review.
Für eine echte native App später gäbe es Cloud-Build-Dienste (z. B. Expo/EAS), die auch ohne Mac bauen können.

## Setup

1. Auf GitHub ein neues, leeres Repository anlegen (ohne README/gitignore).
2. Lokal:
   ```
   git remote add origin <REPO-URL>
   git push -u origin main
   ```
3. Im Repo unter Settings → Pages → "Deploy from a branch" → Branch `main`, Ordner `/ (root)` auswählen.
4. Nach ein bis zwei Minuten ist die Seite unter `https://<user>.github.io/<repo>/` erreichbar.
5. Auf dem iPhone in Safari öffnen, Teilen-Button → "Zum Home-Bildschirm".
