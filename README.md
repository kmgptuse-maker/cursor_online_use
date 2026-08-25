# SkillPath L&D � Next.js MVP

AI-powered L&D app with **real AI learning path generation** via API keys in `.env.local`.

## Quick start

```bash
cd "day3 teaching materials/classproject/grp1_skillpath_ld/skillpath-ld-next"
cp .env.example .env.local
# Edit .env.local � add DEEPSEEK_API_KEY or OPENAI_API_KEY
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login)

## Enable real AI

1. Copy `.env.example` ? `.env.local`
2. Add your key:
   ```bash
   AI_PROVIDER=deepseek
   DEEPSEEK_API_KEY=sk-your-key-here
   ```
   Or for OpenAI:
   ```bash
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart the dev server
4. Login as **Employee** ? complete assessment ? **Submit**
5. Check header: `AI: deepseek` (or openai)
6. HR ? Employees ? **Review** pending plan

If no key is set, the app uses a **rule-based fallback** (same logic as the HTML prototype) and shows a warning banner.

## Demo logins

| Role | How |
|------|-----|
| Employee | Login page ? pick any of 100 employees |
| HR Admin | Login page ? HR Admin |

Session is stored in an httpOnly cookie (demo auth). Supabase auth is optional � see `supabase/migrations/001_initial.sql`.

## Data storage

- **Local dev:** `.data/store.json` (auto-created on first run, seeded from workshop data)
- **Reset:** HR ? Export ? Reset demo data

## API routes

| Route | Purpose |
|-------|---------|
| `POST /api/assessments` | Save draft / submit (+ triggers AI) |
| `POST /api/learning-path/generate` | Regenerate plan for submitted assessment |
| `POST /api/plans/approve` | HR approve / reject |
| `GET /api/export/csv` | Download all plans |
| `GET /api/learning-path/generate` | AI config status |

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add env vars from `.env.local` (including AI keys)
4. Deploy

## Project docs

- [../PRD.md](../PRD.md)
- [../nextjs_mvp_plan.md](../nextjs_mvp_plan.md)
- [../ai_learning_path_prompt.md](../ai_learning_path_prompt.md)
