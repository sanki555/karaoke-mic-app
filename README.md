# EchoMic Pro – phone mic → Bluetooth speaker karaoke

React Native (Expo + dev client) app built from the Stitch project "Live Mic FX".
Design exports (HTML + screenshots) are in `design/`; the app is in `app/`.

Audio graph (`app/src/audio/engine.ts`, built on `react-native-audio-api`):

    mic → input gain ─┬─ dry ───────────────────────────┐
                      ├─ flanger (LFO-modulated delay) ─┼→ master → system output (BT speaker)
                      └─ reverb (convolver + damping) ──┘

Screens: Live Mic (volume, reverb, flanger toggle + intensity), FX Studio (rate, feedback, decay, damping), Devices (current route).
The Equalizer screen from the design is not implemented yet.

## Why a dev build, not Expo Go
`react-native-audio-api` is native code, so Expo Go cannot run it. Build a dev client once with `expo run:*`.

## Android (Windows)
1. Install Android Studio (SDK + platform-tools). Set `ANDROID_HOME` to the SDK folder and add `platform-tools` to PATH.
2. Enable USB debugging on the phone, plug it in, check `adb devices`.
3. ```
   cd app
   npm install
   npx expo run:android
   ```
4. Pair the speaker in Android Bluetooth settings, then tap the mic in the app.

## iPhone (MacBook)
1. Install Xcode (App Store), open it once, accept the license. Install CocoaPods (`brew install cocoapods`) and Node.
2. Copy the `app/` folder to the Mac, then:
   ```
   cd app
   npm install
   npx expo run:ios --device
   ```
3. On the iPhone: Settings → Privacy & Security → Developer Mode → on. In Xcode (`ios/*.xcworkspace`) → Signing & Capabilities, choose your Apple ID team (a free account works; the app expires after 7 days).
4. First launch: Settings → General → VPN & Device Management → trust your developer profile.
5. Pair the speaker in iOS Bluetooth settings, then tap the mic in the app.

## Notes
- Output goes wherever the OS routes audio, so pairing the speaker is all that is needed.
- Bluetooth adds ~100–250 ms latency. It cannot be removed in software; sing along to the speaker, not to your own ears. Wired or low-latency (aptX LL) speakers are better.
- Use headphones or keep the phone away from the speaker to avoid feedback howl.
- Android on a device with a Bluetooth headset connected may switch the input to that headset's mic.
