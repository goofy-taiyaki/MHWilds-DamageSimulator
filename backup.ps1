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

Write-Host "=== MHWilds-Site プロジェクト完全バックアップ ===" -ForegroundColor Cyan
Write-Host "バックアップを作成中..."
Write-Host "対象: $sourceDir"
Write-Host "保存先: $destination"

# 除外リスト
$excludePattern = "^(\.git|\.vscode|node_modules|\.gemini|_restore_temp|.*\.zip)$"

# 作業用ディレクトリを作成
$tempWorkDir = Join-Path $backupDir "temp_backup_work_$dateStr"
New-Item -ItemType Directory -Path $tempWorkDir -Force | Out-Null

# 必要なファイルをコピー
Get-ChildItem -Path $sourceDir | ForEach-Object {
    if ($_.Name -notmatch $excludePattern) {
        Copy-Item -Path $_.FullName -Destination $tempWorkDir -Recurse -Force
    }
}

# 圧縮実行
Compress-Archive -Path "$tempWorkDir\*" -DestinationPath $destination -Force

# 作業用ディレクトリを削除
Remove-Item -Path $tempWorkDir -Recurse -Force

Write-Host ""
if (Test-Path $destination) {
    Write-Host "✅ バックアップが正常に完了しました！" -ForegroundColor Green
    Write-Host "ファイル: $zipName" -ForegroundColor Yellow
    Write-Host "サイズ: $([Math]::Round((Get-Item $destination).Length / 1MB, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "❌ バックアップの作成に失敗しました。" -ForegroundColor Red
}

