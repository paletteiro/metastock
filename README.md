# MetaStock — AI Metadata Generator for Microstocker

React Native / Expo app (Web + Android + iOS) untuk auto-generate metadata stock media.

---

## Quick Start

```bash
# 1. Clone / copy project ini
cd MetaStock

# 2. Install dependencies
npm install

# Install font packages
npx expo install @expo-google-fonts/fraunces @expo-google-fonts/dm-sans @expo-google-fonts/space-mono

# 3. Jalankan
npx expo start        # Expo Go (scan QR)
npx expo start --web  # Browser
npx expo run:android  # Android emulator / device
npx expo run:ios      # iOS simulator (Mac only)
```

---

## Struktur Project

```
MetaStock/
├── app/
│   ├── _layout.tsx          # Root layout + fonts
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab bar
│   │   ├── index.tsx        # Generate screen (upload + AI)
│   │   ├── history.tsx      # Riwayat file
│   │   └── settings.tsx     # Settings & platform config
│   └── result/
│       └── [id].tsx         # Detail metadata (modal)
├── components/
│   └── MediaTypeBadge.tsx   # Badge, ScorePill, StatusBadge, FileThumb
├── constants/
│   └── theme.ts             # Colors, Typography, Radius
├── store/
│   └── appStore.ts          # Zustand global state + mock data
└── assets/
```

---

## Cara Connect ke Claude API (Backend)

Di `store/appStore.ts`, ganti fungsi `simulateGenerate` di `app/(tabs)/index.tsx` dengan API call ke backend kamu:

```typescript
// Backend endpoint (FastAPI / Express)
const response = await fetch('https://your-api.com/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUri: file.uri,
    mediaType: file.type,
    options: { maxKeywords: 40, detectRelease: true }
  })
});
const metadata = await response.json();
```

Backend menggunakan Claude API dengan vision untuk analisis gambar:
```python
# FastAPI + Anthropic Python SDK
import anthropic, base64

client = anthropic.Anthropic(api_key="sk-...")

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": image_b64}},
            {"type": "text", "text": "Generate stock metadata: title, description, category, 40 keywords, color palette. Return JSON."}
        ]
    }]
)
```

---

## Features

- ✦ Upload photo, video, vector, PNG — single atau bulk
- ✦ Paste URL gambar langsung
- ✦ AI generate: title, description, category, keywords, color palette, release detection
- ✦ Edit semua metadata hasil generate
- ✦ Skor kualitas metadata (0–100%)
- ✦ Export CSV / copy to clipboard
- ✦ Multi-platform: Shutterstock, Adobe Stock, Getty, Alamy, dll.
- ✦ History dengan search & filter
- ✦ Settings: platform default, max keywords, export format

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Expo SDK 52 + Expo Router 4 |
| State | Zustand |
| UI | React Native (custom design system) |
| Fonts | Fraunces (display) + DM Sans (body) |
| Platforms | iOS · Android · Web |
| AI Backend | FastAPI + Anthropic Claude API |
