# AniTrack instructor procedure verification

Verification date: November 6, 2026  
Application: AniTrack, org.anitrack.app  
Physical device: Infinix Note 30, Android 14

## Verification results

| Step | Requirement | Recheck result | Disposition |
| --- | --- | --- | --- |
| 1 | Node, npm, Quasar CLI, Java, Android Studio and SDK | Node v26.13.0; npm 12.2.1; project-local Quasar app-vite 3.10.3; Microsoft OpenJDK 21.0.13.0.2. Android Studio executable build 262.10968.63.0-AI, SDK platform 36, build-tools 36 and ADB 37.0.1 are installed. | Verified |
| 2 | Existing frontend opens and runs | package.json and quasar.config.ts exist. Website returned HTTP 200; API database health returned ok. The frontend was stopped during prior Quasar asset preparation and restored for normal operation. | Verified |
| 3 | Capacitor mode is added once with actual project details | Existing src-capacitor/capacitor.config.ts and Android project identify org.anitrack.app and AniTrack. The mode was not added a second time. | Existing setup verified |
| 4 | Installed Capacitor packages use compatible major versions | Fresh npm list: core 8.5.3, CLI 8.6.0, Android 8.5.3. All use major version 8. | Verified |
| 5 | Prepare the native Android project | src-capacitor/android exists and its configuration is accepted by Gradle. The local debug workflow used npm run prepare:android, which compiles and synchronizes debug assets before direct APK assembly. Android Studio was installed; the exact --ide command was not replayed. | Equivalent debug workflow documented |
| 6 | Assemble an APK and obtain BUILD SUCCESSFUL | A fresh offline incremental assembleDebug completed successfully in 38 seconds. All 123 tasks were up-to-date. app/build/outputs/apk/debug/app-debug.apk exists and its checksum matches the packaged copy. | Verified |
| 7 | Install the APK on a physical Android phone | ADB confirmed the installed org.anitrack.app package on the Infinix. The installed base APK has the same SHA-256 as the submitted APK. Installation used the paired wireless connection because a USB cable was unavailable. | Wireless ADB adaptation documented |
| 8 | Startup, pages, forms, navigation and API work | A fresh launch returned Status ok. Native Capacitor HTTP returned 200 and health ok. Login and recovery forms opened; the information menu opened and dismissed correctly. The viewport remained 360px without horizontal overflow. Full feature and account test results retain their original dates in the report. | Fresh smoke check and recorded feature evidence verified |

## Commands and adaptations

The environment checks executed the project tools corresponding to node -v, npm -v, quasar -v and java -version. The Quasar CLI is provided by the installed frontend dependency tree. JDK 21 was selected for the Gradle shell.

The instructor's Windows wrapper command should be written as:

```powershell
.\gradlew.bat assembleDebug
```

The pasted .\gradlew\.bat contains an extra directory separator. The recheck used the real wrapper with low-memory and offline flags:

```powershell
.\gradlew.bat --offline --no-daemon --max-workers=1 `
  '-Dorg.gradle.jvmargs=-Xmx1024m -XX:MaxMetaspaceSize=384m -Dfile.encoding=UTF-8' `
  assembleDebug
```

The existing local debug preparation command expands to a Quasar Capacitor Android build with --debug and --skip-pkg. Gradle then packages the native project. This preserves the local API configuration and does not claim that the production IDE-opening command was executed.

The instructor's adb -d command selects a USB device. This project used adb -s with the already paired Wi-Fi device instead. The generated APK and physical-phone outcome are the same assessment artifacts; the connection method is different.

## Build identity and scope

APK: AniTrack-1.0-local-debug.apk  
SHA-256: c698faa3effbb2f9915123f65d7d1f4d0906774121e70f074731b10aafe6bb4f

The submitted, freshly verified build output and installed base APK were compared. No test account was created and no account data was changed during this recheck. The native startup was a successful hot launch; earlier lifecycle and feature coverage is recorded separately.

GRADLE-RECHECK.txt contains actual console output. INSTRUCTOR-VERIFICATION.json contains the corresponding environment and smoke-check records. These are text records, not screenshots of a terminal.

The required genuine desktop Capacitor installation/project-folder screenshot and the user's personal Gmail verification/reset receipt check remain pending. See CAPTURE-INSTRUCTIONS.md for the screenshot procedure. No hosted deployment was performed.
