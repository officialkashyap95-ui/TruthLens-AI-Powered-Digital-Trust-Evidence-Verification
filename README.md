# TruthLens — AI-Powered Digital Trust & Evidence Verification Platform

> **Don't Just Believe. Verify.**

TruthLens is an AI-powered digital trust and evidence verification platform designed to help users assess the credibility and authenticity of digital content.

Instead of reducing verification to a simple **TRUE/FALSE** decision, TruthLens combines multiple evidence signals and presents an explainable assessment with a risk/trust score, confidence level, supporting or contradicting evidence, and reasons.

---

## Problem

Digital content can be authentic, manipulated, or misleading, while users often lack the tools and evidence needed to distinguish between them.

TruthLens addresses four major challenges:

- **Misinformation** — claims and news can spread faster than they can be verified.
- **Synthetic media** — AI-generated images and deepfakes make visual authenticity difficult to assess.
- **Fake documents** — altered layouts, dates, fonts, logos, and text can appear convincing.
- **Context gaps** — genuine media can still be misleading when presented with incorrect source or context.

Most existing tools focus on a single verification problem. TruthLens is designed around a unified evidence-driven workflow.

---

## Solution

TruthLens follows a multi-layer verification pipeline:

```text
CONTENT
   ↓
ANALYSIS
   ↓
EVIDENCE
   ↓
EVIDENCE FUSION
   ↓
EXPLAINABLE ASSESSMENT
   ↓
RECOMMENDATION
```

The platform analyzes different types of digital content and combines independent signals rather than relying on a single detector or AI model.

---

## Core Features

### 1. Text & News Verification

- Claim and content analysis
- Source/context assessment
- Supporting and contradicting evidence
- Credibility-oriented analysis
- Explainable verification results

### 2. Image Verification

- Image metadata analysis
- Provenance information
- Manipulation indicators
- AI-generated-image indicators
- Compression and forensic signals
- Context/source information

### 3. Video / Deepfake Verification

The planned video verification pipeline can combine:

- Face detection
- Frame extraction
- Visual manipulation analysis
- Temporal consistency
- Audio analysis
- Lip-sync analysis
- Metadata analysis
- Provenance and source verification

TruthLens is designed **not to claim 100% deepfake-detection accuracy**. When evidence is insufficient, the appropriate outcome is **UNVERIFIED**.

### 4. Document Verification

The planned document pipeline can analyze:

- OCR text
- Document metadata
- Layout consistency
- Fonts and alignment
- Logos
- Text consistency
- Date consistency
- Provenance
- External/contextual information

### 5. Evidence Fusion Engine

TruthLens combines independent signals into a unified assessment.

Example:

```text
Visual Analysis      → 72% suspicious
Temporal Analysis   → 64% suspicious
Audio Analysis      → 31% suspicious
Source Analysis     → 81% suspicious
Context Analysis    → 89% suspicious
Provenance          → Not available
```

The fusion layer produces:

- Overall risk/trust score
- Confidence level
- Evidence
- Reasons
- Recommendation

### 6. Explainable Results

Users can see **why** a result was produced instead of receiving an unexplained classification.

The intended evidence relationship is:

```text
CLAIM
  ↓
SOURCE
  ↓
EVIDENCE
  ↓
MEDIA / CONTEXT ANALYSIS
  ↓
FINAL ASSESSMENT
```

---

## Assessment States

TruthLens uses more informative states than a binary TRUE/FALSE result:

| Status | Meaning |
|---|---|
| 🟢 **VERIFIED** | Strong evidence supports the content. |
| 🟡 **UNVERIFIED** | There is insufficient evidence to establish authenticity. |
| 🟠 **SUSPICIOUS** | Multiple warning indicators have been detected. |
| 🔴 **LIKELY MANIPULATED / MISLEADING** | Strong evidence indicates manipulation or misleading context. |

> **Important:** Verification results represent evidence-based assessments, not absolute guarantees of truth or authenticity.

---

## Architecture

TruthLens is designed as a modular verification platform.

