# 🎙️ VoiceArchitect

> **Voice-First Flowchart & System Architecture Studio**  
> *Built 100% using voice-driven development powered by [Wispr Flow](https://ref.wisprflow.ai/hhg).*

[![Wispr Flow](https://img.shields.io/badge/Built%20With-Wispr%20Flow-8b5cf6?style=for-the-badge&logo=soundcharts&logoColor=white)](https://ref.wisprflow.ai/hhg)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## ⚡ Overview

**VoiceArchitect** bridges the gap between spoken conceptual thinking and visual flowchart design. Instead of manually drawing boxes and dragging arrows, developers can dictate entire user workflows, website architectures, or microservices hands-free.

### Key Capabilities
- 🤖 **Flo, the voice assistant**: Click the robot in the corner of the canvas to open a voice session. Hold your Wispr Flow hotkey and talk — the text lands in Flo's box and becomes a flowchart. No Wispr Flow? Tap the mic to use the browser's speech recognition.
- 🗣️ **Voice-to-Flowchart Engine**: Speak your desired steps (e.g., *"I need a landing page, user login, cart, stripe payment, and database"*), and it instantly parses and renders a connected flowchart in real-time.
- 🗺️ **Interactive Canvas**: Dynamic nodes with animated connection edges, mini-map, and drag-and-drop ergonomics powered by React Flow.
- 🔗 **Full Linkage & Step Editor**: Click any arrow on the canvas to rewire connections, change labels, pick custom colors (Purple, Blue, Cyan, Emerald, Amber, Pink), adjust routing styles (Curved, 90° Step, Straight), or toggle animated pulses.
- 🧩 **Templates & History**: Start from Onboarding / Checkout / Support / Release templates; every flow you dictate is saved locally so you can jump back to it.
- 💾 **Export**: High-resolution PNG download or copy the flow as Mermaid.

---

## 🎥 Video Demo & Voice-Driven Development Showcase

> 🔗 **[Watch the Demo Video](https://youtube.com)** *(Insert your recorded video link here)*

The video demonstrates:
1. **Hands-Free Dictation**: Using Wispr Flow hotkey dictation to issue complex workflow commands.
2. **Real-time Canvas Rendering**: Watching nodes connect live on the canvas.
3. **Interactive Linkage Editing**: Clicking connections and modifying flow directions and labels.

---

## 🗣️ The Wispr Flow Voice Prompt Log

The following exact voice commands were spoken into Wispr Flow to construct workflows:

```bash
# 1. Multi-Step Flowchart Generation
"I need a landing page, user login, cart, stripe payment, and database"

# 2. Dynamic Workflow Extensions
"Add an email receipt step"
"Add an SMS two-factor verification"

# 3. Customer Service Flow
"Customer inquiry, AI chatbot, ticket triage, and admin dashboard"
```

---

## 🛠️ Tech Stack

- **Speech & Voice Dictation**: [Wispr Flow](https://ref.wisprflow.ai/hhg)
- **Frontend Core**: React 19, TypeScript, Vite
- **Graph & Node Canvas**: `@xyflow/react` (React Flow)
- **Styling & Theme**: Tailwind CSS, Lucide React Icons
- **Export & Canvas Capture**: `html-to-image`

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+`
- Wispr Flow installed ([Download via Referral Link](https://ref.wisprflow.ai/hhg))

### Local Installation

```bash
# 1. Clone the repository
git clone https://github.com/divyani-22/wisprflow.git
cd wisprflow

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📄 License
MIT © 2026 Divyani. Built for the Wispr Flow Shortlisting Challenge.
