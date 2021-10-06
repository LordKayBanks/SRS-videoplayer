import * as utility from '../utility/index.js'

export const playlistCreator = {
  PlayerState: {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5
  },
  configs: {
    delay: 1500
  },
  entries: [],
  index: -1, // current playlist index

  loadReviews(sortOptions) {
    let reviews = JSON.parse(localStorage.getItem('reviews'))

    reviews = utility.sortReviews(reviews, sortOptions)

    //  console.log('🚀 reviews', reviews);
    if (!reviews || !reviews.length) {
      // notify.display('no reviews available!')

      return false
    }

    playlistCreator.entries = []
    playlistCreator.cueVideo(reviews, false)

    return true
  },
  loadPlaylistFromStorage() {
    playlistCreator.entries = []

    const files = JSON.parse(localStorage.getItem('playlist'))

    if (!!files) {
      playlistCreator.cueVideo(files, false)
      //  } else notify.display('no playlist saved!')
    }
  },
  loadVideo(files) {
    playlistCreator.cueVideo(files)
  },
  cueVideo(files, isNewFiles = true) {
    playlistCreator.entries.push(...files)

    if (isNewFiles) {
      const temp = [...files].map(({ name, path, type, e }) => ({
        name,
        path,
        type
      }))

      temp.push(utility.categorySeparator)

      const oldPlaylist = JSON.parse(localStorage.getItem('playlist')) || []
      const newPlaylist = [...oldPlaylist, ...temp]

      localStorage.setItem('playlist', JSON.stringify(newPlaylist))
    }

    console.log(
      '🚀 ~ file: playlistCreator.js ~ line 49 ~ cueVideo ~ files',
      files
    )
  },
  onStateChange(c) {
    playlistCreator.onStateChange.cs.push(c)
  }
}
playlistCreator.onStateChange.cs = []

export default playlistCreator
