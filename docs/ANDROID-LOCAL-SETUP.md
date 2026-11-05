# AniTrack on a physical Android phone

The website and Android APK use the same Vue/Quasar pages and Express/PostgreSQL backend. Capacitor bundles the compiled pages in an Android project; it does not bundle the backend or database into the APK.

The tested device is an Infinix Note 30 (X6833B), Android 14. The local APK is a development build for a laptop and phone on the same trusted Wi-Fi. Keep the laptop awake, the API and website running, and Internet access available for Neon, Kitsu, Gemini and Gmail SMTP. It is not an Internet-hosted release.

## One-time tooling

Install Android Studio, JDK 21, Android SDK platform 36, build-tools 35/36 and platform-tools. Use JDK 21 for the current Gradle 8.14.3 wrapper, even if Android Studio bundles a newer JDK. Do not commit signing keys or local.properties.

From the frontend:

```powershell
npm ci
npm ci --prefix src-capacitor
```

## Local networking

Find the laptop's current Wi-Fi IPv4 address with `ipconfig`. Use that address in the following examples in place of `YOUR_LAPTOP_IP`; localhost in an Android APK refers to the phone.

Frontend .env:

```dotenv
VITE_API_URL=
ANITRACK_DEV_HOST=0.0.0.0
VITE_MOBILE_API_URL=http://YOUR_LAPTOP_IP:3001/api
```

Backend .env (retain all existing private credentials):

```dotenv
CLIENT_ORIGIN=http://localhost:5173
ACCOUNT_LINK_ORIGIN=http://YOUR_LAPTOP_IP:5173
```

ACCOUNT_LINK_ORIGIN selects the web address in verification and reset emails and trusts only that exact browser origin. This keeps localhost working while allowing a phone's browser to complete an email link. Restart the backend after changing environment values. Open the web app at `http://localhost:5173` on the laptop or `http://YOUR_LAPTOP_IP:5173` on the phone. Allow only the development ports you need on your trusted private Wi-Fi if Windows prompts; do not expose them to the public Internet.

Run `npm run dev` separately in both repositories. Check `http://YOUR_LAPTOP_IP:3001/api/health` from the phone. The expected result is `{"status":"ok"}`. Install a newly rebuilt APK if the laptop's IP changes. A stable hosted HTTPS backend is a separate release option.

## Build the installable APK

```powershell
$env:JAVA_HOME='C:\Program Files\Microsoft\jdk-21.0.13.21-hotspot'
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT=$env:ANDROID_HOME
npm run prepare:android
cd src-capacitor/android
.\gradlew.bat --no-daemon --max-workers=1 '-Dorg.gradle.jvmargs=-Xmx1024m -XX:MaxMetaspaceSize=384m -Dfile.encoding=UTF-8' assembleDebug
```

The result is `src-capacitor/android/app/build/outputs/apk/debug/app-debug.apk`. Asset compilation is not itself an APK build. Stop the regular frontend dev server while compiling Quasar assets, then restart it; web and native builds share generated .quasar files.

The supplied debug APK uses the standard development signing key. Production distribution requires your own protected signing key and an HTTPS VITE_MOBILE_API_URL. Existing release guards reject HTTP; do not remove them.

## Install without a USB cable

With both devices on the same Wi-Fi, enable the phone's Developer options and Wireless debugging. Use its Pair device with pairing code screen:

```powershell
adb pair PHONE_IP:PAIRING_PORT
# Enter the temporary code locally when prompted.
adb connect PHONE_IP:DEBUGGING_PORT
adb devices -l
adb -s PHONE_IP:DEBUGGING_PORT install -r PATH_TO_APK
```

The pairing port and connection port are different and can change. Do not commit a pairing code. The final Wi-Fi API route does not require adb reverse. Wireless debugging can be disabled after installation.

## Account flow

Register with your own email, open the verification link, press Verify email, then return to the APK and press I've verified my email. Pending accounts cannot open any workspace feature. Password reset links open the reachable web form; sign in to the APK with the new password after resetting it. No password belongs in a submission document.

The launcher and splash screen use the same red torii mark as the website. Regenerate native icons from the canonical SVG with `npm run icons:android` when the brand mark changes.
