$ErrorActionPreference = "Continue"
Write-Host "Installing dependencies..."
npm install kordoc

Write-Host "Starting PDF to MD conversion..."
$pdfs = Get-ChildItem -Path "docs" -Filter "*.pdf" -Recurse
foreach ($pdf in $pdfs) {
    # Calculate the output path
    $relativePath = $pdf.FullName.Substring((Get-Item "docs").FullName.Length + 1)
    $mdRelativePath = [System.IO.Path]::ChangeExtension($relativePath, ".md")
    $mdFullPath = Join-Path "md" $mdRelativePath
    $mdDir = Split-Path $mdFullPath
    
    if (!(Test-Path $mdDir)) {
        New-Item -ItemType Directory -Force -Path $mdDir | Out-Null
    }
    
    Write-Host "Converting: $($pdf.Name)"
    # Run kordoc
    npx.cmd kordoc "$($pdf.FullName)" -o "$mdFullPath"
}

Write-Host "Initializing React App..."
if (!(Test-Path "app")) {
    npx.cmd --yes create-vite@latest app --template react-ts
}
cd app
npm install
Write-Host "Setup Completed Successfully!"
