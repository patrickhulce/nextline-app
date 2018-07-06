const fs = require('fs')
const urlModule = require('url')
const puppeteer = require('puppeteer')
const {readSongsFromPlaylistFile} = require('./util')

// List obtained on Spotify with
// copy([...document.querySelectorAll('.tracklist-row')].map(x => `${x.querySelector('.tracklist-name').innerText} - ${x.querySelector('.second-line .link-subtle').innerText}`).join('\n'))
const SONG_LIST_FILE = process.argv[2] || 'songs.txt'
if (!fs.existsSync(SONG_LIST_FILE)) throw new Error('No song list file')
const SONG_LIST = readSongsFromPlaylistFile(SONG_LIST_FILE)

async function go() {
  const browser = await puppeteer.launch({headless: false, slowMo: 300})
  const page = await browser.newPage()

  for (const song of SONG_LIST) {
    try {
      const filename = song.lyricsTxtPath
      if (fs.existsSync(filename)) continue

      const query = new urlModule.URLSearchParams({q: song.searchName})
      const url = `https://genius.com/search?${query}`
      console.log('searching!', url)

      page.goto(url)
      await page.waitFor('search-result-item', {timeout: 10000})

      console.log('loading lyrics...')
      const $result = await page.$('search-result-item')
      const $info = await $result.$('.mini_card-info')
      await $info.click()
      await page.waitFor('.lyrics p')

      const lyrics = await page.evaluate(() => document.querySelector('.lyrics p').innerText)
      console.log('fetched lyrics for', song.title, song.artist)
      fs.writeFileSync(filename, lyrics)
    } catch (err) {
      console.log('failed to get lyrics for', song.title, song.artist)
    }
  }

  console.log('done!')
}

process.on('unhandledRejection', () => {})

go()
  .catch(console.error)
  .then(() => process.exit(0))
