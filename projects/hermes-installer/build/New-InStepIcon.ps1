Add-Type -AssemblyName System.Drawing
$assetDir = Join-Path $PSScriptRoot '..\assets'
New-Item -ItemType Directory -Force -Path $assetDir | Out-Null
$icoPath = Join-Path $assetDir 'instep.ico'
$size = 256
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(22,93,255)), ([System.Drawing.Color]::FromArgb(0,194,168)), 45
$g.FillEllipse($brush, 8, 8, 240, 240)
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), 24
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawLines($pen, @(
  (New-Object System.Drawing.Point 72, 174),
  (New-Object System.Drawing.Point 124, 174),
  (New-Object System.Drawing.Point 124, 128),
  (New-Object System.Drawing.Point 172, 128),
  (New-Object System.Drawing.Point 172, 82)
))
$dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g.FillEllipse($dotBrush, 56, 158, 32, 32)
$g.FillEllipse($dotBrush, 108, 112, 32, 32)
$g.FillEllipse($dotBrush, 156, 66, 32, 32)
$titleFont = New-Object System.Drawing.Font 'Segoe UI', 28, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$stringFormat = New-Object System.Drawing.StringFormat
$stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245,255,255,255))
$g.DrawString('In', $titleFont, $textBrush, (New-Object System.Drawing.RectangleF 0, 188, 256, 48), $stringFormat)
$icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
$fs = [System.IO.File]::Create($icoPath)
$icon.Save($fs)
$fs.Close()
$g.Dispose(); $bmp.Dispose(); $icon.Dispose()
Write-Host "Icon created: $icoPath"
