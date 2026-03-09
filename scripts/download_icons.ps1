[Console]::OutputEncoding = [System.Text.Encoding]::UTF8;
$dest = "e:/Users/tai_r/Documents/AI/mhwilds-site/icon/monsters"
if (!(Test-Path $dest)) { New-Item -ItemType Directory -Path $dest }

$monsters = @(
    @{ name = "gogmazios"; url = "https://monsterhunterwiki.org/images/b/b8/MHWilds-Gogmazios_Icon.webp" },
    @{ name = "omega"; url = "https://monsterhunterwiki.org/images/f/fb/MHWilds-Omega_Planetes_Icon.webp" },
    @{ name = "lagiacrus"; url = "https://monsterhunterwiki.org/images/a/a9/MHWilds-Lagiacrus_Icon.webp" },
    @{ name = "seregios"; url = "https://monsterhunterwiki.org/images/9/91/MHWilds-Seregios_Icon.webp" },
    @{ name = "mizutsune"; url = "https://monsterhunterwiki.org/images/3/34/MHWilds-Mizutsune_Icon.webp" },
    @{ name = "arkveld"; url = "https://monsterhunterwiki.org/images/0/0f/MHWilds-Arkveld_Icon.webp" },
    @{ name = "gore_magala"; url = "https://monsterhunterwiki.org/images/a/a0/MHWilds-Gore_Magala_Icon.webp" },
    @{ name = "gravios"; url = "https://monsterhunterwiki.org/images/9/9e/MHWilds-Gravios_Icon.webp" },
    @{ name = "rathalos"; url = "https://monsterhunterwiki.org/images/b/be/MHWilds-Rathalos_Icon.webp" },
    @{ name = "zoshia"; url = "https://monsterhunterwiki.org/images/9/9f/MHWilds-Zoh_Shia_Icon.webp" },
    @{ name = "jindahaad"; url = "https://monsterhunterwiki.org/images/a/aa/MHWilds-Jin_Dahaad_Icon.webp" },
    @{ name = "redau"; url = "https://monsterhunterwiki.org/images/d/dc/MHWilds-Rey_Dau_Icon.webp" },
    @{ name = "uzutuna"; url = "https://monsterhunterwiki.org/images/9/92/MHWilds-Uth_Duna_Icon.webp" },
    @{ name = "dummy"; url = "https://monsterhunterwiki.org/images/a/a5/MHWilds-Question_Mark_Icon.png" }
)

foreach ($m in $monsters) {
    $ext = [System.IO.Path]::GetExtension($m.url)
    $file = Join-Path $dest ($m.name + $ext)
    Write-Host "Downloading $($m.name)..."
    try {
        Invoke-WebRequest -Uri $m.url -OutFile $file -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download $($m.name): $($_.Exception.Message)"
    }
}
