# ============================================================================
# Solo Leveling System - Ollama Setup Script (Windows)
# ============================================================================
# This script helps you set up Ollama for FREE local AI inference
# No API keys needed, no costs, runs entirely on your machine!
# ============================================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SOLO LEVELING SYSTEM - FREE AI SETUP (Ollama)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Ollama is already installed
$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue

if ($ollamaPath) {
    Write-Host "[OK] Ollama is already installed!" -ForegroundColor Green
    $ollamaVersion = ollama --version 2>$null
    Write-Host "     Version: $ollamaVersion" -ForegroundColor Gray
} else {
    Write-Host "[!] Ollama is not installed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install Ollama, choose one of these methods:" -ForegroundColor White
    Write-Host ""
    Write-Host "  OPTION 1: Download from website (Recommended)" -ForegroundColor Cyan
    Write-Host "  -> https://ollama.ai/download" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  OPTION 2: Using winget" -ForegroundColor Cyan
    Write-Host "  -> winget install Ollama.Ollama" -ForegroundColor Gray
    Write-Host ""
    
    $installChoice = Read-Host "Would you like to open the download page? (Y/n)"
    if ($installChoice -ne 'n' -and $installChoice -ne 'N') {
        Start-Process "https://ollama.ai/download"
        Write-Host ""
        Write-Host "Please install Ollama and run this script again." -ForegroundColor Yellow
        exit 0
    }
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CHECKING OLLAMA SERVICE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Ollama service is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Ollama service is running!" -ForegroundColor Green
    $models = ($response.Content | ConvertFrom-Json).models
} catch {
    Write-Host "[!] Ollama service is not running." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting Ollama service..." -ForegroundColor White
    
    # Start Ollama in background
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "[OK] Ollama service started successfully!" -ForegroundColor Green
        $models = ($response.Content | ConvertFrom-Json).models
    } catch {
        Write-Host "[ERROR] Failed to start Ollama service." -ForegroundColor Red
        Write-Host "Please start it manually: ollama serve" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  INSTALLED MODELS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($models -and $models.Count -gt 0) {
    Write-Host "Found $($models.Count) model(s):" -ForegroundColor White
    foreach ($model in $models) {
        $size = [math]::Round($model.size / 1GB, 2)
        Write-Host "  - $($model.name) ($size GB)" -ForegroundColor Gray
    }
} else {
    Write-Host "No models installed yet." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RECOMMENDED MODELS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Detect available RAM
$totalRAM = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 0)
Write-Host "Your system has approximately $totalRAM GB RAM" -ForegroundColor Gray

# Detect GPU
$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1
$gpuName = $gpu.Name
$gpuRAM = [math]::Round($gpu.AdapterRAM / 1GB, 0)

if ($gpuRAM -gt 0) {
    Write-Host "GPU detected: $gpuName (~$gpuRAM GB VRAM)" -ForegroundColor Gray
} else {
    Write-Host "GPU: CPU-only mode (no dedicated GPU detected)" -ForegroundColor Gray
}

Write-Host ""

# Recommend model based on hardware
$recommendedModel = "phi3:mini"  # Default for low-end
$recommendedSize = "2.3GB"

if ($totalRAM -ge 16 -or $gpuRAM -ge 8) {
    $recommendedModel = "llama3.1:8b"
    $recommendedSize = "4.7GB"
} elseif ($totalRAM -ge 8) {
    $recommendedModel = "llama3.2:3b"
    $recommendedSize = "2.0GB"
}

Write-Host "Recommended model for your hardware:" -ForegroundColor White
Write-Host ""
Write-Host "  Model: $recommendedModel" -ForegroundColor Green
Write-Host "  Size:  ~$recommendedSize download" -ForegroundColor Gray
Write-Host ""

# Check if recommended model is already installed
$hasRecommended = $models | Where-Object { $_.name -eq $recommendedModel -or $_.name.StartsWith($recommendedModel.Split(':')[0]) }

if ($hasRecommended) {
    Write-Host "[OK] Recommended model is already installed!" -ForegroundColor Green
} else {
    Write-Host "Available model options:" -ForegroundColor White
    Write-Host ""
    Write-Host "  [1] phi3:mini      - Fast, 2.3GB (good for low-end PCs)" -ForegroundColor Gray
    Write-Host "  [2] llama3.2:3b    - Balanced, 2.0GB (good quality/speed)" -ForegroundColor Gray
    Write-Host "  [3] llama3.1:8b    - Best quality, 4.7GB (needs 8GB+ RAM)" -ForegroundColor Gray
    Write-Host "  [4] mistral:7b     - Great for tasks, 4.1GB" -ForegroundColor Gray
    Write-Host "  [5] Skip installation" -ForegroundColor Gray
    Write-Host ""
    
    $choice = Read-Host "Select a model to install (1-5)"
    
    $modelToInstall = switch ($choice) {
        "1" { "phi3:mini" }
        "2" { "llama3.2:3b" }
        "3" { "llama3.1:8b" }
        "4" { "mistral:7b" }
        default { $null }
    }
    
    if ($modelToInstall) {
        Write-Host ""
        Write-Host "Downloading $modelToInstall... (this may take a few minutes)" -ForegroundColor Yellow
        Write-Host ""
        ollama pull $modelToInstall
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "[OK] Model $modelToInstall installed successfully!" -ForegroundColor Green
            $recommendedModel = $modelToInstall
        } else {
            Write-Host "[ERROR] Failed to download model." -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Create/update .env file
$envPath = "apps/api/.env"
$envContent = @"
# AI Configuration - Using Ollama (FREE local AI)
AI_PROVIDER=ollama
AI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=$recommendedModel
OPENAI_API_KEY=not-needed
OPENAI_MAX_TOKENS=2000
"@

Write-Host "Add these lines to your $envPath file:" -ForegroundColor White
Write-Host ""
Write-Host $envContent -ForegroundColor Gray
Write-Host ""

$updateEnv = Read-Host "Would you like to create/update the .env file automatically? (Y/n)"
if ($updateEnv -ne 'n' -and $updateEnv -ne 'N') {
    if (Test-Path $envPath) {
        # Read existing content
        $existingContent = Get-Content $envPath -Raw
        
        # Remove old AI config if present
        $existingContent = $existingContent -replace "(?m)^AI_PROVIDER=.*$", ""
        $existingContent = $existingContent -replace "(?m)^AI_BASE_URL=.*$", ""
        $existingContent = $existingContent -replace "(?m)^OPENAI_API_KEY=.*$", ""
        $existingContent = $existingContent -replace "(?m)^OPENAI_MODEL=.*$", ""
        $existingContent = $existingContent -replace "(?m)^OPENAI_MAX_TOKENS=.*$", ""
        
        # Append new config
        $newContent = $existingContent.Trim() + "`n`n" + $envContent
        Set-Content -Path $envPath -Value $newContent
    } else {
        # Create new file with Supabase placeholder and AI config
        $fullContent = @"
# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# API Configuration
PORT=3001
NODE_ENV=development

$envContent
"@
        Set-Content -Path $envPath -Value $fullContent
    }
    Write-Host "[OK] Environment file updated!" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "You're now using FREE local AI with Ollama!" -ForegroundColor White
Write-Host ""
Write-Host "Quick commands:" -ForegroundColor Cyan
Write-Host "  ollama serve          - Start Ollama service" -ForegroundColor Gray
Write-Host "  ollama list           - List installed models" -ForegroundColor Gray
Write-Host "  ollama pull MODEL     - Download a new model" -ForegroundColor Gray
Write-Host "  ollama run MODEL      - Chat with a model directly" -ForegroundColor Gray
Write-Host ""
Write-Host "Start your app:" -ForegroundColor Cyan
Write-Host "  pnpm api:dev          - Start the API server" -ForegroundColor Gray
Write-Host ""

# Test the model
$testChoice = Read-Host "Would you like to test the AI model now? (Y/n)"
if ($testChoice -ne 'n' -and $testChoice -ne 'N') {
    Write-Host ""
    Write-Host "Testing $recommendedModel..." -ForegroundColor Yellow
    Write-Host ""
    $testPrompt = "Say 'Solo Leveling System AI is ready!' in an epic game notification style."
    ollama run $recommendedModel $testPrompt
}

Write-Host ""
