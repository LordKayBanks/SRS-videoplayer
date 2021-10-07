import './App.css'

import React, { Component } from 'react'

import Duration from './utility/Duration'
import {
  toMinutesSeconds,
  getVideoSplitFactor,
  convertToNearest30,
  convertToNearestX
} from './utility/index'
import FlashMessage from './player/notify'

import ReactPlayer from 'react-player'
import Toolbar from './components/toolbar'
import Volume from './components/volume'
import { findDOMNode } from 'react-dom'
import { hot } from 'react-hot-loader'
import screenfull from 'screenfull'

class App extends Component {
  state = {
    url: 'https://www.youtube.com/watch?v=oUFJJNQGwhk',
    pip: false,
    playing: true,
    controls: true,
    light: false,
    volume: 0.8,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    currentTime: 0,
    playbackRate: 5.0,
    loop: false,
    //  ======================
    message: { colorMessage: '', mainMessage: '' },
    playlist: [],
    repeatMode: 'repeat-all',
    activeVideoIndex: 0,
    title: '',
    videoFormat: '',
    reviewModeSate: false,
    reviewRangeStart: 0,
    reviewRangeEnd: 0,
    trackingModeState: 'inactive'
    //  ===================
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
    this.setState({ currentTime: parseFloat(value) })
  }

  handlePause = () => {
    //  console.log('onPause')
    this.setState({ playing: false })
  }

  handlePlay = () => {
    this.setState({ playing: true })
    console.log('onPlay')
  }

  handlePlay2 = (activeVideoIndex, delay = 1000) => {
    let index = activeVideoIndex
    let nextItemToPlay = this.state.playlist[index]

    if (index > this.state.playlist.length - 1 || index < 0) {
      index = 0
      nextItemToPlay = this.state.playlist[index]
    }

    setTimeout(() => {
      while (nextItemToPlay?.type === 'separator') {
        index = index + 1
        nextItemToPlay = this.state.playlist[index]
      }

      if (!nextItemToPlay) {
        this.setState(
          {
            activeVideoIndex: 0,
            playing: true,
            url: this.state.playlist[0]['path']
          },
          () => {
            return this.notify({
              mainMessage: 'nothing to play',
              colorMessage: 'handlePlay2'
            })
          }
        )

        return
      }

      if ((index > this.state.playlist.length - 1) | (index < 0)) {
        this.setState(
          {
            activeVideoIndex: 0,
            playing: true,
            url: this.state.playlist[0]['path']
          },
          () => {
            console.log('🚀~ out of range: ', this.state)

            this.notify({
              mainMessage: 'end of list',
              colorMessage: 'handlePlay2'
            })
          }
        )

        return
      }

      this.setState(
        {
          activeVideoIndex: index,
          playing: true,
          url: nextItemToPlay.path
        },
        () => console.log('🚀~ STATE', this.state)
      )
    }, delay)

    setTimeout(() => {
      if (this.replayConfig.unsubscribe) {
        this.setVideoPosition(this.replayConfig.startPosition)
        this.notifyReplayStatus()
      }
    }, 2000)
    //  console.log('onPlay2')
  }

  handleError = error => {
    this.handlePlay2(this.state.activeVideoIndex + 1)
    console.log('🚀 ~ file: App.js ~ line 110 ~ App ~ error', error)
  }

  handleEnded = () => {
    if (this.state.activeVideoIndex + 1 !== this.state.playlist.length) {
      this.handlePlay2(this.state.activeVideoIndex + 1, 1000)
    } else {
      if (this.state.repeatMode === 'repeat-all') {
        this.handlePlay2(0, 1000)
      } else if (this.state.repeatMode === 'repeat-one') {
        this.handlePlay2(this.state.activeVideoIndex, 1000)
      }
    }

    console.log('onEnded": ', this.state)
    //  this.setState({ playing: this.state.loop })
  }

  handleNext = () => {
    this.handlePlay2(this.state.activeVideoIndex + 1)
  }

  handlePrevious = () => {
    this.handlePlay2(this.state.activeVideoIndex - 1)
  }

