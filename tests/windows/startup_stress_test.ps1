param(
  [int]$Runs = 100,
  [string]$AppPath = "$env:LOCALAPPDATA\Old Guy of Grumpy\app.exe",
  [string]$OutputDirectory = "$PSScriptRoot\..\..\test-artifacts\startup-stress"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Net.Http
Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class OggStressCapture {
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr handle, out Rect rect);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr handle);
  [DllImport("user32.dll", EntryPoint="GetWindowLongPtrW")] public static extern IntPtr GetWindowLongPtr(IntPtr handle, int index);
  [DllImport("user32.dll")] public static extern bool GetLayeredWindowAttributes(IntPtr handle, out uint key, out byte alpha, out uint flags);
}
"@

function Capture-OggFrame([IntPtr]$Handle, [string]$Path) {
  $rect = New-Object OggStressCapture+Rect
  if (![OggStressCapture]::GetWindowRect($Handle, [ref]$rect)) { return $null }
  $width = $rect.Right - $rect.Left; $height = $rect.Bottom - $rect.Top
  if ($width -le 0 -or $height -le 0) { return $null }
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $bitmap.Size)
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $dark = 0; $white = 0; $pixels = 0; $colors = @{}
  for ($x = 0; $x -lt $width; $x += 16) {
    for ($y = 0; $y -lt $height; $y += 16) {
      $color = $bitmap.GetPixel($x, $y); $pixels++
      if ($color.R -lt 8 -and $color.G -lt 8 -and $color.B -lt 8) { $dark++ }
      if ($color.R -gt 247 -and $color.G -gt 247 -and $color.B -gt 247) { $white++ }
      $colors["$([int]($color.R/16))-$([int]($color.G/16))-$([int]($color.B/16))"] = $true
    }
  }
  $bitmap.Dispose()
  [pscustomobject]@{ DarkRatio=$dark/$pixels; WhiteRatio=$white/$pixels; ColorBuckets=$colors.Count }
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$results = @(); $http = [System.Net.Http.HttpClient]::new(); $http.Timeout = [TimeSpan]::FromSeconds(20)
$forbiddenNames = @("cmd.exe", "conhost.exe", "tasklist.exe", "powershell.exe")

