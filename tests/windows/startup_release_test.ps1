param(
  [int]$Runs = 10,
  [string]$AppPath = "$env:LOCALAPPDATA\Old Guy of Grumpy\app.exe",
  [string]$OutputDirectory = "$PSScriptRoot\..\..\test-artifacts\startup-release"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class OggWindowCapture {
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr handle, out Rect rect);
}
"@

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$summary = @()

for ($run = 1; $run -le $Runs; $run++) {
  Get-Process app -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -like "$env:LOCALAPPDATA\Old Guy of Grumpy\*" } |
    Stop-Process -Force
  Start-Sleep -Milliseconds 500

  $startedAt = Get-Date
  $app = Start-Process -FilePath $AppPath -PassThru
  $knownPids = @($app.Id)
  $children = @{}
  $frames = @()

  for ($sample = 0; $sample -lt 30; $sample++) {
    Start-Sleep -Milliseconds 100
    $app.Refresh()

    $processes = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue
    $newChildren = $processes | Where-Object { $knownPids -contains [int]$_.ParentProcessId }
    foreach ($child in $newChildren) {
      if ($knownPids -notcontains [int]$child.ProcessId) { $knownPids += [int]$child.ProcessId }
      $children[[int]$child.ProcessId] = [pscustomobject]@{
        Name = $child.Name
        ProcessId = [int]$child.ProcessId
        ParentProcessId = [int]$child.ParentProcessId
        CommandLine = $child.CommandLine
      }
    }

    if ($app.MainWindowHandle -ne 0 -and ($sample -in @(0, 1, 2, 4, 7, 12, 20, 29))) {
      $rect = New-Object OggWindowCapture+Rect
      if ([OggWindowCapture]::GetWindowRect($app.MainWindowHandle, [ref]$rect)) {
        $width = $rect.Right - $rect.Left
        $height = $rect.Bottom - $rect.Top
        if ($width -gt 0 -and $height -gt 0) {
          $bitmap = New-Object System.Drawing.Bitmap $width, $height
          $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
          $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $bitmap.Size)
          $file = Join-Path $OutputDirectory ("run-{0:D2}-frame-{1:D2}.png" -f $run, $sample)
          $bitmap.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
          $graphics.Dispose()

          $white = 0; $pixels = 0
          for ($x = 0; $x -lt $width; $x += 20) {
            for ($y = 0; $y -lt $height; $y += 20) {
              $color = $bitmap.GetPixel($x, $y); $pixels++
              if ($color.R -gt 245 -and $color.G -gt 245 -and $color.B -gt 245) { $white++ }
            }
          }
          $bitmap.Dispose()
          $frames += [pscustomobject]@{ File = $file; Sample = $sample; WhiteRatio = if ($pixels) { $white / $pixels } else { 0 } }
        }
      }
    }
  }

  $summary += [pscustomobject]@{
    Run = $run
    StartedAt = $startedAt.ToString("o")
    FirstFrameSample = ($frames | Select-Object -First 1).Sample
    MaximumWhiteRatio = ($frames | Measure-Object WhiteRatio -Maximum).Maximum
    CapturedFrames = $frames.Count
    ChildProcesses = @($children.Values)
  }

  $app.Refresh()
  if (!$app.HasExited) { $null = $app.CloseMainWindow(); Start-Sleep -Seconds 1; $app.Refresh() }
  if (!$app.HasExited) { $app | Stop-Process -Force }
  Start-Sleep -Milliseconds 500
}

$summary | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 (Join-Path $OutputDirectory "summary.json")
$summary