  handleDuration = duration => {
    //  console.log('onDuration', duration)
    this.setState({ duration })
  }

  setPlaylist = (items, callback) => {
    this.setState({ ...items }, callback())
  }

  setURL = url => {
    this.setState(
      {
        url
      },
      () => console.error('🚀 🚀 🚀 url-SET', url)
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

  notify = ({ mainMessage, colorMessage }) => {
    this.setState({ message: { mainMessage, colorMessage } })
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
          review.replayHistory[`split-${currentSplit}`].count + increment
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
        colorMessage: 'handlePlay2'
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
          this.replayConfig.startPosition + this.replayConfig.interval,
          this.state.duration
        )
      }

      this.setSpeed(2)

      const minDurationForVideoSplitFactor = 5 * 60

      this.state.duration < minDurationForVideoSplitFactor
        ? this.setVideoPosition(0)
        : this.setVideoPosition(parseInt(this.replayConfig.startPosition))
      this.replayConfig.unsubscribe = setInterval(() => {
        if (
          this.state.currentTime >= this.replayConfig.endPosition - 5 ||
          this.state.currentTime < this.replayConfig.startPosition
        ) {
          this.setVideoPosition(this.replayConfig.startPosition)

          const speedTOptions = [2, 3, 10]

          this.speedTracker = (this.speedTracker + 1) % speedTOptions.length
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
          this.setURL(this.state.playlist[this.state.activeVideoIndex + 1])
          this.setState({ activeVideoIndex: this.state.activeVideoIndex + 1 })
          this.setVideoPosition(this.state.reviewRangeStart)
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

    this.notify({ mainMessage: `Toggle Speed Stopped:`, colorMessage: '' })
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
      reviews[this.state.url]?.replayHistory[`split-${currentSplit}`]?.count

    this.notify({
      mainMessage: `Video Stats: Split watch count:: ${videoStat ?? 0} times!
    \r\nReplay: is ${
      !!this.replayConfig.unsubscribe ? 'ON!:' : 'OFF!:'
    }\r\nStart Time: ${toMinutesSeconds(
        this.replayConfig.startPosition
      )}\r\nEnd Time:  ${toMinutesSeconds(this.replayConfig.endPosition)}`,
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
    const SEPARATOR = ' · '
    const turnOffSection = true

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
            playNewVideo={this.setURL}
            setPlaylist={this.setPlaylist}
            playlist={this.state.playlist}
            handlePrevious={this.handlePrevious}
            handleNext={this.handleNext}
            notify={this.notify}
          ></Toolbar>
          <FlashMessage duration={50000} persistOnHover={true}>
            <p>{this.state.message.mainMessage}</p>
            <p className="color-text">{this.state.message.colorMessage}</p>
          </FlashMessage>
        </div>
        <section className={`section ${turnOffSection && 'hide'}`}>
          {/* ======================================================== */}
          {/* ======================================================== */}

          <table className={turnOffSection && 'hide'}>
            <tbody>
              <tr>
                <th>Controls</th>
                <td>
                  <button onClick={this.handleStop}>Stop</button>
                  <button onClick={this.handlePlayPause}>
                    {playing ? 'Pause' : 'Play'}
                  </button>
                  <button onClick={this.handleClickFullscreen}>
                    Fullscreen
                  </button>
                  {light && (
                    <button onClick={() => this.player.showPreview()}>
                      Show preview
                    </button>
                  )}
                  {ReactPlayer.canEnablePIP(url) && (
                    <button onClick={this.handleTogglePIP}>
                      {pip ? 'Disable PiP' : 'Enable PiP'}
                    </button>
                  )}
                </td>
              </tr>
              <tr>
                <th>Speed</th>
                <td>
                  <button onClick={this.handleSetPlaybackRate} value={1}>
                    1x
                  </button>
                  <button onClick={this.handleSetPlaybackRate} value={1.5}>
                    1.5x
                  </button>
                  <button onClick={this.handleSetPlaybackRate} value={2}>
                    2x
                  </button>
                </td>
              </tr>
              <tr>
                <th>Seek</th>
                <td>
                  <input
                    type="range"
                    min={0}
                    max={0.999999}
                    step="any"
                    value={played}
                    onMouseDown={this.handleSeekMouseDown}
                    onChange={this.handleSeekChange}
                    onMouseUp={this.handleSeekMouseUp}
                  />
                </td>
              </tr>
              <tr>
                <Volume
                  handleVolumeChange={this.handleVolumeChange}
                  volume={volume}
                ></Volume>
              </tr>
              <tr>
                <th>
                  <label htmlFor="controls">Controls</label>
                </th>
                <td>
                  <input
                    id="controls"
                    type="checkbox"
                    checked={controls}
                    onChange={this.handleToggleControls}
                  />
                  <em>&nbsp; Requires player reload</em>
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="muted">Muted</label>
                </th>
                <td>
                  <input
                    id="muted"
                    type="checkbox"
                    checked={muted}
                    onChange={this.handleToggleMuted}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="loop">Loop</label>
                </th>
                <td>
                  <input
                    id="loop"
                    type="checkbox"
                    checked={loop}
                    onChange={this.handleToggleLoop}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="light">Light mode</label>
                </th>
                <td>
                  <input
                    id="light"
                    type="checkbox"
                    checked={light}
                    onChange={this.handleToggleLight}
                  />
                </td>
              </tr>
              <tr>
                <th>Played</th>
                <td>
                  <progress max={1} value={played} />
                </td>
              </tr>
              <tr>
                <th>Loaded</th>
                <td>
                  <progress max={1} value={loaded} />
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className={`section ${turnOffSection && 'hide'}`}>
          <table>
            <tbody>
              <tr>
                <th>YouTube</th>
                <td>
                  {this.renderLoadButton(
                    'https://www.youtube.com/watch?v=oUFJJNQGwhk',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://www.youtube.com/watch?v=jNgP6d9HraI',
                    'Test B'
                  )}
                  {this.renderLoadButton(
                    'https://www.youtube.com/playlist?list=PLogRWNZ498ETeQNYrOlqikEML3bKJcdcx',
                    'Playlist'
                  )}
                </td>
              </tr>
              <tr>
                <th>SoundCloud</th>
                <td>
                  {this.renderLoadButton(
                    'https://soundcloud.com/miami-nights-1984/accelerated',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://soundcloud.com/tycho/tycho-awake',
                    'Test B'
                  )}
                  {this.renderLoadButton(
                    'https://soundcloud.com/yunghog/sets/doperaptraxxx',
                    'Playlist'
                  )}
                </td>
              </tr>
              <tr>
                <th>Facebook</th>
                <td>
                  {this.renderLoadButton(
                    'https://www.facebook.com/facebook/videos/10153231379946729/',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://www.facebook.com/FacebookDevelopers/videos/10152454700553553/',
                    'Test B'
                  )}
                </td>
              </tr>
              <tr>
                <th>Vimeo</th>
                <td>
                  {this.renderLoadButton(
                    'https://vimeo.com/90509568',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://vimeo.com/169599296',
                    'Test B'
                  )}
                </td>
              </tr>
              <tr>
                <th>Twitch</th>
                <td>
                  {this.renderLoadButton(
                    'https://www.twitch.tv/videos/106400740',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://www.twitch.tv/videos/12783852',
                    'Test B'
                  )}
                  {this.renderLoadButton(
                    'https://www.twitch.tv/kronovi',
                    'Test C'
                  )}
                </td>
              </tr>
              <tr>
                <th>Streamable</th>
                <td>
                  {this.renderLoadButton(
                    'https://streamable.com/moo',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://streamable.com/ifjh',
                    'Test B'
                  )}
                </td>
              </tr>
              <tr>
                <th>Wistia</th>
                <td>
                  {this.renderLoadButton(
                    'https://home.wistia.com/medias/e4a27b971d',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://home.wistia.com/medias/29b0fbf547',
                    'Test B'
                  )}
                  {this.renderLoadButton(
                    'https://home.wistia.com/medias/bq6epni33s',
                    'Test C'
                  )}
                </td>
              </tr>
              <tr>
                <th>DailyMotion</th>
                <td>
                  {this.renderLoadButton(
                    'https://www.dailymotion.com/video/x5e9eog',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://www.dailymotion.com/video/x61xx3z',
                    'Test B'
                  )}
                </td>
              </tr>
              <tr>
                <th>Mixcloud</th>
                <td>
                  {this.renderLoadButton(
                    'https://www.mixcloud.com/mixcloud/meet-the-curators/',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://www.mixcloud.com/mixcloud/mixcloud-curates-4-mary-anne-hobbs-in-conversation-with-dan-deacon/',
                    'Test B'
                  )}
                </td>
              </tr>
              <tr>
                <th>Vidyard</th>
                <td>
                  {this.renderLoadButton(
                    'https://video.vidyard.com/watch/YBvcF2BEfvKdowmfrRwk57',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://video.vidyard.com/watch/BLXgYCDGfwU62vdMWybNVJ',
                    'Test B'
                  )}
                </td>
              </tr>
              <tr>
                <th>Kaltura</th>
                <td>
                  {this.renderLoadButton(
                    'https://cdnapisec.kaltura.com/p/2507381/sp/250738100/embedIframeJs/uiconf_id/44372392/partner_id/2507381?iframeembed=true&playerId=kaltura_player_1605622074&entry_id=1_jz404fbl',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://cdnapisec.kaltura.com/p/2507381/sp/250738100/embedIframeJs/uiconf_id/44372392/partner_id/2507381?iframeembed=true&playerId=kaltura_player_1605622336&entry_id=1_i1jmzcn3',
                    'Test B'
                  )}
                </td>
              </tr>
              <tr>
                <th>Files</th>
                <td>
                  {this.renderLoadButton(
                    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
                    'mp4'
                  )}
                  {this.renderLoadButton(
                    'https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm',
                    'webm'
                  )}
                  {this.renderLoadButton(
                    'https://filesamples.com/samples/video/ogv/sample_640x360.ogv',
                    'ogv'
                  )}
                  {this.renderLoadButton(
                    'https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3',
                    'mp3'
                  )}
                  <br />
                  {this.renderLoadButton(
                    'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
                    'HLS (m3u8)'
                  )}
                  {this.renderLoadButton(
                    'http://dash.edgesuite.net/envivio/EnvivioDash3/manifest.mpd',
                    'DASH (mpd)'
                  )}
                </td>
              </tr>
              <tr>
                <th>Custom URL</th>
                <td>
                  <input
                    ref={input => {
                      this.urlInput = input
                    }}
                    type="text"
                    placeholder="Enter URL"
                  />
                  <button
                    onClick={() => this.setState({ url: this.urlInput.value })}
                  >
                    Load
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <h2>State</h2>

          <table>
            <tbody>
              <tr>
                <th>url</th>
                <td className={!url ? 'faded' : ''}>
                  {(url instanceof Array ? 'Multiple' : url) || 'null'}
                </td>
              </tr>
              <tr>
                <th>playing</th>
                <td>{playing ? 'true' : 'false'}</td>
              </tr>
              <tr>
                <th>volume</th>
                <td>{volume.toFixed(3)}</td>
              </tr>
              <tr>
                <th>played</th>
                <td>{played.toFixed(3)}</td>
              </tr>
              <tr>
                <th>loaded</th>
                <td>{loaded.toFixed(3)}</td>
              </tr>
              <tr>
                <th>duration</th>
                <td>
                  <Duration seconds={duration} />
                </td>
              </tr>
              <tr>
                <th>elapsed</th>
                <td>
                  <Duration seconds={duration * played} />
                </td>
              </tr>
              <tr>
                <th>remaining</th>
                <td>
                  <Duration seconds={duration * (1 - played)} />
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <footer className={`footer ${turnOffSection && 'hide'}`}>
          {SEPARATOR}
          <a href="https://github.com/CookPete/react-player">GitHub</a>
          {SEPARATOR}
          <a href="https://www.npmjs.com/package/react-player">npm</a>
        </footer>
      </div>
    )
  }
}

export default hot(module)(App)