for ($run = 1; $run -le $Runs; $run++) {
  Get-Process app,ogg-voice-server -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -like "$env:LOCALAPPDATA\Old Guy of Grumpy\*" } | Stop-Process -Force
  $cleanupDeadline = (Get-Date).AddSeconds(5)
  do {
    Start-Sleep -Milliseconds 100
    $remaining = @(Get-Process app,ogg-voice-server -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "$env:LOCALAPPDATA\Old Guy of Grumpy\*" })
  } while ($remaining.Count -gt 0 -and (Get-Date) -lt $cleanupDeadline)
  if ($remaining.Count -gt 0) { throw "Previous OGG process tree did not terminate before run $run" }
  $startedAt = Get-Date; $app = Start-Process -FilePath $AppPath -PassThru
  $deadline = (Get-Date).AddSeconds(8)
  do {
    Start-Sleep -Milliseconds 50; $app.Refresh(); $screenReady = $false
    if ($app.MainWindowHandle -ne 0 -and [OggStressCapture]::IsWindowVisible($app.MainWindowHandle)) {
      $position = New-Object OggStressCapture+Rect
      $key=[uint32]0; $alpha=[byte]255; $flags=[uint32]0; $layered=[OggStressCapture]::GetLayeredWindowAttributes($app.MainWindowHandle,[ref]$key,[ref]$alpha,[ref]$flags)
      $extendedStyle = [OggStressCapture]::GetWindowLongPtr($app.MainWindowHandle, -20).ToInt64()
      $usesLayeredAlpha = ($extendedStyle -band 0x80000) -ne 0
      if ([OggStressCapture]::GetWindowRect($app.MainWindowHandle, [ref]$position)) { $screenReady = $position.Right -gt 0 -and $position.Left -lt [System.Windows.Forms.SystemInformation]::VirtualScreen.Right -and (!$usesLayeredAlpha -or ($layered -and $alpha -eq 255)) }
    }
  } while (!$app.HasExited -and !$screenReady -and (Get-Date) -lt $deadline)

  $frames = @()
  foreach ($delay in @(100, 500, 1500)) {
    Start-Sleep -Milliseconds $delay; $app.Refresh()
    if (!$app.HasExited -and $app.MainWindowHandle -ne 0 -and [OggStressCapture]::IsWindowVisible($app.MainWindowHandle)) {
      $path = Join-Path $OutputDirectory ("run-{0:D3}-frame-{1:D4}.png" -f $run, $delay)
      $frame = Capture-OggFrame $app.MainWindowHandle $path
      if ($frame) { $frames += $frame }
    }
  }

  $healthOk = $false; $audioBytes = 0
  try {
    $health = $http.GetStringAsync("http://127.0.0.1:8765/health").Result
    $healthOk = $health -match '"ok"\s*:\s*true'
    for ($attempt = 1; $attempt -le 3 -and $audioBytes -eq 0; $attempt++) {
      $audio = $http.PostAsync("http://127.0.0.1:8765/speak?text=OGG&voice=de-DE-ConradNeural&rate=0.92&volume=1.0", $null).Result
      if ($audio.IsSuccessStatusCode) { $audioBytes = $audio.Content.ReadAsByteArrayAsync().Result.Length }
      if ($audioBytes -eq 0) { Start-Sleep -Milliseconds 500 }
    }
  } catch {}

  $all = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue; $ids = @($app.Id)
  do { $before=$ids.Count; $ids += @($all | Where-Object {$ids -contains [int]$_.ParentProcessId} | ForEach-Object {[int]$_.ProcessId}); $ids=@($ids|Sort-Object -Unique) } while ($ids.Count -gt $before)
  $children = @($all | Where-Object {$ids -contains [int]$_.ProcessId})
  $forbidden = @($children.Name | Where-Object {$forbiddenNames -contains $_} | Sort-Object -Unique)

  $app.Refresh(); if (!$app.HasExited) { $null=$app.CloseMainWindow() }
  $exitDeadline = (Get-Date).AddSeconds(5)
  do { Start-Sleep -Milliseconds 100; $app.Refresh() } while (!$app.HasExited -and (Get-Date) -lt $exitDeadline)
  if (!$app.HasExited) { $app | Stop-Process -Force }
  $sidecarDeadline = (Get-Date).AddSeconds(5)
  do {
    Start-Sleep -Milliseconds 100
    $sidecars = @(Get-Process ogg-voice-server -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "$env:LOCALAPPDATA\Old Guy of Grumpy\*"})
  } while ($sidecars.Count -gt 0 -and (Get-Date) -lt $sidecarDeadline)
  $orphans = $sidecars.Count

  $result = [pscustomobject]@{
    Run=$run; StartedAt=$startedAt.ToString("o"); WindowVisible=$frames.Count -gt 0
    BlackFrame=@($frames|Where-Object {$_.DarkRatio -gt .98 -or $_.ColorBuckets -lt 8}).Count -gt 0
    WhiteFrame=@($frames|Where-Object {$_.WhiteRatio -gt .98}).Count -gt 0
    HealthOk=$healthOk; AudioBytes=$audioBytes; ForbiddenChildren=$forbidden; Orphans=$orphans
  }
  $results += $result
  $results | ConvertTo-Json -Depth 4 | Set-Content -Encoding utf8 (Join-Path $OutputDirectory "results.json")
  Write-Output ("RUN={0:D3} WINDOW={1} BLACK={2} WHITE={3} HEALTH={4} AUDIO={5} FORBIDDEN={6} ORPHANS={7}" -f $run,$result.WindowVisible,$result.BlackFrame,$result.WhiteFrame,$healthOk,$audioBytes,($forbidden -join ','),$orphans)
}

$http.Dispose()
