param(
  [string]$ImportSource
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$sourceDirectory = Join-Path $projectRoot 'src\assets'
$sourcePath = Join-Path $sourceDirectory 'pwa-icon-source.png'
$iconDirectory = Join-Path $projectRoot 'public\icons'

New-Item -ItemType Directory -Path $sourceDirectory -Force | Out-Null
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null

if ($ImportSource) {
  $resolvedImportSource = (Resolve-Path -LiteralPath $ImportSource).Path
  Copy-Item -LiteralPath $resolvedImportSource -Destination $sourcePath -Force
}

if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
  throw "找不到图标源文件：$sourcePath"
}

Add-Type -AssemblyName System.Drawing

function Export-SquareIcon {
  param(
    [Parameter(Mandatory)]
    [System.Drawing.Image]$SourceImage,
    [Parameter(Mandatory)]
    [int]$Size,
    [Parameter(Mandatory)]
    [string]$OutputPath
  )

  $side = [Math]::Min($SourceImage.Width, $SourceImage.Height)
  $sourceX = [Math]::Floor(($SourceImage.Width - $side) / 2)
  $sourceY = [Math]::Floor(($SourceImage.Height - $side) / 2)
  $sourceRectangle = [System.Drawing.Rectangle]::new($sourceX, $sourceY, $side, $side)
  $targetRectangle = [System.Drawing.Rectangle]::new(0, 0, $Size, $Size)
  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

  try {
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.DrawImage($SourceImage, $targetRectangle, $sourceRectangle, [System.Drawing.GraphicsUnit]::Pixel)
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

try {
  $targets = @(
    @{ Size = 180; FileName = 'apple-touch-icon.png' }
    @{ Size = 192; FileName = 'pwa-192.png' }
    @{ Size = 512; FileName = 'pwa-512.png' }
  )

  foreach ($target in $targets) {
    $outputPath = Join-Path $iconDirectory $target.FileName
    Export-SquareIcon -SourceImage $sourceImage -Size $target.Size -OutputPath $outputPath
    Write-Host "已生成 $outputPath"
  }
}
finally {
  $sourceImage.Dispose()
}
