import * as utility from './index.js'
import { uuid } from 'uuidv4'

export const playlistCreator = {
    entries: [],
    loadReviews(sortOptions) {
        let reviews = JSON.parse(localStorage.getItem('reviews'))

        reviews = utility.sortReviews(reviews, sortOptions)

        if (!reviews || !reviews.length) return []

        playlistCreator.entries = []
        playlistCreator.cueVideo(reviews, false)

        return true
    },
    loadPlaylistFromStorage() {
        playlistCreator.entries = []

        const files = JSON.parse(localStorage.getItem('playlist'))

        if (files) playlistCreator.cueVideo(files, false)
    },
    loadVideo(files = [], isNewFiles = true) {
        playlistCreator.cueVideo(files, isNewFiles)
    },
    cueVideo(files = [], isNewFiles = true) {
        playlistCreator.entries.push(...files)

        if (isNewFiles) {
            const temp = [...files].map(({ name, path, type, e }) => {
                let uniqueId = uuid()

                return {
                    name,
                    path,
                    type,
                    id: uniqueId
                }
            })

            temp.push({ ...utility.categorySeparator, id: uuid() })

            const oldPlaylist =
                JSON.parse(localStorage.getItem('playlist')) || []

            const newPlaylist = [...oldPlaylist, ...temp]

            localStorage.setItem('playlist', JSON.stringify(newPlaylist))
        }

        //  console.log('🚀 files', files)
    }
}

export default playlistCreator
