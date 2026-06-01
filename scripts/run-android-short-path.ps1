param(
  [int]$Port = 8081,
  [string]$ShortPath = "D:\bxd-user"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

if (Test-Path $ShortPath) {
  $item = Get-Item $ShortPath -Force
  if ($item.LinkType -ne "Junction" -or $item.Target -ne $ProjectRoot) {
    throw "$ShortPath already exists and is not a junction to $ProjectRoot"
  }
} else {
  New-Item -ItemType Junction -Path $ShortPath -Target $ProjectRoot | Out-Null
}

Push-Location $ShortPath
try {
  npx expo run:android --port $Port
} finally {
  Pop-Location
}
