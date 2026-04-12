# ATLAS_ENTERPRISE_BRAIN

**stop command-f'ing your pdfs.**

Atlas Enterprise Brain is an advanced, highly optimized Retrieval-Augmented Generation (RAG) platform. It allows users to upload PDF documents, intelligently parse their contents into semantic vectors, and ask plain-language questions relying on the LLM to pull cited context strictly from the uploaded internal data. 

Built for teams who live inside specifications, reports, and long-form knowledgebases—not search boxes.

## Core Architecture

- **Framework**: Next.js 15 (App Router)
- **Database / Vector Store**: Supabase (PostgreSQL + `pgvector`)
- **LLM Engine**: Groq (Meta Llama 3 Scout 17B)
- **Embedding Generation**: Transformers.js (`Xenova/all-MiniLM-L6-v2`) via HuggingFace
- **PDF Extraction**: `unpdf`

## Key Features

1. **Intelligent Vectorization**: PDFs are extracted, cleaned, and split into overlapping context windows. They are then dynamically vectorized completely on the native Node.js/Edge layer using Transformers.js.
2. **Serverless Optimized**: Heavily mitigated to sustain Vercel's free-tier Hobby constraints. Integrates zero-cost `globalThis` scoped memory rate-limiting and strictly atomic array-batched Database network payloads to eliminate 10s CPU timeout inflation.
3. **Ghost Mode (Anonymous State)**: Visitors are organically provisioned invisible, ephemeral identity tokens upon entry. Their uploaded semantic history is aggressively firewalled, and if they elect to register, a backend migration routine transplants the disconnected records successfully over to their authenticated state using secure server bypasses.
4. **Responsive Layout**: Designed entirely on Tailwind CSS arrays supporting aggressive viewport collapses, mobile off-canvas drawer overlays, and smooth component animations. 

---

## Installation Guide

Follow these steps to deploy Atlas Enterprise Brain locally.

### 1. Clone the repository
```bash
git clone https://github.com/kurt-ds/atlas-enterprise-brain.git
cd atlas-enterprise-brain
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup (Supabase)
You need to provision a PostgreSQL environment capable of processing pgvector matrixes:
1. Navigate to [Supabase](https://supabase.com/) and create a free project.
2. Under **Authentication -> Providers**, enable **Anonymous** sign-ins.
3. Connect into the SQL Editor and execute the schema initialization payloads required to bootstrap your `documents`, `conversations`, and `chat_messages` tables (make sure to deploy Row Level Security!).
4. Pull your environment tokens from your Project Settings -> API.

### 4. Environment Variables
Create a `.env.local` file at the root level of your directory and insert your integration keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your.anon.jwt"

# WARNING: This requires the explicit Service Role secret bypass key, not the Anon key.
# Required to natively transplant documents across ephemeral -> authenticated states.
SUPABASE_SERVICE_ROLE_KEY="your.service_role.jwt"

# Groq LLM
GROQ_API_KEY="gsk_your_groq_api_token"
```

### 5. Initialize the Engine
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to witness the system. Upload a PDF, let the machine ingest the vectors, and begin querying!
