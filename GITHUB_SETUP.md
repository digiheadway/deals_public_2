# GitHub Repository Setup Guide

This guide will help you connect your project to a GitHub repository.

## Prerequisites

1. **Install Git for Windows** (if not already installed)
   - Download from: https://git-scm.com/download/win
   - Run the installer with default settings
   - Restart your terminal after installation

2. **Create a GitHub Account** (if you don't have one)
   - Sign up at: https://github.com

3. **Create a New Repository on GitHub**
   - Go to https://github.com/new
   - Choose a repository name (e.g., `deal_network`)
   - Choose public or private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

## Quick Setup (Using the Script)

1. Open PowerShell in this project directory
2. Run the setup script:
   ```powershell
   .\setup-github.ps1
   ```
3. Follow the prompts to:
   - Initialize git (if not already done)
   - Add your GitHub repository URL
   - Commit your changes
   - Push to GitHub

## Manual Setup

If you prefer to set up manually, follow these steps:

### 1. Initialize Git Repository

```powershell
git init
```

### 2. Add All Files

```powershell
git add .
```

### 3. Make Initial Commit

```powershell
git commit -m "Initial commit"
```

### 4. Add GitHub Remote

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

**HTTPS (recommended for beginners):**
```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

**SSH (if you have SSH keys set up):**
```powershell
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 5. Push to GitHub

```powershell
git branch -M main
git push -u origin main
```

## Verify Connection

Check that your remote is configured correctly:

```powershell
git remote -v
```

You should see your GitHub repository URL listed.

## Common Commands

### Check Status
```powershell
git status
```

### Add Changes
```powershell
git add .
# or for specific files:
git add filename
```

### Commit Changes
```powershell
git commit -m "Your commit message"
```

### Push to GitHub
```powershell
git push
```

### Pull from GitHub
```powershell
git pull
```

### View Remote URL
```powershell
git remote get-url origin
```

### Change Remote URL
```powershell
git remote set-url origin NEW_URL
```

## Troubleshooting

### Git is not recognized
- Make sure Git is installed
- Restart your terminal after installation
- Check that Git is in your PATH: `$env:PATH -split ';' | Select-String git`

### Authentication Issues
- For HTTPS: GitHub may prompt for username and password/token
- Use a Personal Access Token instead of password: https://github.com/settings/tokens
- For SSH: Make sure your SSH key is added to GitHub: https://github.com/settings/keys

### Remote Already Exists
If you get an error that the remote already exists:
```powershell
git remote remove origin
git remote add origin YOUR_NEW_URL
```

## Next Steps

After connecting to GitHub:
1. Consider setting up GitHub Actions for CI/CD
2. Add branch protection rules
3. Set up issue templates
4. Configure repository settings