```text
┌──────────────────────────────┐
│          Frontend            │
│      React Web Interface     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          API Layer            │
│       Express / Backend       │
└──────────────┬───────────────┘
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
    Text     Image    Media
   Analysis  Forensics Analysis
       │       │        │
       └───────┼────────┘
               ▼
┌──────────────────────────────┐
│      Evidence Fusion         │
│ Independent Signal Analysis  │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│    Explainable Assessment    │
│ Risk • Confidence • Evidence │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│          MongoDB             │
│    Verification Records      │
└──────────────────────────────┘
```

---

## Technology Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- Lucide Icons

### Backend

- Node.js
- Express.js
- REST API
- Multer for file uploads

### Database

- MongoDB
- Mongoose

### AI / Verification

The project specification proposes modular use of:

- Google Gemini / generative AI services
- Groq
- Open-source ML models
- PyTorch

### Media & Forensics

Planned/target tooling includes:

- OpenCV
- FFmpeg
- FFprobe
- ExifTool
- Whisper
- librosa

### OCR

Planned tooling includes:

- Tesseract
- PaddleOCR

### Authentication

- Clerk

---

## Project Structure

The repository is organized around a frontend client and backend server:

```text
TruthLens/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   ├── server.js
│   ├── package.json
│   └── ...
│
└── README.md
```

> The exact directory structure may evolve as new verification modules are added.

---

## Getting Started

### Prerequisites

Install:

- Node.js 18+
- npm
- MongoDB or MongoDB Atlas
- Git

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd TruthLens
```

---

## Backend Setup

Move into the backend:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5001

MONGO_URI=your_mongodb_atlas_connection_string

CLIENT_URL=http://localhost:5173

GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

Start the backend:

```bash
node server.js
```

Development mode:

```bash
npm run dev
```

The backend should be available at:

```text
http://localhost:5001
```

Health check:

```text
GET /api/health
```

A healthy deployment returns a response similar to:

```json
{
  "success": true,
  "service": "TruthLens Verification API",
  "status": "healthy"
}
```

---

## Frontend Setup

Open a new terminal and move into the client:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

The Vite development server will provide the local frontend URL.

---

## Production Environment Variables

### Backend

Configure these variables in the production hosting provider:

```env
PORT=5001
MONGO_URI=<production MongoDB Atlas URI>
CLIENT_URL=<production frontend URL>

GEMINI_API_KEY=<secret>
GROQ_API_KEY=<secret>
OPENROUTER_API_KEY=<secret>
```

### Frontend

Configure:

```env
VITE_API_URL=<production backend URL>
```

For example:

```env
VITE_API_URL=https://your-backend.onrender.com
```

> Because Vite exposes `VITE_*` variables to client-side code, **never place private API keys in `VITE_*` variables**.

---

## API Overview

### Health

```http
GET /api/health
```

Checks whether the verification API is running.

### Create Verification

```http
POST /api/verifications
```

Used for verification requests.

Text requests use JSON:

```json
{
  "type": "text",
  "content": "Content to verify",
  "source": "https://example.com"
}
```

Image verification uses multipart form data:

```text
type=image
file=<uploaded-image>
source=<optional-source>
```

### Get Verification

```http
GET /api/verifications/:verificationId
```

Returns a previously created verification result.

---

## Deployment

TruthLens can be deployed as separate frontend and backend services.

### Backend

A Node/Express deployment can use:

```text
Build Command:
npm install

Start Command:
node server.js
```

or the package script:

```text
npm start
```

provided the `start` script is configured as:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

Configure the production MongoDB Atlas connection and environment variables in the hosting provider.

### Frontend

The React/Vite client can be deployed to a frontend platform such as Vercel.

Set:

```env
VITE_API_URL=https://your-backend.onrender.com
```

After changing environment variables, trigger a new production deployment so the Vite build receives the updated value.

---

## Security

Do not commit secrets to Git.

Never commit:

```text
.env
.env.local
.env.production
```

Recommended `.gitignore` entries:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
.DS_Store
```

