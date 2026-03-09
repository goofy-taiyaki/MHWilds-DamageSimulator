[Console]::OutputEncoding = [System.Text.Encoding]::UTF8;
$dest = "e:/Users/tai_r/Documents/AI/mhwilds-site/icon/weapons"
if (!(Test-Path $dest)) { New-Item -ItemType Directory -Path $dest }

$weapons = @(
    @{ id = "gs"; url = "https://monsterhunterwiki.org/images/3/36/MHWilds-Great_Sword_Icon_Base.webp" },
    @{ id = "ls"; url = "https://monsterhunterwiki.org/images/c/c9/MHWilds-Long_Sword_Icon_Base.webp" },
    @{ id = "sns"; url = "https://monsterhunterwiki.org/images/a/a9/MHWilds-Sword_and_Shield_Icon_Base.webp" },
    @{ id = "db"; url = "https://monsterhunterwiki.org/images/f/f4/MHWilds-Dual_Blades_Icon_Base.webp" },
    @{ id = "hm"; url = "https://monsterhunterwiki.org/images/3/33/MHWilds-Hammer_Icon_Base.webp" },
    @{ id = "hh"; url = "https://monsterhunterwiki.org/images/8/8d/MHWilds-Hunting_Horn_Icon_Base.webp" },
    @{ id = "lnc"; url = "https://monsterhunterwiki.org/images/3/39/MHWilds-Lance_Icon_Base.webp" },
    @{ id = "gl"; url = "https://monsterhunterwiki.org/images/d/d3/MHWilds-Gunlance_Icon_Base.webp" },
    @{ id = "sax"; url = "https://monsterhunterwiki.org/images/b/bb/MHWilds-Switch_Axe_Icon_Base.webp" },
    @{ id = "cb"; url = "https://monsterhunterwiki.org/images/c/cf/MHWilds-Charge_Blade_Icon_Base.webp" },
    @{ id = "ig"; url = "https://monsterhunterwiki.org/images/9/9c/MHWilds-Insect_Glaive_Icon_Base.webp" },
    @{ id = "lbg"; url = "https://monsterhunterwiki.org/images/8/87/MHWilds-Light_Bowgun_Icon_Base.webp" },
    @{ id = "hbg"; url = "https://monsterhunterwiki.org/images/6/6e/MHWilds-Heavy_Bowgun_Icon_Base.webp" },
    @{ id = "bow"; url = "https://monsterhunterwiki.org/images/6/63/MHWilds-Bow_Icon_Base.webp" }
)

foreach ($w in $weapons) {
    $file = Join-Path $dest ($w.id + ".webp")
    Write-Host "Downloading $($w.id)..."
    try {
        Invoke-WebRequest -Uri $w.url -OutFile $file -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download $($w.id): $($_.Exception.Message)"
    }
}
