import moment from 'moment'
import { uuid } from 'uuidv4'

export const categorySeparator = { name: ' ', path: '', type: 'separator' }
export function sortReviews(reviews, sortCriteria) {
    const MINIMUM_REVIEW_COUNT = 3

    let result = Object.keys(reviews)
        .map(key => reviews[key])
        .map(review => {
            let updatedReview = Object.keys(review.replayHistory).map(key => ({
                replayCount: review.replayHistory[key].count,
                startTime: review.replayHistory[key].startTime,
                endTime: review.replayHistory[key].endTime,
                split: key
            }))

            return updatedReview.map(split => {
                return { ...review, ...split, id: uuid() }
            })
        })
        .flat()
        .filter(review => review.replayCount >= MINIMUM_REVIEW_COUNT)

    switch (sortCriteria) {
        case 'count-descending': {
            result = result.sort(
                (reviewA, reviewB) => reviewB.replayCount - reviewA.replayCount
            )

            break
        }

        case 'count-ascending': {
            result = result.sort(
                (reviewA, reviewB) => reviewA.replayCount - reviewB.replayCount
            )

            break
        }

        case 'same-folder': {
            result = result.sort((reviewA, reviewB) =>
                reviewA.path.localeCompare(reviewB.path)
            )

            result = groupReviewsBy({
                reviews: result,
                innerKey: 'path',
                partitionFunc: getFileDirectory,
                finalSortFunc: reviews =>
                    reviews.sort((reviewA, reviewB) =>
                        reviewA.path.localeCompare(reviewB.path)
                    )
            })
            break
        }

        case 'same-parent-folder': {
            result = result.sort((reviewA, reviewB) =>
                reviewA.path.localeCompare(reviewB.path)
            )

            result = groupReviewsBy({
                reviews: result,
                innerKey: 'path',
                partitionFunc: getFileParentDirectory,
                finalSortFunc: reviews =>
                    reviews.sort((reviewA, reviewB) =>
                        reviewA.path.localeCompare(reviewB.path)
                    )
            })
            break
        }
        case 'time-descending': {
            result = result.sort(
                (reviewA, reviewB) =>
                    reviewA.lastReviewDate - reviewB.lastReviewDate
            )

            result = groupReviewsBy({
                reviews: result,
                innerKey: 'lastReviewDate',
                partitionFunc: dateToDescription,
                finalSortFunc: reviews =>
                    reviews.sort(
                        (reviewA, reviewB) =>
                            reviewA.lastReviewDate - reviewB.lastReviewDate
                    )
            })

            break
        }

        case 'time-ascending': {
            result = result.sort(
                (reviewA, reviewB) =>
                    reviewB.lastReviewDate - reviewA.lastReviewDate
            )

            result = groupReviewsBy({
                reviews: result,
                innerKey: 'lastReviewDate',
                partitionFunc: dateToDescription,
                finalSortFunc: reviews =>
                    reviews.sort(
                        (reviewA, reviewB) =>
                            reviewB.lastReviewDate - reviewA.lastReviewDate
                    )
            })

            break
        }

        default: {
            result = result.sort(
                (reviewA, reviewB) => reviewB.replayCount - reviewA.replayCount
            )
        }
    }
    //   console.error('🚀 sortReviews ~ temp', temp);
    return result
}

export function groupReviewsBy({
    reviews,
    innerKey,
    partitionFunc,
    finalSortFunc
}) {
    let result = []
    const resultMap = {}

    for (let item of reviews) {
        let partitionKey = partitionFunc(item[innerKey])

        if (resultMap[partitionKey]?.length) {
            resultMap[partitionKey].push({ ...item, category: partitionKey })
        } else {
            resultMap[partitionKey] = []
            resultMap[partitionKey].push({ ...item, category: partitionKey })
        }
    }

    for (let item in resultMap) {
        let sortedItems = finalSortFunc(resultMap[item])

        result = [
            ...result,
            {
                ...categorySeparator,
                name: partitionFunc(
                    sortedItems[sortedItems.length - 1][innerKey]
                ),
                id: uuid()
            },
            ...sortedItems
        ]
    }

    return result
}
export function dateToDescription(myDate) {
    let now = moment(),
        days = now.diff(myDate, 'days'),
        weeks = now.diff(myDate, 'weeks'),
        result = ''

    if (parseInt(days) === 0) {
        result = 'Today'
    } else if (parseInt(days) > 0 && parseInt(days) < 7) {
        result = `${days} ${days > 1 ? 'days ago' : 'day ago'}`
    }
    //   else if (parseInt(weeks) === 0) {
    //     result = 'This week';
    //   }
    else if (parseInt(weeks) > 0 && parseInt(weeks) < 4) {
        result = `${weeks} ${weeks > 1 ? 'weeks ago' : 'week ago'}`
    } else {
        result = moment(myDate).fromNow()
    }

    return result
}
export function getFileDirectory(filePath) {
    if (filePath.indexOf('/') === -1) {
        // windows
        return filePath.substring(0, filePath.lastIndexOf('\\'))
    } else {
        // unix
        return filePath.substring(0, filePath.lastIndexOf('/'))
    }
}
export function getFileParentDirectory(path) {
    let filePath = getFileDirectory(path)

    if (filePath.indexOf('/') === -1) {
        // windows
        return filePath.substring(0, filePath.lastIndexOf('\\'))
    } else {
        // unix
        return filePath.substring(0, filePath.lastIndexOf('/'))
    }
}
export const scrollIntoView = (elementRef, playlistRef) => {
    const rect = elementRef.getBoundingClientRect()

    if (rect.top < 0 || rect.bottom > playlistRef.clientHeight) {
        elementRef.scrollIntoView()
    }
}
export const toMinutesSeconds = (seconds, getFullFormat = true) => {
    const format = val => `0${Math.floor(val)}`.slice(-2)
    const hours = seconds / 3600
    const minutes = (seconds % 3600) / 60
    const fullFormat = [hours, minutes, seconds % 60].map(format).join(':')
    const hourMinuteOnlyFormat = [hours, minutes].map(format).join(':')

    return getFullFormat ? fullFormat : hourMinuteOnlyFormat
}
export const getVideoSplitFactor = duration => {
    let videoSplit

    if (duration >= 30 * 60) videoSplit = 8
    else if (duration >= 20 * 60) videoSplit = 6
    else if (duration >= 10 * 60) videoSplit = 4
    else if (duration >= 5 * 60) videoSplit = 2
    else videoSplit = 1

    return videoSplit
}
export const convertToNearest30 = num => Math.round(num / 30) * 30
export const convertToNearestX = (num, X) => Math.floor(num / X) * X
export const handleMultipleKeyPress = (actionOne, actionTwo) => {
    const multipleKeysMap = {}

    return evt => {
        let { keyCode, type } = evt || Event // to deal with IE
        let isKeyDown = type === 'keydown'

        multipleKeysMap[keyCode] = isKeyDown

        if (isKeyDown && this.multipleKeysMap[8] && this.multipleKeysMap[189]) {
            //   backspace & Minus
            actionOne()
        } else if (isKeyDown && multipleKeysMap[8] && multipleKeysMap[187]) {
            //   backspace & Equal
            actionTwo()
        }
    }
}

export const categoryNextPreviousNavigation = (
    currentlyPlayingIndex_,
    filteredByCategory,
    goToNext = true
) => {
    let currentlyPlayingIndex = currentlyPlayingIndex_

    if (goToNext) currentlyPlayingIndex++
    else currentlyPlayingIndex--
    if (currentlyPlayingIndex > filteredByCategory.length - 1) {
        currentlyPlayingIndex = 0
    } else if (currentlyPlayingIndex < 0) {
        currentlyPlayingIndex = filteredByCategory.length - 1
    }
    return currentlyPlayingIndex
}