If an API key has ever been accidentally exposed publicly, **rotate/revoke it immediately** and replace it with a new secret.

---

## Design Principles

TruthLens follows several core principles:

### Evidence over single-model decisions

No individual AI model should be treated as the absolute source of truth.

### Explainability

Every assessment should communicate the evidence and reasoning behind it.

### Uncertainty

When evidence is insufficient, TruthLens should prefer **UNVERIFIED** over an unjustified confident conclusion.

### Modular verification

New detectors and analysis services should be addable without redesigning the complete product.

### Context matters

A piece of media can be technically genuine while still being misleading because of incorrect source, timing, or context.

---

## Current Development Direction

The project follows an MVP-first approach:

```text
Core Upload / Input
        ↓
Analysis Pipeline
        ↓
Evidence Storage
        ↓
Evidence Fusion
        ↓
Explainable Results
        ↓
Advanced Verification Models
```

The goal is to demonstrate a complete working verification flow before adding unnecessary technologies or features.

---

## Limitations

TruthLens should not be presented as an infallible truth detector.

Important limitations include:

- No deepfake detector guarantees perfect accuracy.
- Source and provenance information may be unavailable.
- AI-generated content can be difficult to distinguish from authentic content.
- Large media files can increase processing time and infrastructure requirements.
- External evidence may be incomplete, unavailable, or contradictory.
- Verification results should be interpreted together with their evidence and confidence.

---

## Roadmap

### Phase 1 — MVP

- [x] Web verification interface
- [x] Text verification flow
- [x] Image upload flow
- [x] Backend verification API
- [x] MongoDB persistence
- [x] Explainable result structure
- [x] Production deployment foundation

### Phase 2 — Verification Expansion

- [ ] Advanced image forensic analysis
- [ ] Improved provenance analysis
- [ ] Document OCR pipeline
- [ ] Document consistency analysis
- [ ] Evidence graph visualization

### Phase 3 — Video Intelligence

- [ ] Video frame extraction
- [ ] Temporal analysis
- [ ] Audio analysis
- [ ] Lip-sync analysis
- [ ] Deepfake signal fusion

### Phase 4 — Advanced Evidence Intelligence

- [ ] Cross-source verification
- [ ] Improved source credibility analysis
- [ ] Evidence graph
- [ ] Advanced fusion strategies
- [ ] More robust provenance workflows

---

## Hackathon Focus

TruthLens is designed to demonstrate a complete, explainable digital-trust workflow:

```text
User submits content
        ↓
TruthLens analyzes the content
        ↓
Independent evidence signals are collected
        ↓
Signals are fused
        ↓
Risk / trust assessment is generated
        ↓
Evidence and reasons are shown to the user
```

The central innovation is **not simply having separate fake-news, image, document, and deepfake detectors**.

It is the ability to combine multiple signals into one understandable digital-trust assessment.

---

## Contributing

Contributions are welcome.

Recommended workflow:

1. Fork the repository.
2. Create a feature branch.
3. Implement the change.
4. Test locally.
5. Commit with a clear message.
6. Push the branch.
7. Open a pull request.

Example:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

---

## Team

**TruthLens**  
AI-Powered Digital Trust & Evidence Verification Platform

> **Don't Just Believe. Verify.**

---

## License

Add the project's chosen license here before publishing the repository as an open-source project.

For example:

```text
MIT License
```

Do not claim an open-source license unless the repository actually includes that license.

---

## Links

- **GitHub:** `https://github.com/officialkashyap95-ui/TruthLens-AI-Powered-Digital-Trust-Evidence-Verification`

- **Live Demo:** `https://truth-lens-ai-powered-digital-trust.vercel.app/`

---

## Acknowledgements

TruthLens is built around established web, AI, media-processing, OCR, and database technologies. The project's technology direction includes React, Node.js/Express, MongoDB, AI services, OpenCV, FFmpeg, OCR tooling, and open-source machine-learning models.

---

**TruthLens — Don't Just Believe. Verify.**
