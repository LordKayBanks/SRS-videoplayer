import './App.css'

import React, { Component } from 'react'
import {
    convertToNearest30,
    convertToNearestX,
    getVideoSplitFactor,
    toMinutesSeconds,
    categoryNextPreviousNavigation
} from './utility/index'
import ReactNotification, { store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'

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
        playbackRate: 10,
        loop: false,
        //  ======================
        playlist: [],
        repeatMode: 'repeat-all',
        currentlyPlaying: '',
        currentCategory: [],
        title: '',
        videoFormat: '',
        reviewModeSate: false,
        reviewRangeStart: 0,
        reviewRangeEnd: 0,
        trackingModeState: 'inactive'
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
            this.player.seekTo(parseFloat(value))
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
    }

    handleNext = (_, playableUniqueID) => {
        const { category } = this.state.playlist.find(
            item => item.id === this.state.currentlyPlaying
        )

        if (category && this.state.currentCategory.length)
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

        this.setState({
            currentCategory: newCategories
        })
        // () => console.log('🚀 ==> category', this.state.currentCategory)
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
                playing: true
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

            newPlaylist = [...currentPlaylist, ...items]

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
            callback()
        )
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
        this.player.seekTo(parseFloat(e.target.value))
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

    replayConfig = {
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

    studyStatisticsTracker = (increment = 1) => {
        const currentSplit = parseInt(
            this.replayConfig.endPosition / this.replayConfig.interval
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
                        startTime: this.replayConfig.startPosition,
                        endTime: this.replayConfig.endPosition
                    }
                },
                lastReviewDate: Date.now()
            }
        } else {
            if (!review.replayHistory[`split-${currentSplit}`]) {
                review.replayHistory[`split-${currentSplit}`] = {
                    count: increment,
                    startTime: this.replayConfig.startPosition,
                    endTime: this.replayConfig.endPosition
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

    setupForStandardTrackingMode = () => {
        if (this.state.reviewModeSate !== 'inactive') {
            this.setState({ reviewModeSate: 'inactive' })
            this.setupReviewMode({ activate: false })
        }

        let videoSplit = getVideoSplitFactor(this.state.duration)

        this.replayConfig.interval = parseInt(this.state.duration / videoSplit)
        this.replayConfig.startOffset = convertToNearestX(
            this.state.currentTime,
            this.replayConfig.interval
        )
    }

    speedTracker = 2
    trackingMode = (offSet, renormalize = true) => {
        clearInterval(this.alertConfig.alertConfigMidwayTime)
        clearInterval(this.alertConfig.alertConfigTwoThirdTime)
        clearInterval(this.alertConfig.alertConfigOneThirdTime)
        //   ========================

        if (this.replayConfig.unsubscribe) {
            clearInterval(this.replayConfig.unsubscribe)
            this.replayConfig.unsubscribe = null
            this.notify({
                mainMessage: 'Replay: Stopped!',
                colorMessage: 'rtrhfgfdhfghf'
            })
        } else {
            if (renormalize) {
                this.replayConfig.startPosition = Math.max(
                    convertToNearest30(this.state.currentTime) - offSet,
                    0
                )

                this.replayConfig.endPosition = Math.min(
                    this.replayConfig.startPosition + offSet,
                    this.state.duration
                )
            } else {
                this.replayConfig.startPosition = Math.max(
                    this.replayConfig.startOffset,
                    0
                )

                this.replayConfig.endPosition = Math.min(
                    this.replayConfig.startPosition +
                        this.replayConfig.interval,
                    this.state.duration
                )
            }

            this.setSpeed(2)

            const minDurationForVideoSplitFactor = 5 * 60

            this.state.duration < minDurationForVideoSplitFactor
                ? this.setVideoPosition(0)
                : this.setVideoPosition(
                      parseInt(this.replayConfig.startPosition)
                  )

            this.replayConfig.unsubscribe = setInterval(() => {
                if (
                    this.state.currentTime >=
                        this.replayConfig.endPosition - 5 ||
                    this.state.currentTime < this.replayConfig.startPosition
                ) {
                    this.setVideoPosition(this.replayConfig.startPosition)

                    const speedTOptions = [2, 3, 10]

                    this.speedTracker =
                        (this.speedTracker + 1) % speedTOptions.length
                    this.setSpeed(speedTOptions[this.speedTracker])
                    this.studyStatisticsTracker()
                }
            }, 1000)
            this.notifyReplayStatus()
        }
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
        //   if (this.state.duration < minimumLength) return;
        //   =================>
        this.alertConfig.alertConfigOneThirdTime = setInterval(() => {
            const _25PercentTime = this.state.duration * 0.25 //80%

            if (
                // this.state.duration > standardLength &&
                this.state.currentTime > _25PercentTime &&
                this.state.currentTime < _25PercentTime * 2
            ) {
                this.alertConfig.speedMode === 1 && this.setSpeed(3)
                this.alertConfig.speedMode === 2 && this.setSpeed(3.5)

                const remainTime = this.state.duration - _25PercentTime //25%

                this.notify({
                    mainMessage: `Alert:\r\nJust Past 25%`,
                    colorMessage: `\r\n[${toMinutesSeconds(remainTime, false)}]`
                })
                clearInterval(this.alertConfig.alertConfigOneThirdTime)
            }
        }, 2000)

        //   =================>
        this.alertConfig.alertConfigMidwayTime = setInterval(() => {
            const midwayTime = this.state.duration * 0.5 //60%

            if (this.state.currentTime > midwayTime) {
                this.alertConfig.speedMode === 1 && this.setSpeed(3)
                this.alertConfig.speedMode === 2 && this.setSpeed(4)

                const remainTime = this.state.duration - midwayTime //40%

                this.notify({
                    mainMessage: `Alert:\r\nJust Past 50%`,
                    colorMessage: `\r\n[${toMinutesSeconds(remainTime, false)}]`
                })
                clearInterval(this.alertConfig.alertConfigMidwayTime)
            }
        }, 2000)

        //   =====================>
        this.alertConfig.alertConfigTwoThirdTime = setInterval(() => {
            const _75PercentTime = this.state.duration * 0.75 //80%

            if (
                // this.state.duration > standardLength &&
                this.state.currentTime > _75PercentTime
            ) {
                this.alertConfig.speedMode === 1 && this.setSpeed(3.5)
                this.alertConfig.speedMode === 2 && this.setSpeed(4.5)

                const remainTime = this.state.duration - _75PercentTime //25%

                this.notify({
                    mainMessage: `Alert:\r\nJust Past 75%`,
                    colorMessage: `\r\n[${toMinutesSeconds(remainTime, false)}]`
                })
                clearInterval(this.alertConfig.alertConfigTwoThirdTime)
            }
        }, 2000)
    }

    //   moveToNextPlaybackRange = () => {
    //     this.replayConfig.startPosition = Math.min(
    //       this.replayConfig.startPosition + this.replayConfig.interval,
    //       this.state.duration - this.replayConfig.interval
    //     )
    //     this.replayConfig.endPosition = Math.min(
    //       this.replayConfig.startPosition + this.replayConfig.interval,
    //       this.state.duration
    //     )
    //     this.setVideoPosition(this.replayConfig.startPosition)
    //     this.notifyReplayStatus()
    //   }

    //   moveToPreviousPlaybackRange = () => {
    //     this.replayConfig.startPosition = Math.max(
    //       this.replayConfig.startPosition - this.replayConfig.interval,
    //       0
    //     )
    //     this.replayConfig.endPosition = Math.min(
    //       this.replayConfig.startPosition + this.replayConfig.interval,
    //       this.state.duration
    //     )
    //     this.setVideoPosition(this.replayConfig.startPosition)
    //     this.notifyReplayStatus()
    //   }

    isReviewing = false
    unsubscribeToReview = null

    setupReviewMode = ({ activate = true, loopCurrentSplit = false }) => {
        const deactivate = !activate

        if (deactivate) {
            clearInterval(this.unsubscribeToReview)

            return this.notify({
                mainMessage: 'Replay: Stopped!',
                colorMessage: ''
            })
        }

        if (this.state.trackingModeState === 'active') {
            this.setState({ trackingModeState: 'inactive' })
            this.trackingMode(null, false)
        }

        if (this.state.reviewRangeStart)
            this.setVideoPosition(this.state.reviewRangeStart)

        clearInterval(this.unsubscribeToReview)
        loopCurrentSplit &&
            this.notify({
                mainMessage: `Reviews: Looping`,
                colorMessage: ''
            })
        this.watcherForReviewMode(loopCurrentSplit)
    }

    watcherForReviewMode = (loopCurrentSplit = false) => {
        this.unsubscribeToReview = setInterval(() => {
            if (this.state.currentTime < this.state.reviewRangeStart) {
                this.setVideoPosition(this.state.reviewRangeStart)
            }

            if (loopCurrentSplit) {
                if (this.state.currentTime >= this.state.reviewRangeEnd - 5) {
                    this.setVideoPosition(this.state.reviewRangeStart)
                    this.studyStatisticsTracker(0.5)
                }
            } else {
                if (this.state.currentTime >= this.state.reviewRangeEnd - 5) {
                    this.studyStatisticsTracker(0.25)
                    // todo ========
                    this.setCurrentlyPlaying(
                        this.state.playlist[this.state.currentlyPlaying + 1]
                    )

                    this.setState({
                        currentlyPlaying: this.state.currentlyPlaying + 1
                    })
                    this.setVideoPosition(this.state.reviewRangeStart)
                    //  ========
                    clearInterval(this.unsubscribeToReview)
                    this.watcherForReviewMode()
                    // ===================
                    //  this.setVideoPosition(this.state.reviewRangeStart);
                    //  this.setSpeed(speedTOptions[this.speedTracker]);
                    //  studyStatisticsTracker();
                    //   this.notifyReplayStatus();
                }
            }
        }, 1000)
    }

    // video.addEventListener('seeked', this.alertAtKeyMoments);
    videoOnLoadeddata = () => {
        //   clearInterval(this.replayConfig.unsubscribe);
        this.alertAtKeyMoments()

        //   setupForStandardTrackingMode();
        //   this.this.trackingMode(null, false);
        //   setTimeout(this.notifyReplayStatus, 5000);

        if (this.replayConfig.unsubscribe) {
            this.replayConfig.unsubscribe = null
            this.setupForStandardTrackingMode()
            this.trackingMode(null, false)

            return setTimeout(this.notifyReplayStatus, 5000)
        }

        const videoTitle = `${this.state.title}  `

        this.notify({
            mainMessage: videoTitle,
            colorMessage: `[${toMinutesSeconds(this.state.duration)}]`
        })
    }

    // video.addEventListener('timeupdate', detectBackwardSkipSeek);

    videoOnPause = () => {
        //   this.replayConfig.unsubscribe && studyStatisticsTracker(0.5);
        this.studyStatisticsTracker(0.5)
    }

    videoOnended = () => {
        if (this.replayConfig.unsubscribe) {
            this.setVideoPosition(this.replayConfig.startPosition)
            this.notifyReplayStatus()
        }

        //   this.setSpeed(this.replayConfig.cachedPlaybackRate || 3);

        //   clearInterval(this.replayConfig.unsubscribe);
        //   this.replayConfig = {};

        this.notify({
            mainMessage: `Toggle Speed Stopped:`,
            colorMessage: ''
        })
    }

    seekToTime = value => {
        let seekToTime = this.state.currentTime + value

        if (seekToTime < 0) {
            this.setVideoPosition(0)
        } else if (seekToTime > this.state.duration)
            this.setVideoPosition(this.state.duration)

        this.setVideoPosition(seekToTime)
        this.notify({
            mainMessage: `Current Position: <${toMinutesSeconds(
                this.state.currentTime
            )}> of <${toMinutesSeconds(this.state.duration)}>`,
            colorMessage: ''
        })
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

    notifyReplayStatus = () => {
        const currentSplit = parseInt(
            this.replayConfig.endPosition / this.replayConfig.interval
        )
        const totalSplit = parseInt(
            this.state.duration / this.replayConfig.interval
        )

        let reviews = JSON.parse(localStorage.getItem('reviews'))

        let videoStat =
            reviews &&
            reviews[this.state.url]?.replayHistory[`split-${currentSplit}`]
                ?.count

        this.notify({
            mainMessage: `Video Stats: Split watch count:: ${
                videoStat ?? 0
            } times!
    \r\nReplay: is ${
        this.replayConfig.unsubscribe ? 'ON!:' : 'OFF!:'
    }\r\nStart Time: ${toMinutesSeconds(
                this.replayConfig.startPosition
            )}\r\nEnd Time:  ${toMinutesSeconds(
                this.replayConfig.endPosition
            )}`,
            colorMessage: `\r\nPosition:   [${currentSplit}] of [${totalSplit}]`,
            delay: 20000
        })
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
            loaded,
            duration,
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
                            this.videoOnLoadeddata()
                        }}
                        onStart={() => {
                            console.log('onStart')
                        }}
                        onPlay={this.handlePlay}
                        onEnablePIP={this.handleEnablePIP}
                        onDisablePIP={this.handleDisablePIP}
                        onPause={this.handlePause}
                        onBuffer={() => console.log('onBuffer')}
                        onSeek={e => console.log('onSeek', e)}
                        onEnded={this.handleEnded}
                        onError={this.handleError}
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
