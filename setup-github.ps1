# PowerShell script to set up Git and connect to GitHub repository
# Run this script after installing Git for Windows

Write-Host "Setting up Git repository and GitHub connection..." -ForegroundColor Green

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Git for Windows from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart your terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if already a git repository
if (Test-Path .git) {
    Write-Host "Git repository already initialized." -ForegroundColor Yellow
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
    Write-Host "Git repository initialized successfully!" -ForegroundColor Green
}

# Check current remote
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "Current remote URL: $remoteUrl" -ForegroundColor Cyan
    $change = Read-Host "Do you want to change the remote URL? (y/n)"
    if ($change -eq "y" -or $change -eq "Y") {
        $newUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)"
        git remote set-url origin $newUrl
        Write-Host "Remote URL updated!" -ForegroundColor Green
    }
} else {
    Write-Host "No remote repository configured." -ForegroundColor Yellow
    $setupRemote = Read-Host "Do you want to add a GitHub remote? (y/n)"
    if ($setupRemote -eq "y" -or $setupRemote -eq "Y") {
        $repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git or git@github.com:username/repo.git)"
        git remote add origin $repoUrl
        Write-Host "Remote repository added!" -ForegroundColor Green
    }
}

# Check if there are uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "`nUncommitted changes detected:" -ForegroundColor Yellow
    git status --short
    
    $commit = Read-Host "`nDo you want to commit these changes? (y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        $message = Read-Host "Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($message)) {
            $message = "Initial commit"
        }
        git add .
        git commit -m $message
        Write-Host "Changes committed!" -ForegroundColor Green
    }
} else {
    Write-Host "No uncommitted changes." -ForegroundColor Green
}

# Check current branch
$branch = git branch --show-current
Write-Host "`nCurrent branch: $branch" -ForegroundColor Cyan

# Ask about pushing
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    $push = Read-Host "`nDo you want to push to GitHub? (y/n)"
    if ($push -eq "y" -or $push -eq "Y") {
        Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
        git push -u origin $branch
        Write-Host "Push completed!" -ForegroundColor Green
    }
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "Your repository is now connected to GitHub." -ForegroundColor Green

