# Cylinder Angle Template Generator

Ein professionelles Werkzeug zur Berechnung und Erstellung von 1:1 Markierungsschablonen für zylindrische Objekte.

## Features
- **Präzise Berechnung**: Umfang und Markierungsabstände basierend auf dem Durchmesser.
- **1:1 PDF Export**: Erzeugt maßstabsgetreue Schablonen (A4/A3).
- **Apple Glass UI**: Modernes Design für iPhone und Web.
- **PWA Support**: Kann als App auf dem Handy installiert werden.
- **Offline-fähig**: Funktioniert auch ohne Internetverbindung.

## Lokale Installation
1. Repository klonen.
2. `npm install` ausführen.
3. `npm run dev` zum Starten des Entwicklungsservers.

## Deployment auf GitHub Pages
1. Erstelle ein neues Repository auf GitHub.
2. Pushe deinen Code in den `main` Branch.
3. Installiere das Paket für GitHub Pages: `npm install gh-pages --save-dev`.
4. Füge folgende Zeilen in deine `package.json` ein:
   ```json
   "homepage": "https://dein-username.github.io/dein-repo-name",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
5. Führe `npm run deploy` aus.

## Wichtiger Hinweis zum Drucken
Stelle sicher, dass beim Drucken der PDF-Schablone die Option **"Tatsächliche Größe"** (100%) gewählt ist, damit der Maßstab 1:1 erhalten bleibt.
