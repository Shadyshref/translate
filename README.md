# Bayan • بيان — Smart Arabic ↔ English Converter

An intelligent, context-aware bidirectional text converter for Arabic and English names, addresses, and multi-word phrases. Built with React, TypeScript, Vite, Tailwind CSS, and Lucide Icons.

Unlike mechanical transliteration tools that perform literal character-by-character mapping, **Bayan** understands cultural naming conventions, geographical nuances, compound names, and address structures, especially in Egyptian usage.

---

## ✨ Features

- **Bidirectional Smart Conversion:**
  - **Arabic → English Names:** Converts compound names naturally (e.g. `عبد الرحمن محمد أحمد الغوري` ➔ `Abdelrahman Mohamed Ahmed El Ghoury`).
  - **English → Arabic Names:** Converts natural English spellings back to authentic Arabic script (e.g. `Mohamed Ahmed` ➔ `محمد أحمد`).
  - **Addresses & Locations:** Context-aware handling of Egyptian governorates, cities, districts, and streets (e.g. `القاهرة، مدينة نصر، شارع عباس العقاد` ➔ `Cairo, Nasr City, Abbas El Akkad Street`).
- **Context-Aware Semantic Preservation:**
  - Preserves personal names as proper nouns without translating their religious/literal meanings (e.g., *عبد الرحمن* is never translated literally as *"Servant of the Merciful"*).
  - Translates structural address words (*شارع* ➔ *Street*, *ميدان* ➔ *Square*, *طريق* ➔ *Road*, *حي* ➔ *District*, *عمارة* ➔ *Building*, *شقة* ➔ *Apt*).
- **Auto Language Detection:** Automatically recognizes whether the input is Arabic or English and sets the conversion direction.
- **Direction Swap:** Seamlessly reverse conversion direction with a single click.
- **Dark Mode & Light Mode:**
  - Complete theme system with smooth transitions.
  - Detects user's system preference on first visit.
  - Persists preference in `localStorage`.
- **Speech Synthesis (Pronunciation):** Listen to the pronunciation of both Arabic and English converted phrases via the Web Speech API.
- **Recent Conversion History:** Keeps recent conversions locally so you can revisit or copy them anytime.
- **Production-Ready & Secure:**
  - Zero API key exposure: Serverless function proxy (`/api/convert`) executes AI requests securely.
  - Zero-downtime resilience: Includes a comprehensive built-in Egyptian linguistic engine that functions offline even without an API key.

---

## 🚀 Live Demo & Examples

| Input Text | Converted Output | Type |
| :--- | :--- | :--- |
| `عبد الرحمن محمد أحمد الغوري` | `Abdelrahman Mohamed Ahmed El Ghoury` | Egyptian Name |
| `القاهرة، مدينة نصر، شارع عباس العقاد` | `Cairo, Nasr City, Abbas El Akkad Street` | Egyptian Address |
| `Mohamed Ahmed` | `محمد أحمد` | English Name |
| `Cairo, Nasr City, Abbas El Akkad Street` | `القاهرة، مدينة نصر، شارع عباس العقاد` | English Address |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Serverless API:** Vercel Serverless Functions (`api/convert.ts`) & Vite Dev Middleware
- **AI Providers:** Google Gemini API (`gemini-2.0-flash`), OpenAI (`gpt-4o-mini`), Groq (`llama-3.3-70b`)
- **Offline Engine:** Built-in Egyptian phonetic and contextual dictionary database

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone <repo-url>
cd arabic-english-converter
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables (optional)
Create a `.env` file in the root folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no API key is provided, the application automatically uses its built-in smart linguistic engine).*

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚢 Deployment to Vercel

The project is preconfigured for zero-configuration deployment to [Vercel](https://vercel.com).

### Method 1: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel
```

### Method 2: Deploy via Vercel Web Dashboard
1. Push your code to GitHub, GitLab, or Bitbucket.
2. In Vercel, click **"Add New Project"** and import your repository.
3. In the project settings, under **Environment Variables**, add:
   - `GEMINI_API_KEY` : Your Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/app/apikey))
   - *(Optional)* `OPENAI_API_KEY` : Your OpenAI API key
4. Click **Deploy**. Vercel will automatically build the Vite static assets and set up the `/api/convert` serverless function.

---

## 🔒 Security & Privacy

- **No Exposed Secrets:** API keys are never bundled into client-side code. All calls pass through the serverless function `/api/convert`.
- **Client Key Option:** Users can optionally supply their own personal key in the settings modal; it is stored solely in their browser's `localStorage` and sent over HTTPS headers directly to the serverless proxy.

---

## 📄 License

MIT License. Free to use and modify for personal and commercial projects.
