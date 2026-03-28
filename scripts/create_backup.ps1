[Console]::OutputEncoding = [System.Text.Encoding]::UTF8;

$sourceDir = "e:\Users\tai_r\Documents\AI\mhwilds-site"
$backupDir = "e:\Users\tai_r\Documents\AI\mhwilds-site_backups"

# バックアップ保存用のフォルダが存在しない場合は作成
if (!(Test-Path -Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$dateStr = Get-Date -Format "yyyyMMdd_HHmm"
$zipName = "mhwilds-site_$dateStr.zip"
$destination = Join-Path $backupDir $zipName

Write-Host "=== MHWilds-Site バックアップ ===" -ForegroundColor Cyan
Write-Host "バックアップを作成しています..." 
Write-Host "対象: $sourceDir"
Write-Host "保存先: $destination"

# zip圧縮の実行
Compress-Archive -Path "$sourceDir\*" -DestinationPath $destination -Force

Write-Host ""
Write-Host "✅ バックアップが正常に完了しました！" -ForegroundColor Green
Write-Host "以下のファイルが作成されました:" 
Write-Host $destination -ForegroundColor Yellow
Write-Host "このファイルを Google ドライブの画面へドラッグ＆ドロップしてください。" -ForegroundColor Cyan

# 完了確認のために一時停止（ダブルクリックで実行した場合に画面がすぐ閉じないようにする）
# Write-Host "Enterキーを押して終了します..."
# Read-Host

