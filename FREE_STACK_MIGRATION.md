# 🆓 Complete Free & Open-Source Stack Migration Guide

This guide provides a complete roadmap for migrating the Solo Leveling System to a 100% free and open-source stack.

---

## 📋 Migration Overview

| Component | Current (Paid) | Target (Free) | Status |
|-----------|----------------|---------------|--------|
| **AI/LLM** | OpenAI GPT-4 | Ollama (Local) | ✅ Implemented |
| **Database** | Supabase Cloud | PostgreSQL + Neon | 📋 Planned |
| **Authentication** | Supabase Auth | Lucia Auth / Better Auth | 📋 Planned |
| **Container Runtime** | Docker Desktop | Podman | 📋 Planned |
| **API Hosting** | Railway | Render / Oracle Cloud | 📋 Planned |
| **Web Hosting** | Vercel | Vercel Free / Cloudflare Pages | ✅ Already Free |

---

## Phase 1: AI Migration ✅ COMPLETE

The AI layer has been updated to support Ollama. See [FREE_AI_SETUP.md](FREE_AI_SETUP.md) for setup instructions.

### Quick Start

```powershell
# Run the setup script
.\setup-ollama.bat
```

### Manual Configuration

```env
AI_PROVIDER=ollama
AI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3.1:8b
```

---

## Phase 2: Database Migration 📋 PLANNED

### Current Setup: Supabase

Supabase provides:
- PostgreSQL database
- Row Level Security (RLS)
- Auto-generated REST API
- Real-time subscriptions (not used)

### Option A: Neon PostgreSQL (Recommended for Cloud)

**Why Neon?**
- Free tier: 0.5GB storage, 191 compute hours/month
- Serverless PostgreSQL (same as Supabase)
- Auto-suspend saves resources
- Direct PostgreSQL compatibility (minimal code changes)

**Migration Steps:**

1. **Create Neon Account**
   - Visit https://neon.tech
   - Create a new project
   - Copy connection string

2. **Export Supabase Schema**
   ```bash
   # From your Supabase project
   supabase db dump --schema public > schema.sql
   ```

3. **Apply to Neon**
   ```bash
   psql "postgres://user:pass@ep-xxx.neon.tech/neondb" < schema.sql
   ```

4. **Update Connection String**
   ```env
   # apps/api/.env
   DATABASE_URL=postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
   ```

5. **Update NestJS to Use Direct PostgreSQL**
   
   Install dependencies:
   ```bash
   pnpm --filter @solo-leveling/api add pg @types/pg
   # Or use an ORM:
   pnpm --filter @solo-leveling/api add drizzle-orm postgres
   ```

### Option B: Self-Hosted PostgreSQL (For Local/VPS)

**Using Podman (Free Docker Alternative):**

```yaml
# docker-compose.yml (works with podman-compose too)
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: solo_leveling
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: solo_leveling
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/supabase/migrations:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

Run with:
```bash
podman-compose up -d
```

### Database Migration Checklist

- [ ] Export current Supabase schema
- [ ] Set up Neon or local PostgreSQL
- [ ] Apply migrations
- [ ] Update connection configuration
- [ ] Replace Supabase client with pg/drizzle/prisma
- [ ] Move RLS logic to application layer
- [ ] Test all database operations

---

## Phase 3: Authentication Migration 📋 PLANNED

### Current Setup: Supabase Auth

Supabase Auth provides:
- Email/password authentication
- JWT token management
- Session handling
- User management

### Option A: Lucia Auth (Recommended)

**Why Lucia?**
- Open-source, MIT licensed
- TypeScript-first
- Works with any database
- Lightweight (~3KB)
- Active development

**Installation:**

```bash
pnpm --filter @solo-leveling/api add lucia @lucia-auth/adapter-postgresql
pnpm --filter @solo-leveling/web add lucia
```

**Backend Setup (NestJS):**

```typescript
// apps/api/src/auth/lucia.ts
import { Lucia } from "lucia";
import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

const adapter = new PostgresJsAdapter(sql, {
  user: "auth_user",
  session: "user_session"
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production"
    }
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email
    };
  }
});
```

**Database Tables:**

```sql
CREATE TABLE auth_user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_user(id),
  expires_at TIMESTAMPTZ NOT NULL
);
```

### Option B: Better Auth (Alternative)

**Why Better Auth?**
- More features out of the box
- Built-in OAuth providers
- Rate limiting included
- Two-factor authentication

**Installation:**

```bash
pnpm --filter @solo-leveling/api add better-auth
```

### Option C: Custom JWT (Minimal)

If you want full control with minimal dependencies:

```bash
pnpm --filter @solo-leveling/api add bcrypt jsonwebtoken
pnpm --filter @solo-leveling/api add -D @types/bcrypt @types/jsonwebtoken
```

**Basic Implementation:**

```typescript
// apps/api/src/auth/auth.service.ts
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET!;
  
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  generateToken(userId: string): string {
    return jwt.sign({ sub: userId }, this.jwtSecret, { expiresIn: '7d' });
  }
  
  verifyToken(token: string): { sub: string } {
    return jwt.verify(token, this.jwtSecret) as { sub: string };
  }
}
```

### Auth Migration Comparison

| Feature | Supabase Auth | Lucia | Better Auth | Custom JWT |
|---------|--------------|-------|-------------|------------|
| Setup Time | Instant | 2 hours | 2 hours | 4+ hours |
| Email/Pass | ✅ | ✅ | ✅ | ✅ |
| OAuth | ✅ | Via adapters | ✅ Built-in | Manual |
| 2FA | ✅ | Manual | ✅ Built-in | Manual |
| Rate Limiting | ✅ | Manual | ✅ Built-in | Manual |
| TypeScript | ✅ | ✅ Native | ✅ Native | Manual |
| Vendor Lock-in | Yes | No | No | No |

### Auth Migration Checklist

- [ ] Choose auth solution (Lucia recommended)
- [ ] Create auth database tables
- [ ] Implement auth service in NestJS
- [ ] Create auth guard replacement
- [ ] Update frontend auth context
- [ ] Migrate existing users (if any)
- [ ] Test login/logout/signup flows
- [ ] Update all protected routes

---

## Phase 4: Container Runtime (Podman) 📋 PLANNED

### Why Podman?

- **100% Free** (Docker Desktop has commercial restrictions)
- **Docker-compatible** (same commands, same Dockerfiles)
- **Rootless** by default (more secure)
- **Daemonless** (no background service needed)

### Installation (Windows)

```powershell
# Using winget
winget install RedHat.Podman

