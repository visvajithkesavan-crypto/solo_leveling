# 🆓 Free AI Setup Guide (Ollama)

This guide shows you how to run the Solo Leveling System with **completely FREE local AI** using Ollama.

## What is Ollama?

Ollama is a free, open-source tool that lets you run large language models (LLMs) locally on your machine. No API keys, no costs, no data sent to external servers.

**Supported models include:**
- Llama 3.1 (Meta's latest)
- Mistral
- Phi-3 (Microsoft)
- CodeLlama
- And many more!

---

## Quick Setup (Windows)

### Option 1: Automated Setup (Recommended)

Run the setup script:

```powershell
# From the project root
.\setup-ollama.bat
```

This will:
1. Check if Ollama is installed
2. Start the Ollama service
3. Help you download a model
4. Configure your `.env` file

### Option 2: Manual Setup

#### Step 1: Install Ollama

Download from: https://ollama.ai/download

Or use winget:
```powershell
winget install Ollama.Ollama
```

#### Step 2: Pull a Model

Open a terminal and download a model:

```bash
# Recommended for most users (4.7GB, needs 8GB RAM)
ollama pull llama3.1:8b

# For lower-end PCs (2.3GB, works on 4GB RAM)
ollama pull phi3:mini

# For better quality (if you have 16GB+ RAM)
ollama pull mixtral:8x7b
```

#### Step 3: Start Ollama

```bash
ollama serve
```

Keep this running in a separate terminal.

#### Step 4: Configure Environment

Edit `apps/api/.env`:

```env
# AI Configuration - Using Ollama (FREE)
AI_PROVIDER=ollama
AI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3.1:8b
OPENAI_API_KEY=not-needed
```

---

## Model Recommendations

| Your Hardware | Recommended Model | RAM Needed | Download Size |
|---------------|------------------|------------|---------------|
| Low-end (4GB RAM) | `phi3:mini` | 4GB | 2.3GB |
| Mid-range (8GB RAM) | `llama3.2:3b` | 6GB | 2.0GB |
| Standard (8-16GB RAM) | `llama3.1:8b` | 8GB | 4.7GB |
| High-end (16GB+ RAM) | `mixtral:8x7b` | 16GB | 26GB |
| GPU (8GB VRAM) | `llama3.1:8b` | 8GB VRAM | 4.7GB |

### Model Quality Comparison

| Model | Quality | Speed | Best For |
|-------|---------|-------|----------|
| `phi3:mini` | ★★★☆☆ | ★★★★★ | Quick responses, limited hardware |
| `llama3.2:3b` | ★★★★☆ | ★★★★☆ | Good balance |
| `llama3.1:8b` | ★★★★★ | ★★★☆☆ | Best quality for most users |
| `mistral:7b` | ★★★★☆ | ★★★★☆ | Great for structured tasks |
| `mixtral:8x7b` | ★★★★★ | ★★☆☆☆ | Best quality, needs power |

---

## Verifying Setup

### Check Ollama is Running

```bash
curl http://localhost:11434/api/tags
```

### Test the API

```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1:8b",
    "messages": [{"role": "user", "content": "Say hello!"}]
  }'
```

### Test in the App

Start the API server and check the health endpoint:

```bash
pnpm api:dev
# Then visit: http://localhost:3001/api/health
```

---

## Troubleshooting

### "Connection refused" error

Ollama service isn't running. Start it:
```bash
ollama serve
```

### "Model not found" error

Pull the model first:
```bash
ollama pull llama3.1:8b
```

### Slow responses

1. Use a smaller model (`phi3:mini`)
2. Close other applications to free up RAM
3. If you have an NVIDIA GPU, make sure CUDA is working

### Out of memory

Your model is too large. Try:
```bash
ollama pull phi3:mini
```

Then update your `.env`:
```env
OPENAI_MODEL=phi3:mini
```

---

## Advanced Configuration

### Using a Remote Ollama Server

If you're running Ollama on a different machine (e.g., a server):

```env
AI_BASE_URL=http://192.168.1.100:11434/v1
```

### GPU Acceleration (NVIDIA)

Ollama automatically uses your GPU if CUDA is installed. Check with:
```bash
nvidia-smi
```

### Customizing Models

You can create custom models with specific system prompts:

```bash
# Create a Modelfile
echo 'FROM llama3.1:8b
SYSTEM "You are The System from Solo Leveling. Speak with authority and use symbols like ◇ and ◈."' > Modelfile

# Create the custom model
ollama create solo-system -f Modelfile

# Use it
ollama run solo-system
```

Then update your `.env`:
```env
OPENAI_MODEL=solo-system
```

---

## Comparison: Ollama vs OpenAI

| Aspect | Ollama (Free) | OpenAI (Paid) |
|--------|---------------|---------------|
| **Cost** | $0 | ~$0.03/1K tokens |
| **Privacy** | 100% local | Data sent to API |
| **Speed** | Depends on hardware | Fast (cloud) |
| **Quality** | 90% of GPT-4 | Best available |
| **Availability** | Always (local) | 99.9% uptime |
| **Internet** | Not required | Required |

---

## Need Help?

- Ollama Documentation: https://ollama.ai
- Model Library: https://ollama.ai/library
- GitHub Issues: https://github.com/ollama/ollama/issues
