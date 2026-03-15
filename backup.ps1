[Console]::OutputEncoding = [System.Text.Encoding]::UTF8;

# 設定: ソースディレクトリとバックアップ先
$sourceDir = "e:\Users\tai_r\Documents\AI\mhwilds-site"
$backupDir = "e:\Users\tai_r\Documents\AI\mhwilds-site_backups"

# バックアップ先フォルダがない場合は作成
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# タイムスタンプの取得
$dateStr = Get-Date -Format "yyyyMMdd_HHmm"
$zipName = "mhwilds-site_$dateStr.zip"
$destination = Join-Path $backupDir $zipName

Write-Host "=== MHWilds-Site プロジェクトバックアップ ===" -ForegroundColor Cyan
Write-Host "バックアップを作成中..."
Write-Host "対象: $sourceDir"
Write-Host "保存先: $destination"

# .git フォルダを除外して圧縮（PowerShell 5.1/7対応）
# 一時的に除外リストを作成
$excludeList = @(".git", ".vscode", "node_modules")
$itemsToZip = Get-ChildItem -Path "$sourceDir\*" -Exclude $excludeList

# 圧縮実行
Compress-Archive -Path $itemsToZip -DestinationPath $destination -Force

Write-Host ""
Write-Host "✅ バックアップが完了しました！" -ForegroundColor Green
Write-Host "ファイル: $zipName" -ForegroundColor Yellow
Write-Host "場所: $backupDir"
