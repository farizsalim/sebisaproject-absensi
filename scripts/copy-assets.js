const fs = require('fs')
const path = require('path')

const src = path.resolve('c:/Users/Fariz/Documents/Project/Sebisa Project/presensi-sebisa/public/images/logo.png')
const destDir = path.resolve(__dirname, '..', 'public', 'images')
const dest = path.join(destDir, 'logo.png')

try {
  if (!fs.existsSync(src)) {
    console.error('Source logo not found:', src)
    process.exit(1)
  }

  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(src, dest)
  console.log('Copied logo to', dest)
} catch (err) {
  console.error('Failed to copy logo:', err.message)
  process.exit(1)
}
