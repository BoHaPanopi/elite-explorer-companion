param(
  [string]$AppPath = "$env:LOCALAPPDATA\Old Guy of Grumpy\app.exe",
  [string]$OutputDirectory = "$PSScriptRoot\..\..\test-artifacts\fresh-profile-setup"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class OggSetupCapture {
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr handle, out Rect rect);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr handle);
  [DllImport("user32.dll", EntryPoint="GetWindowLongPtrW")] public static extern IntPtr GetWindowLongPtr(IntPtr handle, int index);
  [DllImport("user32.dll")] public static extern bool GetLayeredWindowAttributes(IntPtr handle, out uint key, out byte alpha, out uint flags);
}
"@

function Wait-ForWindow($process) {
  $deadline = (Get-Date).AddSeconds(20)
  do {
    Start-Sleep -Milliseconds 200; $process.Refresh(); $ready = $false
    if (!$process.HasExited -and $process.MainWindowHandle -ne 0 -and [OggSetupCapture]::IsWindowVisible($process.MainWindowHandle)) {
      $key=[uint32]0; $alpha=[byte]255; $flags=[uint32]0
      $layered=[OggSetupCapture]::GetLayeredWindowAttributes($process.MainWindowHandle,[ref]$key,[ref]$alpha,[ref]$flags)
      $style=[OggSetupCapture]::GetWindowLongPtr($process.MainWindowHandle,-20).ToInt64()
      $usesLayeredAlpha=($style -band 0x80000) -ne 0
      $ready=!$usesLayeredAlpha -or ($layered -and $alpha -eq 255)
    }
  } while (!$ready -and (Get-Date) -lt $deadline)
  if (!$ready) { throw "OGG did not expose its fully rendered main window" }
}

function Save-Window($process, [string]$path) {
  $rect = New-Object OggSetupCapture+Rect
  if (![OggSetupCapture]::GetWindowRect($process.MainWindowHandle, [ref]$rect)) { throw "Could not read OGG window bounds" }
  $bitmap = New-Object System.Drawing.Bitmap ($rect.Right - $rect.Left), ($rect.Bottom - $rect.Top)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $bitmap.Size)
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose(); $bitmap.Dispose()
}

function Close-Ogg($process) {
  $process.Refresh()
  if (!$process.HasExited) { $null = $process.CloseMainWindow(); $null = $process.WaitForExit(10000) }
  if (!$process.HasExited) { $process | Stop-Process -Force }
  Start-Sleep -Seconds 2
}

$localProfile = Join-Path $env:LOCALAPPDATA "de.panopi.eliteexplorercompanion"
$roamingProfile = Join-Path $env:APPDATA "de.panopi.eliteexplorercompanion"
$resolvedLocalRoot = [IO.Path]::GetFullPath($env:LOCALAPPDATA).TrimEnd('\') + '\'
$resolvedRoamingRoot = [IO.Path]::GetFullPath($env:APPDATA).TrimEnd('\') + '\'
if (![IO.Path]::GetFullPath($localProfile).StartsWith($resolvedLocalRoot) -or ![IO.Path]::GetFullPath($roamingProfile).StartsWith($resolvedRoamingRoot)) { throw "Unsafe profile paths" }

$runDirectory = Join-Path $OutputDirectory (Get-Date -Format "yyyyMMdd-HHmmss")
$backupDirectory = Join-Path $runDirectory "original-profile"
$testProfileDirectory = Join-Path $runDirectory "tested-profile"
New-Item -ItemType Directory -Force -Path $backupDirectory, $testProfileDirectory | Out-Null

Get-Process app,ogg-voice-server -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "$env:LOCALAPPDATA\Old Guy of Grumpy\*" } | Stop-Process -Force
Start-Sleep -Milliseconds 500

$localBackup = Join-Path $backupDirectory "local"
$roamingBackup = Join-Path $backupDirectory "roaming"
if (Test-Path $localProfile) { Move-Item -LiteralPath $localProfile -Destination $localBackup }
if (Test-Path $roamingProfile) { Move-Item -LiteralPath $roamingProfile -Destination $roamingBackup }

try {
  $first = Start-Process -FilePath $AppPath -PassThru
  Wait-ForWindow $first
  Start-Sleep -Seconds 2
  Save-Window $first (Join-Path $runDirectory "01-first-start-setup.png")

  $shell = New-Object -ComObject WScript.Shell
  if (!$shell.AppActivate($first.Id)) { throw "Could not activate OGG setup window" }
  Start-Sleep -Milliseconds 300
  $shell.SendKeys("^a")
  $shell.SendKeys("OGG Setup Test")
  $shell.SendKeys("{TAB}")
  $shell.SendKeys("{ENTER}")
  Start-Sleep -Seconds 2
  Save-Window $first (Join-Path $runDirectory "02-after-name-save.png")
  Close-Ogg $first

  $second = Start-Process -FilePath $AppPath -PassThru
  Wait-ForWindow $second
  Start-Sleep -Seconds 2
  Save-Window $second (Join-Path $runDirectory "03-second-start.png")
  Close-Ogg $second

  if (Test-Path $localProfile) { Move-Item -LiteralPath $localProfile -Destination (Join-Path $testProfileDirectory "local") }
  if (Test-Path $roamingProfile) { Move-Item -LiteralPath $roamingProfile -Destination (Join-Path $testProfileDirectory "roaming") }
} finally {
  Get-Process app,ogg-voice-server -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "$env:LOCALAPPDATA\Old Guy of Grumpy\*" } | Stop-Process -Force
  Start-Sleep -Milliseconds 500
  if (!(Test-Path $localProfile) -and (Test-Path $localBackup)) { Move-Item -LiteralPath $localBackup -Destination $localProfile }
  if (!(Test-Path $roamingProfile) -and (Test-Path $roamingBackup)) { Move-Item -LiteralPath $roamingBackup -Destination $roamingProfile }
}

[pscustomobject]@{ OutputDirectory=$runDirectory; FirstStart=$true; NameSaved=$true; SecondStart=$true; OriginalProfileRestored=(Test-Path $localProfile) }
