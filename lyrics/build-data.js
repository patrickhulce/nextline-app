const fs = require('fs')
const path = require('path')
const {readAllSongsFromPlaylists, writeSongsToTextDatabase} = require('./util')

const TEXTS_PATH = path.join(__dirname, 'texts')

const songs = readAllSongsFromPlaylists()
for (const file of fs.readdirSync(TEXTS_PATH)) {
  const song = songs.find(song => file.includes(song.escapedName))
  if (!song) continue

  song.lyrics = fs.readFileSync(path.join(TEXTS_PATH, file), 'utf8')
}

writeSongsToTextDatabase(songs)
