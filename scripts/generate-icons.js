const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
const pngPath = path.join(projectRoot, 'assets', 'aurorapad-app-icon.png')
const icoPath = path.join(projectRoot, 'assets', 'aurorapad-app-icon.ico')

function readPngDimensions(buffer) {
  const signature = buffer.subarray(0, 8).toString('hex')
  if (signature !== '89504e470d0a1a0a') {
    throw new Error('Source file is not a valid PNG')
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

function pngToIcoBuffer(pngBuffer) {
  const { width, height } = readPngDimensions(pngBuffer)

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)

  const entry = Buffer.alloc(16)
  entry.writeUInt8(width >= 256 ? 0 : width, 0)
  entry.writeUInt8(height >= 256 ? 0 : height, 1)
  entry.writeUInt8(0, 2)
  entry.writeUInt8(0, 3)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(pngBuffer.length, 8)
  entry.writeUInt32LE(header.length + entry.length, 12)

  return Buffer.concat([header, entry, pngBuffer])
}

try {
  const pngBuffer = fs.readFileSync(pngPath)
  const icoBuffer = pngToIcoBuffer(pngBuffer)
  fs.writeFileSync(icoPath, icoBuffer)
  console.log(`Generated ${path.relative(projectRoot, icoPath)}`)
} catch (error) {
  console.error(error.message || error)
  process.exit(1)
}
