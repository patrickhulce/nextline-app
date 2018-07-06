const fs = require('fs')
const path = require('path')

const TEXT_DB_PATH = path.join(__dirname, 'lyrics.json')

function readSongsFromPlaylistFile(file) {
  const songs = fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l)

  return songs
    .map(song => {
      const parts = song.split(' - ')
      const playlist = path.basename(file).match(/songs-(.*)\.txt$/)[1]
      const title = parts[0]
      const artist = parts[parts.length - 1]
      const searchName = song.replace(/[^a-z0-9\s]+/gi, '').replace(/\s+/g, ' ')
      const escapedName = song
        .replace(/[^a-z0-9]+/gi, '_')
        .replace(/(^_|_$)/g, '')
        .toLowerCase()
      const lyricsTxtPath = path.join(__dirname, `texts/${escapedName}.txt`)
      return {title, artist, playlist, searchName, escapedName, lyricsTxtPath}
    })
    .sort((songA, songB) => songA.artist.localeCompare(songB.artist))
}

function readAllSongsFromPlaylists() {
  const songs = []
  for (const file of fs.readdirSync(__dirname)) {
    if (file.endsWith('.txt')) {
      songs.push(...readSongsFromPlaylistFile(path.join(__dirname, file)))
    }
  }

  return songs
}

function readAllSongsFromTextDatabase() {
  return JSON.parse(fs.readFileSync(TEXT_DB_PATH, 'utf8'))
}

function writeSongsToTextDatabase(songs) {
  const dbSongs = readAllSongsFromTextDatabase()
  for (const song of songs) {
    const dbSong = dbSongs.find(item => item.escapedName === song.escapedName)
    if (dbSong) {
      Object.assign(dbSong, song)
    } else {
      dbSongs.push(song)
    }
  }

  for (const dbSong of dbSongs) {
    dbSong.lyricsTxtPath = undefined
  }

  const lines = dbSongs.map(song => '  ' + JSON.stringify(song))
  const content = `[\n${lines.join(',\n')}\n]\n`
  fs.writeFileSync(TEXT_DB_PATH, content)
}

module.exports = {
  readSongsFromPlaylistFile,
  readAllSongsFromPlaylists,
  readAllSongsFromTextDatabase,
  writeSongsToTextDatabase,
}
