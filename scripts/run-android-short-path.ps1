param(
  [int]$Port = 8081,
  [string]$ShortPath = "D:\bxd-user"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$candidateSdkPaths = @(
  $env:ANDROID_HOME,
  $env:ANDROID_SDK_ROOT,
  (Join-Path $env:LOCALAPPDATA "Android\Sdk"),
  (Join-Path $env:USERPROFILE "AppData\Local\Android\Sdk"),
  "C:\Android\Sdk",
  "D:\Android\Sdk"
) | Where-Object { $_ -and (Test-Path $_) }

if (-not $candidateSdkPaths) {
  throw "Android SDK location not found. Install Android Studio or set ANDROID_HOME to your SDK path."
}

$AndroidSdkPath = (Resolve-Path $candidateSdkPaths[0]).Path
$env:ANDROID_HOME = $AndroidSdkPath
$env:ANDROID_SDK_ROOT = $AndroidSdkPath

$androidDir = Join-Path $ProjectRoot "android"
if (Test-Path $androidDir) {
  $localPropertiesPath = Join-Path $androidDir "local.properties"
  $sdkDirValue = $AndroidSdkPath.Replace("\", "/")

  if (Test-Path $localPropertiesPath) {
    $localProperties = Get-Content $localPropertiesPath
    if ($localProperties -match "^sdk\.dir=") {
      $localProperties = $localProperties -replace "^sdk\.dir=.*", "sdk.dir=$sdkDirValue"
    } else {
      $localProperties += "sdk.dir=$sdkDirValue"
    }
  } else {
    $localProperties = @("sdk.dir=$sdkDirValue")
  }

  Set-Content -Path $localPropertiesPath -Value $localProperties -Encoding ASCII
}

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
