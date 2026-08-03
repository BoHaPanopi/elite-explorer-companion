@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$body = @{ text='Servus Commander. A bissl was geht ollawei.'; rate=0.92; volume=1.0 } | ConvertTo-Json; " ^
  "$audio = Invoke-WebRequest -Uri 'http://127.0.0.1:8765/speak' -Method Post -ContentType 'application/json' -Body $body; " ^
  "[IO.File]::WriteAllBytes('%TEMP%\ogg-test.mp3', $audio.Content); " ^
  "Start-Process '%TEMP%\ogg-test.mp3'"
