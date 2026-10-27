# Harbor: project notes

## Goal
A free, privacy-first mobile app for people with loneliness, depression and low self-worth. Data stays on-device (localStorage key `harbor.v1`). No streak guilt. Honest "support tool, not a therapist" framing with crisis helplines. Built by Jesr (Mauritius).

## History
1. Brainstorm, research review, decision to keep it free, Play Store path.
2. Sounds, visuals, goals, content, silliness, animation.
3. v3 redesign: mood-adaptive colours, 4-square home with Pip and a slingshot gesture, Calm (voice-read scenes), separate Breathe with distinct inhale/exhale tones, simpler navigation.
4. Round 1 fixes: "giftnull" bug, one-tap mood check-in, toggle UI, live sound timer.
5. Round 2: phone voice by default. Round 3: bundled Kokoro neural voices (Heart default, Nicole, Emma, phone).
6. Packaging: PWA + Capacitor Android APK via GitHub Actions.

## Decisions and constraints
- Mood-colour evidence is mixed, so the user keeps control of the palette modes (mood / lift / soft).
- Voice: Heart is the user's favourite. Wanted Gemini-like realism: the read-aloud plugin supports ElevenLabs/OpenAI/Speechify, but needs API keys and network access; plan is to record the 57 fixed lines with such a service and bundle them (replace `voice_data.js`).
- Unverified by ear: voice quality and levels (the assistant cannot hear audio).

## Architecture
Single-file app assembled by `src/v3/build.py` from CSS, `core.js` (storage, palette engine), `audio.js` (Web Audio layers, breathing tones, clip playback), content/art/scenes, and views1-4 (home+Feel, Calm, Play, Grow/Settings/Help/router). Hash routing. Slingshot uses pointer events + WAAPI.

## Next ideas
Better recorded voices; more functionality; privacy policy; clinician review; verify Mauritius helplines; Play Store listing (Capacitor project can be signed with a release key).
