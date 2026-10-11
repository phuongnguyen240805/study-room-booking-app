$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent

if (-not $env:JAVA_HOME) {
    $localJdk = Join-Path $env:USERPROFILE '.jdks\jbr-21.0.11'
    if (Test-Path (Join-Path $localJdk 'bin\java.exe')) {
        $env:JAVA_HOME = $localJdk
    }
}
if (-not $env:ANDROID_HOME) {
    $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
}
if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin\java.exe'))) {
    throw 'Set JAVA_HOME to a JDK 21 installation.'
}
if (-not (Test-Path $env:ANDROID_HOME)) {
    throw 'Set ANDROID_HOME to an Android SDK installation.'
}

$env:NODE_ENV = 'production'
$env:CI = '1'
Push-Location $projectDir
try {
    if (-not (Test-Path (Join-Path $projectDir 'android\gradlew.bat'))) {
        & npx.cmd expo prebuild --platform android --no-install
        if ($LASTEXITCODE -ne 0) { throw 'Expo prebuild failed.' }
    }

    # Keep CMake object paths below the Windows 260-character limit.
    # This edits the generated, Git-ignored native project only.
    $nativeBuildDir = (Join-Path $env:USERPROFILE '.vku-build\app').Replace('\', '/')
    $appGradlePath = Join-Path $projectDir 'android\app\build.gradle'
    $appGradle = Get-Content -LiteralPath $appGradlePath -Raw
    $appGradle = $appGradle -replace '(?s)\n// VKU local CMake staging.*?// End VKU local CMake staging\n?', ''
    $appGradle += @"

// VKU local CMake staging
android {
    externalNativeBuild {
        cmake {
            buildStagingDirectory = file('$nativeBuildDir')
        }
    }
}
// End VKU local CMake staging

"@
    Set-Content -LiteralPath $appGradlePath -Value $appGradle -Encoding utf8

    Push-Location (Join-Path $projectDir 'android')
    try {
        & .\gradlew.bat assembleRelease --console=plain --max-workers=4 '-Dorg.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=1024m'
        if ($LASTEXITCODE -ne 0) { throw 'Android release build failed.' }
    } finally {
        Pop-Location
    }

    $artifactDir = Join-Path $projectDir 'artifacts'
    New-Item -ItemType Directory -Path $artifactDir -Force | Out-Null
    $apkPath = Join-Path $artifactDir 'VKU-Study-Room-1.0.0.apk'
    Copy-Item -LiteralPath (Join-Path $projectDir 'android\app\build\outputs\apk\release\app-release.apk') -Destination $apkPath
    Write-Output "APK: $apkPath"
    Get-FileHash -LiteralPath $apkPath -Algorithm SHA256
} finally {
    Pop-Location
}
