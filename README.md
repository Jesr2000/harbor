# Harbor

A free, private companion for loneliness, low mood and low self-worth. Everything stays on the phone: no account, no tracking, no paywall. Harbor is a support tool, not therapy, and it lists crisis helplines.

## Get the app
- **Android:** open the latest [Release](../../releases/latest) on your phone, download `Harbor.apk`, and allow installs from your browser when asked.
- **Any phone (web app):** open the GitHub Pages link of this repo, then "Add to Home screen". Works offline after the first visit.

## Layout
- `www/` the app (single `index.html` + PWA files). This is what ships.
- `src/v3/` readable sources; `python3 src/v3/build.py` (run in `src/`) re-assembles the app.
- `tools/` voice rendering (Kokoro-82M neural TTS, offline) and tests; `tools/voices/` the rendered clips.
- `docs/` project notes and history.
- `.github/workflows/` builds the APK and publishes the web app on every push.

## Voices
Spoken lines are pre-rendered with Kokoro (Apache-2.0) and bundled, so voice works offline and nothing leaves the device. Default: Heart. Swap in higher-quality recordings later by regenerating `src/v3/voice_data.js` with `tools/gen_voice.py`.

## Before a public launch
Have a clinician review the content and crisis flows; verify local helpline numbers; add a privacy policy for the store listing.