# Or download Podman Desktop
# https://podman-desktop.io/
```

### Usage

```bash
# Same commands as Docker!
podman pull postgres:16
podman run -d -p 5432:5432 -e POSTGRES_PASSWORD=pass postgres:16

# Use podman-compose for docker-compose files
pip install podman-compose
podman-compose up -d
```

### Create Project Compose File

```yaml
# compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: solo_leveling
      POSTGRES_PASSWORD: ${DB_PASSWORD:-localdev}
      POSTGRES_DB: solo_leveling
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/supabase/migrations:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U solo_leveling"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Ollama AI Server (optional - run in compose or separately)
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    # GPU support (NVIDIA)
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - capabilities: [gpu]

  # Solo Leveling API
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgres://solo_leveling:${DB_PASSWORD:-localdev}@postgres:5432/solo_leveling
      AI_BASE_URL: http://ollama:11434/v1
      OPENAI_MODEL: llama3.1:8b
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
  ollama_data:
```

---

## Phase 5: Free Hosting Options 📋 PLANNED

### API Hosting

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Render** | 750 hrs/month | Simple deployment |
| **Fly.io** | 3 shared VMs | Edge locations |
| **Railway** | $5 credit | Easy setup |
| **Oracle Cloud** | 4 ARM VMs (24GB RAM total) | Self-managed, best value |

### Web Hosting

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Vercel** | Generous | Next.js native |
| **Cloudflare Pages** | Unlimited | Speed, global CDN |
| **Netlify** | 100GB bandwidth | Simple static |

### Database Hosting

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Neon** | 0.5GB | Serverless PostgreSQL |
| **Supabase** | 500MB | If keeping Supabase |
| **PlanetScale** | 5GB | MySQL (requires migration) |
| **Oracle Cloud** | 20GB (2 DBs) | Self-managed |

### Recommended Free Production Stack

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION STACK                      │
├─────────────────────────────────────────────────────────┤
│  Frontend:  Vercel (Free Tier)                          │
│     ↓                                                   │
│  API:       Render (Free) or Oracle Cloud (Free)        │
│     ↓                                                   │
│  Database:  Neon PostgreSQL (Free Tier)                 │
│     ↓                                                   │
│  AI:        Ollama on Oracle Cloud VM (Free)            │
│             or Groq Cloud (Free tier: 14K tokens/min)   │
└─────────────────────────────────────────────────────────┘
```

---

## Oracle Cloud Always Free Setup

Oracle Cloud offers the best free tier for self-hosting:

### Free Resources (Forever)

| Resource | Amount |
|----------|--------|
| Compute (ARM) | 4 VMs, 24GB RAM, 4 OCPUs total |
| Block Storage | 200GB |
| Object Storage | 10GB |
| Load Balancer | 1 flexible |
| Autonomous DB | 2 instances (20GB each) |

### Setup Steps

1. **Create Oracle Cloud Account**
   - https://cloud.oracle.com/
   - Requires credit card (won't be charged for Always Free)

2. **Create ARM VM**
   - Shape: VM.Standard.A1.Flex
   - 4 OCPUs, 24GB RAM (max free)
   - OS: Oracle Linux or Ubuntu

3. **Install Dependencies**
   ```bash
   # On the VM
   sudo dnf install -y nodejs npm git podman
   
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull llama3.1:8b
   ```

4. **Deploy Application**
   ```bash
   git clone https://github.com/your-repo/solo_leveling.git
   cd solo_leveling
   pnpm install
   pnpm build
   pnpm start:prod
   ```

---

## Migration Timeline

| Week | Tasks |
|------|-------|
| **Week 1** | ✅ AI Migration (Ollama) |
| **Week 2** | Database setup (Neon + Drizzle/Prisma) |
| **Week 3** | Authentication (Lucia Auth) |
| **Week 4** | Deployment (Oracle Cloud + Vercel) |
| **Week 5** | Testing & optimization |

---

## Cost Comparison

| Component | Current Cost | After Migration |
|-----------|-------------|-----------------|
| OpenAI API | ~$10-50/month | $0 (Ollama) |
| Supabase | $0-25/month | $0 (Neon free tier) |
| Railway | $5-20/month | $0 (Render free) |
| Vercel | $0 | $0 |
| **Total** | **$15-95/month** | **$0** |

---

## Next Steps

1. **Run the Ollama setup** (if not done):
   ```powershell
   .\setup-ollama.bat
   ```

2. **Test locally** with Ollama

3. **Create Neon account** at https://neon.tech

4. **Plan auth migration** (Lucia recommended)

5. **Set up Oracle Cloud** for production hosting

---

## Need Help?

- Ollama: https://ollama.ai
- Neon: https://neon.tech/docs
- Lucia Auth: https://lucia-auth.com
- Podman: https://podman.io
- Oracle Cloud: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm
