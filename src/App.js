import './App.css'
import 'react-notifications-component/dist/theme.css'

import React, { Component } from 'react'
import ReactNotification, { store } from 'react-notifications-component'
import {
    categoryNextPreviousNavigation,
    convertToNearest30,
    convertToNearestX,
    getVideoSplitFactor,
    toMinutesSeconds
} from './utility/index'

import ReactPlayer from 'react-player'
import Toolbar from './components/toolbar'
import { findDOMNode } from 'react-dom'
import { hot } from 'react-hot-loader'
import screenfull from 'screenfull'

class App extends Component {
    state = {
        // url: 'https://www.youtube.com/watch?v=oUFJJNQGwhk',
        url: null,
        pip: false,
        playing: true,
        controls: true,
        light: false,
        volume: 1,
        muted: true,
        played: 0,
        loaded: 0,
        duration: 0,
        currentTime: 0,
        playbackRate: 5,
        loop: false,
        //  ======================
        playlist: [],
        sortType: 'playlist',
        repeatMode: 'repeat-all',
        currentlyPlaying: '',
        currentCategory: [],
        title: '',
        videoFormat: ''
        //==========
    }

    componentDidMount() {
        document.addEventListener('keydown', this.documentOnKeyDown)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.documentOnKeyDown)
    }

    notify = ({
        mainMessage = 'SR-Videoplayer: Sample Message Title',
        colorMessage = 'This is a sample message'
    }) => {
        store.addNotification({
            title: mainMessage,
            message: colorMessage,
            type: 'success',
            insert: 'top',
            container: 'top-left',
            animationIn: ['animate__animated', 'animate__fadeIn'],
            animationOut: ['animate__animated', 'animate__fadeOut'],
            dismiss: {
                duration: 10000,
                onScreen: true
            }
        })
    }

    toggleRepeatMode = () => {
        const NO_REPEAT_MODE = 'no-repeat'
        const REPEAT_ONE_MODE = 'repeat-one'
        const REPEAT_ALL_MODE = 'repeat-all'

        switch (this.state.repeatMode) {
            case NO_REPEAT_MODE: {
                this.setState({ repeatMode: REPEAT_ONE_MODE })
                break
            }
            case REPEAT_ONE_MODE: {
                this.setState({ repeatMode: REPEAT_ALL_MODE })
                break
            }
            case REPEAT_ALL_MODE: {
                this.setState({ repeatMode: NO_REPEAT_MODE })
                break
            }
            default: {
                this.setState({ repeatMode: REPEAT_ONE_MODE })
                break
            }
        }
    }

    handlePlayPause = () => {
        this.setState({ playing: !this.state.playing })
    }

    handleStop = () => {
        this.setState({ url: null, playing: false })
    }

    handleSetPlaybackRate = e => {
        this.setState({ playbackRate: parseFloat(e.target.value) })
    }

    setSpeed = value => {
        this.setState({ playbackRate: parseFloat(value) })
    }

    setVideoPosition = value => {
        this.setState({ currentTime: parseFloat(value) }, () =>
            this.player?.seekTo(parseFloat(value))
        )
    }

    handlePrevious = (_, playableUniqueID) => {
        const { category } = this.state.playlist.find(
            item => item.id === this.state.currentlyPlaying
        )

        if (category && this.state.currentCategory.length)
            return this.handleEnded(false)

        let currentlyPlaying
        let currentlyPlayingIndex
        let newCurrentlyPlayingOBJ

        if (playableUniqueID) {
            currentlyPlaying = playableUniqueID
            currentlyPlayingIndex = this.state.playlist.findIndex(
                item => item.id === currentlyPlaying
            )
        } else {
            currentlyPlaying = this.state.currentlyPlaying
            currentlyPlayingIndex = this.state.playlist.findIndex(
                item => item.id === currentlyPlaying
            )
            currentlyPlayingIndex--
        }

        if (currentlyPlayingIndex <= 0) {
            currentlyPlayingIndex = this.state.playlist.length - 1
        }

        newCurrentlyPlayingOBJ = this.state.playlist[currentlyPlayingIndex]

        const playingType = newCurrentlyPlayingOBJ['type']

        if (playingType === 'separator') {
            const nextPlayableIndex = currentlyPlayingIndex - 1
            const nextPlayableIndexOBJ = this.state.playlist[nextPlayableIndex]
            const playableUniqueID = nextPlayableIndexOBJ['id']
            return this.handlePrevious(null, playableUniqueID)
        }

        const newCurrentlyPlaying = newCurrentlyPlayingOBJ['id']

        this.setCurrentlyPlaying(newCurrentlyPlaying, newCurrentlyPlayingOBJ)
        // if (this.reviewConfig.reviewMode !== 'inactive') {
        //     setTimeout(() => {
        //         this.setupReviewMode({})
        //     }, 1000)
        // }
    }

    handleNext = (_, playableUniqueID) => {
        const res = this.state.playlist.find(
            item => item.id === this.state.currentlyPlaying
        )

        if (res?.category && this.state.currentCategory.length)
            return this.handleEnded(true)

        let currentlyPlaying
        let currentlyPlayingIndex
        let newCurrentlyPlayingOBJ

        if (playableUniqueID) {
            currentlyPlaying = playableUniqueID
            currentlyPlayingIndex = this.state.playlist.findIndex(
                item => item.id === currentlyPlaying
            )
        } else {
            currentlyPlaying = this.state.currentlyPlaying
            currentlyPlayingIndex = this.state.playlist.findIndex(
                item => item.id === currentlyPlaying
            )
            currentlyPlayingIndex++
        }

        if (currentlyPlayingIndex >= this.state.playlist.length - 1) {
            currentlyPlayingIndex = 0
        }

        newCurrentlyPlayingOBJ = this.state.playlist[currentlyPlayingIndex]

        const playingType = newCurrentlyPlayingOBJ['type']

        if (playingType === 'separator') {
            const nextPlayableIndex = currentlyPlayingIndex + 1
            const nextPlayableIndexOBJ = this.state.playlist[nextPlayableIndex]
            const playableUniqueID = nextPlayableIndexOBJ['id']
            return this.handleNext(null, playableUniqueID)
        }

        const newCurrentlyPlaying = newCurrentlyPlayingOBJ['id']

        this.setCurrentlyPlaying(newCurrentlyPlaying, newCurrentlyPlayingOBJ)
        // if (this.reviewConfig.reviewMode !== 'inactive') {
        //     setTimeout(() => {
        //         this.setupReviewMode({})
        //     }, 1000)
        // }
    }

    handlePause = () => {
        //  console.log('onPause')
        this.setState({ playing: false })
    }

    handlePlay = () => {
        this.setState({ playing: true })
        console.log('onPlay')
    }

    handleError = error => {
        this.handleNext()
        console.log('🚀 ~ file: App.js ~ line 169 ~ App ~ error', error)
    }

    handleEnded = (goToNext = true) => {
        const currentlyPlayingUniqueID = this.state.currentlyPlaying

        const { category } = this.state.playlist.find(
            item => item.id === currentlyPlayingUniqueID
        )

        if (category && this.state.currentCategory.length) {
            const filteredByCategory = this.state.playlist.filter(item => {
                return this.state.currentCategory.includes(item.category)
            })
            let currentlyPlayingIndex = filteredByCategory.findIndex(
                item => item.id === currentlyPlayingUniqueID
            )

            // currentlyPlayingIndex++
            // if (currentlyPlayingIndex >= filteredByCategory.length - 1) {
            //     currentlyPlayingIndex = 0
            // }
            currentlyPlayingIndex = categoryNextPreviousNavigation(
                currentlyPlayingIndex,
                filteredByCategory,
                goToNext
            )

            const newCurrentlyPlayingOBJ =
                filteredByCategory[currentlyPlayingIndex]

            const newCurrentlyPlaying = newCurrentlyPlayingOBJ['id']

            this.setCurrentlyPlaying(
                newCurrentlyPlaying,
                newCurrentlyPlayingOBJ
            )
        } else if (this.state.repeatMode === 'no-repeat') {
            this.handleNext()
        } else if (this.state.repeatMode === 'repeat-one') {
            this.setVideoPosition(0)
        } else if (this.state.repeatMode === 'repeat-all') {
            this.handleNext()
        }

        console.log('onEnded": ', this.state)
    }

    setCurrentlyPlayingPublic = (uniqueId, callback = () => {}) => {
        const chosenItemIndex = this.state.playlist.findIndex(
            item => item.id === uniqueId
        )

        const chosenItemItemOBJ = this.state.playlist[chosenItemIndex]
        const playingType = chosenItemItemOBJ['type']

        if (playingType === 'separator') {
            const nextPlayableIndex = chosenItemIndex + 1
            const nextPlayableIndexOBJ = this.state.playlist[nextPlayableIndex]
            const playableUniqueID = nextPlayableIndexOBJ['id']

            this.setCurrentlyPlayingPublic(playableUniqueID)
        }

        this.setCurrentlyPlaying(uniqueId, chosenItemItemOBJ, callback)
    }

    setCurrentCategory = (category, addCategory) => {
        let newCategories

        if (addCategory) {
            newCategories = [...this.state.currentCategory, category]
            newCategories = [...new Set(newCategories)]
        } else {
            newCategories = this.state.currentCategory.filter(
                item => item !== category
            )
        }

        this.setState(
            {
                currentCategory: newCategories
            },
            () => {
                if (addCategory) {
                    this.handleEnded()
                }
            }
        )
    }

    setCurrentlyPlaying = (
        uniqueId,
        currentlyPlayingOBJ,
        callback = () => {}
    ) => {
        this.setState(
            {
                url: currentlyPlayingOBJ.path,
                currentlyPlaying: uniqueId,
                playing: true,
                title: currentlyPlayingOBJ.name
            },
            () => {
                callback()
            }
            // console.error('🚀 🚀 🚀 currentlyPlaying: ', this.state)
        )
    }

    setPlaylist = (items = [], isReview, callback = () => {}) => {
        if (!items.length) return

        let currentlyPlaying
        let newPlaylist
        let nextItemToPlay

        if (isReview) {
            newPlaylist = [...items]

            let index = 0

            nextItemToPlay = newPlaylist[index]

            while (nextItemToPlay?.type === 'separator') {
                nextItemToPlay = newPlaylist[index]
                index = index + 1
            }

            currentlyPlaying = newPlaylist.find(
                item => item.id === nextItemToPlay.id
            )
        } else {
            const currentPlaylist = this.state.playlist

            newPlaylist = [...currentPlaylist, ...items].filter(
                item => !item.isReview
            )
            // .filter(item => !item.category)

            let index = 0

            nextItemToPlay = items[index]

            while (nextItemToPlay?.type === 'separator') {
                nextItemToPlay = items[index]
                index = index + 1
            }

            currentlyPlaying = newPlaylist.find(
                item => item.id === nextItemToPlay.id
            )
        }

        this.setState(
            {
                playlist: newPlaylist,
                currentlyPlaying: currentlyPlaying.id,
                url: nextItemToPlay?.path,
                playing: true
            },
            () => {
                // console.log('🚀 ==> this.state.playlist', this.state.playlist)
                callback()
            }
        )
    }

    setSortType = sortType => {
        this.setState({ sortType }, () => {})
    }

    load = url => {
        this.setState({
            url,
            played: 0,
            loaded: 0,
            pip: false
        })
    }

    handleDuration = duration => {
        //  console.log('onDuration', duration)
        this.setState({ duration })
    }

    handleToggleControls = () => {
        const url = this.state.url

        this.setState(
            {
                controls: !this.state.controls,
                url: null
            },
            () => this.load(url)
        )
    }

    handleToggleLight = () => {
        this.setState({ light: !this.state.light })
    }

    handleToggleLoop = () => {
        this.setState({ loop: !this.state.loop })
    }

    handleVolumeChange = e => {
        this.setState({ volume: parseFloat(e.target.value) })
    }

    handleToggleMuted = () => {
        this.setState({ muted: !this.state.muted })
    }

    handleTogglePIP = () => {
        this.setState({ pip: !this.state.pip })
    }

    handleEnablePIP = () => {
        //  console.log('onEnablePIP')
        this.setState({ pip: true })
    }

    handleDisablePIP = () => {
        //  console.log('onDisablePIP')
        this.setState({ pip: false })
    }

    handleSeekMouseDown = e => {
        this.setState({ seeking: true })
    }

    handleSeekChange = e => {
        this.setState({ played: parseFloat(e.target.value) })
    }

    handleSeekMouseUp = e => {
        this.setState({ seeking: false })
        this.player?.seekTo(parseFloat(e.target.value))
    }

    handleProgress = state => {
        //  console.log('onProgress', state)

        // We only want to update time slider if we are not currently seeking
        if (!this.state.seeking) {
            this.setState(state)
        }
    }

    handleClickFullscreen = () => {
        screenfull.request(findDOMNode(this.player))
    }

    renderLoadButton = (url, label) => {
        return <button onClick={() => this.load(url)}>{label}</button>
    }

    ref = player => {
        this.player = player
    }

    style = {
        position: 'absolute',
        left: '-886px',
        height: '300px',
        width: '250px',
        background: ' #a58181'
    }

    // ==========================================================
    // ==========================================================
    reviewConfig = {
        reviewMode: 'inactive',
        reviewRangeStart: 0,
        reviewRangeEnd: 0
    }

    trackingConfig = {
        trackingMode: 'inactive',
        startPosition: 0,
        endPosition: 120,
        unsubscribe: null,
        defaultStartOffset: 30,
        defaultEndOffset: 120,
        startOffset: 30,
        interval: 120,
        cachedPlaybackRate: 2.0
    }

    alertConfig = {
        alertConfigMidwayTime: null,
        alertConfigOneThirdTime: null,
        alertConfigTwoThirdTime: null,
        speedMode: 0, //1
        lastKeypressTime: null,
        delta: 500
    }

    setupForStandardTrackingMode = () => {
        if (this.reviewConfig.reviewMode !== 'inactive') {
            this.reviewConfig.reviewMode = 'inactive'
            // this.setState({ reviewMode: 'inactive' })
            this.setupReviewMode({ activate: false })
        }

        let videoSplit = getVideoSplitFactor(this.player?.getDuration())

        this.trackingConfig.interval = parseInt(
            this.player?.getDuration() / videoSplit
        )

        this.trackingConfig.startOffset = convertToNearestX(
            this.player?.getCurrentTime(),
            this.trackingConfig.interval
        )
        //====================
        this.trackingMode(null, false)
    }

    speedTracker = 2
    trackingMode = (offSet, renormalize = true) => {
        clearInterval(this.alertConfig.alertConfigMidwayTime)
        clearInterval(this.alertConfig.alertConfigTwoThirdTime)
        clearInterval(this.alertConfig.alertConfigOneThirdTime)
        //   ========================

        if (this.trackingConfig.unsubscribe) {
            clearInterval(this.trackingConfig.unsubscribe)
            this.trackingConfig.unsubscribe = null
            this.trackingConfig.trackingMode = 'inactive'
            this.notify({
                mainMessage: 'Tracking mode:',
                colorMessage: 'Tracking: Stopped!'
            })
        } else {
            if (renormalize) {
                this.trackingConfig.startPosition = Math.max(
                    convertToNearest30(this.player?.getCurrentTime()) - offSet,
                    0
                )

                this.trackingConfig.endPosition = Math.min(
                    this.trackingConfig.startPosition + offSet,
                    this.player?.getDuration()
                )
            } else {
                this.trackingConfig.startPosition = Math.max(
                    this.trackingConfig.startOffset,
                    0
                )

                this.trackingConfig.endPosition = Math.min(
                    this.trackingConfig.startPosition +
                        this.trackingConfig.interval,
                    this.player?.getDuration()
                )
            }

            this.setSpeed(2)

            const minDurationForVideoSplitFactor = 5 * 60

            this.player?.getDuration() < minDurationForVideoSplitFactor
                ? this.setVideoPosition(0)
                : this.setVideoPosition(
                      parseInt(this.trackingConfig.startPosition)
                  )

            this.trackingConfig.unsubscribe = setInterval(() => {
                if (
                    this.player?.getCurrentTime() >=
                        this.trackingConfig.endPosition - 5 ||
                    this.player?.getCurrentTime() <
                        this.trackingConfig.startPosition
                ) {
                    this.setVideoPosition(this.trackingConfig.startPosition)

                    const speedTOptions = [2, 3, 10]

                    this.speedTracker =
                        (this.speedTracker + 1) % speedTOptions.length
                    this.setSpeed(speedTOptions[this.speedTracker])
                    this.studyStatisticsTracker()
                }
            }, 1000)
            this.trackingConfig.trackingMode = 'active'
            this.notifyReplayStatus()
            // this.notify({
            //     mainMessage: 'Tracking mode:',
            //     colorMessage: 'Tracking: Started!'
            // })
        }
    }
    // =============================================================================
    // =============================================================================

    moveToNextPlaybackRange = () => {
        this.trackingConfig.startPosition = Math.min(
            this.trackingConfig.startPosition + this.trackingConfig.interval,
            this.player?.getDuration() - this.trackingConfig.interval
        )

        this.trackingConfig.endPosition = Math.min(
            this.trackingConfig.startPosition + this.trackingConfig.interval,
            this.player?.getDuration()
        )
        this.setVideoPosition(this.trackingConfig.startPosition)
        this.notifyReplayStatus()
    }

    moveToPreviousPlaybackRange = () => {
        this.trackingConfig.startPosition = Math.max(
            this.trackingConfig.startPosition - this.trackingConfig.interval,
            0
        )

        this.trackingConfig.endPosition = Math.min(
            this.trackingConfig.startPosition + this.trackingConfig.interval,
            this.player?.getDuration()
        )
        this.setVideoPosition(this.trackingConfig.startPosition)
        this.notifyReplayStatus()
    }

    unsubscribeToReview = null

    setupReviewMode = ({ activate = true, loopCurrentSplit = false }) => {
        if (!activate) {
            clearInterval(this.unsubscribeToReview)
            this.reviewConfig.reviewMode = 'inactive'
            return this.notify({
                mainMessage: 'reviewMode:',
                colorMessage: 'Review: Stopped!'
            })
        }

        if (this.trackingConfig.trackingMode === 'active') {
            this.trackingConfig.trackingMode = 'inactive'
            this.trackingMode(null, false)
        }
        // =====================================

        if (this.reviewConfig.reviewRangeStart)
            this.setVideoPosition(this.reviewConfig.reviewRangeStart)

        clearInterval(this.unsubscribeToReview)
        if (loopCurrentSplit) {
            this.reviewConfig.reviewMode = 'loop'
            this.notify({
                mainMessage: 'reviewMode:',
                colorMessage: ' Review mode: Looping'
            })
        } else {
            this.reviewConfig.reviewMode = 'active'
            this.notify({
                mainMessage: 'reviewMode:',
                colorMessage: ' Review mode: Active'
            })
        }

        this.watcherForReviewMode(loopCurrentSplit)
    }

    watcherForReviewMode = (loopCurrentSplit = false) => {
        this.unsubscribeToReview = setInterval(() => {
            if (
                this.player?.getCurrentTime() <
                this.reviewConfig.reviewRangeStart
            ) {
                this.setVideoPosition(this.reviewConfig.reviewRangeStart)
            }

            if (loopCurrentSplit) {
                if (
                    this.player?.getCurrentTime() >=
                    this.reviewConfig.reviewRangeEnd - 5
                ) {
                    this.setVideoPosition(this.reviewConfig.reviewRangeStart)
                    this.studyStatisticsTracker(0.5)
                }
            } else {
                if (
                    this.player?.getCurrentTime() >=
                    this.reviewConfig.reviewRangeEnd - 5
                ) {
                    this.studyStatisticsTracker(0.25)
                    // todo ========
                    this.handleNext()
                    // this.setCurrentlyPlaying(
                    //     this.state.playlist[this.state.currentlyPlaying + 1]
                    // )
                    this.setState({
                        currentlyPlaying: this.state.currentlyPlaying + 1
                    })
                    this.setVideoPosition(this.reviewConfig.reviewRangeStart)
                    //  ========
                    clearInterval(this.unsubscribeToReview)
                    this.watcherForReviewMode()
                    // ===================
                    //  this.setVideoPosition(this.reviewConfig.reviewRangeStart);
                    //  this.setSpeed(speedTOptions[this.speedTracker]);
                    //  studyStatisticsTracker();
                    //   this.notifyReplayStatus();
                }
            }
        }, 1000)
    }

    studyStatisticsTracker = (increment = 1) => {
        const currentSplit = parseInt(
            this.trackingConfig.endPosition / this.trackingConfig.interval
        )

        let reviews = JSON.parse(localStorage.getItem('reviews'))
        const reviewExists = !!reviews
        let updatedReview = reviewExists ? reviews : {}
        let review = updatedReview[this.state.url]

        if (!review) {
            review = {
                name: this.state.title,
                path: this.state.url,
                type: this.state.videoFormat,
                replayHistory: {
                    [`split-${currentSplit}`]: {
                        count: increment,
                        startTime: this.trackingConfig.startPosition,
                        endTime: this.trackingConfig.endPosition
                    }
                },
                lastReviewDate: Date.now()
            }
        } else {
            if (!review.replayHistory[`split-${currentSplit}`]) {
                review.replayHistory[`split-${currentSplit}`] = {
                    count: increment,
                    startTime: this.trackingConfig.startPosition,
                    endTime: this.trackingConfig.endPosition
                }
            } else {
                review.replayHistory[`split-${currentSplit}`].count =
                    review.replayHistory[`split-${currentSplit}`].count +
                    increment
            }

            review.lastReviewDate = Date.now()
        }

        updatedReview[this.state.url] = { ...review }
        localStorage.setItem('reviews', JSON.stringify({ ...updatedReview }))
        this.notifyReplayStatus()
    }

    alertAtKeyMoments = () => {
        clearInterval(this.alertConfig.alertConfigMidwayTime)
        clearInterval(this.alertConfig.alertConfigTwoThirdTime)
        clearInterval(this.alertConfig.alertConfigOneThirdTime)
        this.alertConfig.speedMode === 1 && this.setSpeed(2.5)
        this.alertConfig.speedMode === 2 && this.setSpeed(2.5)
        //   =================
        //   const standardLength = 10 * 60; //10mins
        //   const minimumLength = 6 * 60; //6mins
        //   if (this.player?.getDuration()< minimumLength) return;
        //   =================>
        this.alertConfig.alertConfigOneThirdTime = setInterval(() => {
            const _25PercentTime = this.player?.getDuration() * 0.25 //80%

            if (
                // this.player?.getDuration()> standardLength &&
                this.player?.getCurrentTime() > _25PercentTime &&
                this.player?.getCurrentTime() < _25PercentTime * 2
            ) {
                this.alertConfig.speedMode === 1 && this.setSpeed(3)
                this.alertConfig.speedMode === 2 && this.setSpeed(3.5)

                const remainTime = this.player?.getDuration() - _25PercentTime //25%

                this.notify({
                    mainMessage: `Alert: Just Past 25%`,
                    colorMessage: `[${toMinutesSeconds(remainTime, false)}]`
                })
                clearInterval(this.alertConfig.alertConfigOneThirdTime)
            }
        }, 2000)

        //   =================>
        this.alertConfig.alertConfigMidwayTime = setInterval(() => {
            const midwayTime = this.player?.getDuration() * 0.5 //60%

            if (this.player?.getCurrentTime() > midwayTime) {
                this.alertConfig.speedMode === 1 && this.setSpeed(3)
                this.alertConfig.speedMode === 2 && this.setSpeed(4)

                const remainTime = this.player?.getDuration() - midwayTime //40%

                this.notify({
                    mainMessage: `Alert:Just Past 50%`,
                    colorMessage: `[${toMinutesSeconds(remainTime, false)}]`
                })
                clearInterval(this.alertConfig.alertConfigMidwayTime)
            }
        }, 2000)

        //   =====================>
        this.alertConfig.alertConfigTwoThirdTime = setInterval(() => {
            const _75PercentTime = this.player?.getDuration() * 0.75 //80%

            if (
                // this.player?.getDuration()> standardLength &&
                this.player?.getCurrentTime() > _75PercentTime
            ) {
                this.alertConfig.speedMode === 1 && this.setSpeed(3.5)
                this.alertConfig.speedMode === 2 && this.setSpeed(4.5)

                const remainTime = this.player?.getDuration() - _75PercentTime //25%

                this.notify({
                    mainMessage: `Alert:Just Past 75%`,
                    colorMessage: `[${toMinutesSeconds(remainTime, false)}]`
                })
                clearInterval(this.alertConfig.alertConfigTwoThirdTime)
            }
        }, 2000)
    }

    notifyReplayStatus = () => {
        const currentSplit = parseInt(
            this.trackingConfig.endPosition / this.trackingConfig.interval
        )
        const totalSplit = parseInt(
            this.player?.getDuration() / this.trackingConfig.interval
        )

        let reviews = JSON.parse(localStorage.getItem('reviews'))

        let videoStat =
            reviews &&
            reviews[this.state.url]?.replayHistory[`split-${currentSplit}`]
                ?.count

        this.notify({
            mainMessage: `Video Stats: Split watch count:: ${
                videoStat ?? 0
            } times!\r\nReplay: is ${
                this.trackingConfig.trackingMode === 'active' ? 'ON!:' : 'OFF!:'
            }\r\nStart Time: ${toMinutesSeconds(
                this.trackingConfig.startPosition
            )}\r\nEnd Time:  ${toMinutesSeconds(
                this.trackingConfig.endPosition
            )}`,
            colorMessage: `Position:   [${currentSplit}] of [${totalSplit}]`,
            delay: 20000
        })
    }
    //=================================================================
    //=================================================================

    // video.addEventListener('seeked', this.alertAtKeyMoments);
    videoOnLoadeddata = () => {
        //   clearInterval(this.trackingConfig.unsubscribe);
        this.alertAtKeyMoments()

        //   setupForStandardTrackingMode();
        //   this.trackingMode(null, false);
        //   setTimeout(this.notifyReplayStatus, 5000);

        if (this.trackingConfig.unsubscribe) {
            this.trackingConfig.unsubscribe = null
            this.setupForStandardTrackingMode()
            this.trackingMode(null, false)
            return setTimeout(this.notifyReplayStatus, 5000)
        }

        this.notify({
            mainMessage: `Title: ${this.state.title}`,
            colorMessage: `[${toMinutesSeconds(this.player?.getDuration())}]`
        })
    }

    // video.addEventListener('timeupdate', detectBackwardSkipSeek);

    videoOnPause = () => {
        //   this.trackingConfig.unsubscribe && studyStatisticsTracker(0.5);
        this.studyStatisticsTracker(0.5)
    }

    videoOnended = () => {
        if (this.trackingConfig.unsubscribe) {
            this.setVideoPosition(this.trackingConfig.startPosition)
            this.notifyReplayStatus()
        }

        //   this.setSpeed(this.trackingConfig.cachedPlaybackRate || 3);

        //   clearInterval(this.trackingConfig.unsubscribe);
        //   this.trackingConfig = {};

        this.notify({
            mainMessage: `Toggle Speed Stopped:`,
            colorMessage: ''
        })
    }

    seekToTime = value => {
        let seekToTime = this.player?.getCurrentTime() + value

        if (seekToTime < 0) {
            this.setVideoPosition(0)
        } else if (seekToTime > this.player?.getDuration())
            this.setVideoPosition(this.player?.getDuration())

        this.setVideoPosition(seekToTime)
        // this.notify({
        //     mainMessage: 'Sample Title: ',
        //     colorMessage: `Current Position: <${toMinutesSeconds(
        //         this.player?.getCurrentTime()
        //     )}> of <${toMinutesSeconds(this.player?.getDuration())}>`
        // })
    }

    reduceSpeed = (value = 0.25) => {
        const MIN_SPEED = 0.5
        let newSpeed = this.state.playbackRate - value

        newSpeed = newSpeed < MIN_SPEED ? MIN_SPEED : newSpeed
        this.setSpeed(newSpeed)
    }

    increaseSpeed = (value = 0.25) => {
        const MAX_SPEED = 15
        let newSpeed = this.state.playbackRate + value

        newSpeed = newSpeed > MAX_SPEED ? MAX_SPEED : newSpeed
        this.setSpeed(newSpeed)
    }

    // ==========================================================
    // ==========================================================

    rules = [
        {
            condition(meta, code, shift) {
                return (
                    code === 'Backslash' ||
                    code === 'Quote' ||
                    code === 'Semicolon'
                )
            },
            action(e) {
                if (e.code === 'Semicolon') {
                    this.setupForStandardTrackingMode()
                    this.trackingMode(null, false)
                } else if (e.code === 'Quote') {
                    this.trackingMode(parseInt(this.player?.getDuration()))
                } else if (e.code === 'Backslash') {
                    this.notifyReplayStatus()
                }
                return true
            }
        },
        {
            condition(meta, code, shift) {
                return (
                    code === 'KeyA' ||
                    code === 'KeyS' ||
                    code === 'Comma' ||
                    code === 'Period'
                )
            },
            action(e) {
                if (e.code === 'KeyA' || e.code === 'Comma') {
                    this.moveToPreviousPlaybackRange()
                } else {
                    this.moveToNextPlaybackRange()
                }
                return true
            }
        },

        //=================
        {
            condition(meta, code, shift) {
                return code === 'KeyN' || code === 'KeyB'
            },
            action(event) {
                if (event.code === 'KeyN') {
                    this.handleNext()
                } else {
                    this.handlePrevious()
                }
                return true
            }
        },
        {
            condition(meta, code, shift) {
                return code === 'ArrowRight' || code === 'ArrowLeft'
            },
            action(event) {
                event.preventDefault()

                if (event.code === 'ArrowRight') {
                    this.seekToTime(20)
                } else {
                    this.seekToTime(-20)
                }
                return true
            }
        },
        //=================
        {
            condition(meta, code) {
                return code === 'BracketRight' || code === 'BracketLeft'
            },
            action(e) {
                if (e.code === 'BracketRight') {
                    this.increaseSpeed()
                } else {
                    this.reduceSpeed()
                }
                return true
            }
        },
        {
            condition(meta, code) {
                return code === 'KeyM'
            },
            action() {
                this.handleToggleMuted()
                return true
            }
        },
        {
            condition(meta, code, shift) {
                return code === 'ArrowDown' || code === 'Space'
            },
            action(event) {
                event.preventDefault()
                this.handlePlayPause()
                return true
            }
        },
        {
            condition(meta, code, shift) {
                return code === 'MetaRight' || code === 'AltRight'
            },
            action(event) {
                event.preventDefault()
                if (this.trackingConfig.trackingMode === 'active') {
                    if (event.code === 'AltRight')
                        this.studyStatisticsTracker(10)
                    else this.studyStatisticsTracker(-2)
                    // this.notify.display('Split count : 15')
                }
                return true
            }
        },
        {
            // change volume
            condition(meta, code) {
                if (code === 'KeyQ' || code === 'KeyW') {
                    return true
                }
            },
            action(e) {
                const volume = Math.min(
                    1,
                    Math.max(
                        0,
                        Math.round(
                            this.state.volume * 100 +
                                (e.code === 'KeyW' ? 5 : -5)
                        ) / 100
                    )
                )

                this.setState({ volume })
                // notify.display('Volume: ' + (v.volume * 100).toFixed(0) + '%')
                return true
            }
        }
    ]

    documentOnKeyDown = e => {
        const meta = e.metaKey || e.ctrlKey

        for (let { condition, action } of this.rules) {
            condition = condition.bind(this)
            action = action.bind(this)
            if (condition(meta, e.code, e.shiftKey)) {
                if (action(e)) {
                    e.preventDefault()
                }

                break
            }
        }
    }

    // ==========================================================
    // ==========================================================

    render() {
        const {
            url,
            playing,
            controls,
            light,
            volume,
            muted,
            loop,
            played,
            // loaded,
            // duration,
            playbackRate,
            pip
        } = this.state
        return (
            <div className="app">
                <div className="player-wrapper">
                    <ReactPlayer
                        ref={this.ref}
                        className="react-player"
                        width="auto"
                        height="100vh"
                        url={url}
                        pip={pip}
                        playing={playing}
                        played={played}
                        controls={controls}
                        light={light}
                        loop={loop}
                        playbackRate={playbackRate}
                        volume={volume}
                        muted={muted}
                        onReady={() => {
                            console.log('onReady')
                            // this.videoOnLoadeddata()
                        }}
                        onStart={() => {
                            console.log('onStart')
                            this.videoOnLoadeddata()
                        }}
                        onPlay={this.handlePlay}
                        onPause={this.handlePause}
                        onSeek={e => console.log('onSeek', e)}
                        onEnded={this.handleEnded}
                        onError={this.handleError}
                        onBuffer={() => console.log('onBuffer')}
                        onEnablePIP={this.handleEnablePIP}
                        onDisablePIP={this.handleDisablePIP}
                        onProgress={this.handleProgress}
                        onDuration={this.handleDuration}
                        config={{
                            youtube: {
                                playerVars: {
                                    showinfo: 1,
                                    // disablekb: 1,
                                    iv_load_policy: 3,
                                    modestbranding: 1,
                                    rel: 0
                                }
                            }
                        }}
                    />

                    <Toolbar
                        sortType={this.state.sortType}
                        setSortType={this.setSortType}
                        reviewMode={this.reviewConfig.reviewMode}
                        setupReviewMode={this.setupReviewMode}
                        trackingMode={this.trackingConfig.trackingMode}
                        setupForStandardTrackingMode={
                            this.setupForStandardTrackingMode
                        }
                        setCurrentCategory={this.setCurrentCategory}
                        currentlyPlaying={this.state.currentlyPlaying}
                        setCurrentlyPlaying={this.setCurrentlyPlayingPublic}
                        playlist={this.state.playlist}
                        setPlaylist={this.setPlaylist}
                        handlePrevious={this.handlePrevious}
                        handleNext={this.handleNext}
                        notify={this.notify}
                        toggleRepeatMode={this.toggleRepeatMode}
                        repeatMode={this.state.repeatMode}
                    ></Toolbar>
                    <ReactNotification></ReactNotification>
                </div>
            </div>
        )
    }
}

export default hot(module)(App)
