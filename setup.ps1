[Console]::OutputEncoding = [System.Text.Encoding]::UTF8;
Write-Host "--- MHWilds-Site 開発環境セットアップ ---" -ForegroundColor Cyan

# 1. Windows Firewall のポート 3000 を開放（管理者権限が必要）
Write-Host "[1/2] ポート 3000 の開放を試行中..." -ForegroundColor Yellow
$firewallRuleName = "MHWilds-Site-3000"
$command = "netsh advfirewall firewall add rule name=`"$firewallRuleName`" dir=in action=allow protocol=TCP localport=3000"
powershell -Command "Start-Process powershell -ArgumentList '$command' -Verb RunAs"

# 2. ローカルサーバーをポート 3000 で起動
Write-Host "[2/2] ローカルサーバー (Port 3000) を起動します..." -ForegroundColor Yellow
Write-Host "停止するには Ctrl+C を押してください。" -ForegroundColor Gray
npx -y serve -l 3000 .

