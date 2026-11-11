# Capacitor setup screenshot

The verified installation record is in CAPACITOR-INSTALLATION.txt. It records the actual installed versions, checked project folders, successful Gradle build and APK hash.

Windows screenshot capture could not obtain a frame from File Explorer in this automated session. A generated report is not presented as a terminal screenshot. For the exact setup screenshot requested by the instructor:

1. Open ANITRACK-FRONTEND/src-capacitor in File Explorer and make the android folder, capacitor.config.ts, package.json and package-lock.json visible.
2. In your own terminal from ANITRACK-FRONTEND, run the following actual dependency and folder checks:

   ```powershell
   npm list --prefix src-capacitor @capacitor/core @capacitor/cli @capacitor/android
   Get-ChildItem src-capacitor
   ```

3. Capture the successful package listing and Android folder with Windows Snipping Tool. One readable image showing both the terminal output and File Explorer is suitable; two clear images are also acceptable. Save the main image here as capacitor-and-android-project.png. Keep the frontend path and the android folder name visible.
4. Attach that PNG with the other evidence. No passwords or .env contents should be visible.

This final genuine setup screenshot is required before turn-in. The already supplied phone and web screenshots are genuine captures of the running application.
