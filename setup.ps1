param([int]$Port = 3000)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'
if ($Port -lt 1 -or $Port -gt 65535) { throw 'Port must be between 1 and 65535.' }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'Python 3 is required.' }
Write-Host "MHWilds Simulator: http://127.0.0.1:$Port/index.html (Ctrl+C to stop)"
python -m http.server $Port --bind 127.0.0.1 --directory $PSScriptRoot
