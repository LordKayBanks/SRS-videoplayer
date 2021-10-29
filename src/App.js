import "./App.scss";
import "react-notifications-component/dist/theme.css";

import * as statsService from "./components/stats.service";

import React, { Component } from "react";
import ReactNotification, {
	store,
} from "react-notifications-component";

import PlaybackControl from "./components/playbackControl";
import ReactPlayer from "react-player";
import Toolbar from "./components/toolbar";
import { categoryNextPreviousNavigation } from "./utility/index";
import documentOnKeyDown from "./components/keyboard.events";
import { findDOMNode } from "react-dom";
import { hot } from "react-hot-loader";
import screenfull from "screenfull";

class App extends Component {
	state = {
		// url: 'https://www.youtube.com/watch?v=oUFJJNQGwhk',
		url: null,
		pip: false,
		controls: false,
		light: false,
		played: 0,
		loaded: 0,
		//=
		playing: true,
		volume: 0.8,
		muted: true,
		playbackRate: 3,
		loop: false,
		currentTime: 0,
		duration: 0,
		//  =====
		currentPosition: 0,
		playlist: [],
		sortType: "playlist",
		repeatMode: "repeat-all",
		currentlyPlaying: "",
		currentCategory: [],
		title: "",
		videoFormat: "",
		//==========
		notificationID: null,
		reviewConfig: {
			reviewMode: "inactive",
			reviewStartRange: 0,
			reviewEndRange: 0,
		},

		trackingConfig: {
			trackingMode: "inactive",
			startPosition: 0,
			endPosition: 120,
			startOffset: 30,
			interval: 120,
			defaultStartOffset: 30,
			defaultEndOffset: 120,
		},
		//==========
	};

	handleReviewMode = (values = []) => {
		console.log("🚀 ==> values", values);
		if (this.state.trackingConfig.trackingMode === "active") {
			this.setState(
				{
					trackingConfig: {
						...this.state.trackingConfig,
						startPosition: values[0],
						endPosition: values[1],
					},
				},
				() => {
					// this.setupTrackingMode({ activate: true });
				}
			);
			return;
		}

		if (this.state.reviewConfig.reviewMode !== "inactive") {
			this.setState(
				{
					reviewConfig: {
						...this.state.reviewConfig,
						reviewStartRange: values[0],
						reviewEndRange: values[1],
					},
				},
				() => {
					this.setupReviewMode({
						activate: true,
						loopCurrentSplit:
							this.state.reviewConfig.reviewMode ===
							"loop",
					});
				}
			);
		}
		return;
	};

	componentDidUpdate() {
		document.title = this.state.title?.replaceAll("'", "");
	}

	componentDidMount() {
		document.title = this.state.title?.replaceAll("'", "");
		document.addEventListener("keydown", documentOnKeyDown(this));
	}

	componentWillUnmount() {
		document.removeEventListener(
			"keydown",
			documentOnKeyDown(this)
		);
	}

	notify({
		title = "SR-Videoplayer: Sample Message Title",
		message = "This is a sample message",
	}) {
		this.state.notificationID &&
			store.removeNotification(this.state.notificationID);

		const notificationID = store.addNotification({
			title: title,
			message: message,
			type: "success",
			insert: "top",
			container: "top-left",
			animationIn: ["animate__animated", "animate__fadeIn"],
			animationOut: ["animate__animated", "animate__fadeOut"],
			dismiss: {
				duration: 15000,
				onScreen: true,
				pauseOnHover: true,
			},
			slidingExit: {
				duration: 800,
				timingFunction: "ease-out",
				delay: 0,
			},
		});

		this.setState({ notificationID });
	}

	toggleRepeatMode = () => {
		const NO_REPEAT_MODE = "no-repeat";
		const REPEAT_ONE_MODE = "repeat-one";
		const REPEAT_ALL_MODE = "repeat-all";
		switch (this.state.repeatMode) {
			case NO_REPEAT_MODE: {
				this.setState({ repeatMode: REPEAT_ONE_MODE });
				break;
			}

			case REPEAT_ONE_MODE: {
				this.setState({ repeatMode: REPEAT_ALL_MODE });
				break;
			}

			case REPEAT_ALL_MODE: {
				this.setState({ repeatMode: NO_REPEAT_MODE });
				break;
			}

			default: {
				this.setState({ repeatMode: REPEAT_ONE_MODE });
				break;
			}
		}
	};

	handlePlayPause = () => {
		this.setState({ playing: !this.state.playing });
	};

	handleStop = () => {
		this.setState({ url: null, playing: false });
	};

	shufflePlaylist = () => {
		if (this.state.sortType === "playlist") {
			let array = this.state.playlist;

			console.log(
				"🚀 ==> this.state.playlist",
				this.state.playlist
			);

			let currentIndex = array.length,
				randomIndex;

			// While there remain elements to shuffle...
			while (currentIndex !== 0) {
				// Pick a remaining element...
				randomIndex = Math.floor(
					Math.random() * currentIndex
				);
				currentIndex--;
				// And swap it with the current element.
				[array[currentIndex], array[randomIndex]] = [
					array[randomIndex],
					array[currentIndex],
				];
			}

			console.log("🚀 ==> array", array);
			this.setState({ playlist: array });
			// return array;
		}
	};

	handlePlaybackRate = (increase = true) => {
		let playbackRate = this.state.playbackRate;
		if (increase) {
			playbackRate += 0.5;
			playbackRate = Math.min(15, playbackRate);
		} else {
			playbackRate -= 0.5;
			playbackRate = Math.max(0.5, playbackRate);
		}

		this.player.playbackRate = parseFloat(playbackRate);
		this.setState({ playbackRate: parseFloat(playbackRate) });
	};

	setSpeed = (value) => {
		this.setState({ playbackRate: parseFloat(value) });
	};

	reduceSpeed = (value = 0.25) => {
		const MIN_SPEED = 0.5;
		let newSpeed = this.state.playbackRate - value;
		newSpeed = newSpeed < MIN_SPEED ? MIN_SPEED : newSpeed;
		this.setSpeed(newSpeed);
	};

	increaseSpeed = (value = 0.25) => {
		const MAX_SPEED = 15;
		let newSpeed = this.state.playbackRate + value;
		newSpeed = newSpeed > MAX_SPEED ? MAX_SPEED : newSpeed;
		this.setSpeed(newSpeed);
	};

	setVideoPosition = (value) => {
		this.setState({ currentTime: parseFloat(value) }, () =>
			this.player?.seekTo(parseFloat(value))
		);
	};

	handlePrevious = (_, playableUniqueID) => {
		const { category } = this.state.playlist.find(
			(item) => item.id === this.state.currentlyPlaying
		);

		if (category && this.state.currentCategory.length)
			return this.handleEnded(false);

		let currentlyPlaying;
		let currentlyPlayingIndex;
		let newCurrentlyPlayingOBJ;
		if (playableUniqueID) {
			currentlyPlaying = playableUniqueID;
			currentlyPlayingIndex = this.state.playlist.findIndex(
				(item) => item.id === currentlyPlaying
			);
		} else {
			currentlyPlaying = this.state.currentlyPlaying;
			currentlyPlayingIndex = this.state.playlist.findIndex(
				(item) => item.id === currentlyPlaying
			);
			currentlyPlayingIndex--;
		}

		if (currentlyPlayingIndex <= 0) {
			currentlyPlayingIndex = this.state.playlist.length - 1;
		}

		newCurrentlyPlayingOBJ = this.state.playlist[
			currentlyPlayingIndex
		];
		const playingType = newCurrentlyPlayingOBJ["type"];
		if (playingType === "separator") {
			const nextPlayableIndex = currentlyPlayingIndex - 1;

			const nextPlayableIndexOBJ = this.state.playlist[
				nextPlayableIndex
			];

			const playableUniqueID = nextPlayableIndexOBJ["id"];
			return this.handlePrevious(null, playableUniqueID);
		}

		const newCurrentlyPlaying = newCurrentlyPlayingOBJ["id"];

		this.setCurrentlyPlaying(
			newCurrentlyPlaying,
			newCurrentlyPlayingOBJ
		);
	};

	handleNext = (_, playableUniqueID) => {
		const res = this.state.playlist.find(
			(item) => item.id === this.state.currentlyPlaying
		);

		if (res?.category && this.state.currentCategory.length)
			return this.handleEnded(true);

		let currentlyPlaying;
		let currentlyPlayingIndex;
		let newCurrentlyPlayingOBJ;
		if (playableUniqueID) {
			currentlyPlaying = playableUniqueID;
			currentlyPlayingIndex = this.state.playlist.findIndex(
				(item) => item.id === currentlyPlaying
			);
		} else {
			currentlyPlaying = this.state.currentlyPlaying;
			currentlyPlayingIndex = this.state.playlist.findIndex(
				(item) => item.id === currentlyPlaying
			);
			currentlyPlayingIndex++;
		}

		if (currentlyPlayingIndex >= this.state.playlist.length) {
			currentlyPlayingIndex = 0;
		}

		newCurrentlyPlayingOBJ = this.state.playlist[
			currentlyPlayingIndex
		];
		const playingType = newCurrentlyPlayingOBJ["type"];
		if (playingType === "separator") {
			let nextPlayableIndex = currentlyPlayingIndex + 1;
			if (nextPlayableIndex >= this.state.playlist.length) {
				nextPlayableIndex = 0;
			}

			const nextPlayableIndexOBJ = this.state.playlist[
				nextPlayableIndex
			];

			const playableUniqueID = nextPlayableIndexOBJ["id"];
			return this.handleNext(null, playableUniqueID);
		}

		const newCurrentlyPlaying = newCurrentlyPlayingOBJ["id"];

		this.setCurrentlyPlaying(
			newCurrentlyPlaying,
			newCurrentlyPlayingOBJ
		);
	};

	handlePause = () => {
		//  console.log('onPause')
		// clearInterval(this.unSubscribeCurrentPosition);
		this.setState({ playing: false });
	};

	handlePlay = () => {
		this.setState({
			playing: true,
			duration: this.player?.getDuration(),
		});
		console.log("onPlay");
		// this.unSubscribeCurrentPosition = setInterval(() => {
		// 	this.setState({ currentPosition: this.player?.getCurrentTime() });
		// }, 1000);
	};

	handleError = (error) => {
		this.handleNext();
		console.log(
			"🚀 ~ file: App.js ~ line 169 ~ App ~ error",
			error
		);
	};

	getFilteredPlaylist(incrementIndex = true) {
		const currentlyPlayingUniqueID = this.state.currentlyPlaying;

		let filteredPlaylist = this.state.playlist.filter((item) => {
			return this.state.currentCategory.includes(item.category);
		});

		if (!filteredPlaylist.length)
			filteredPlaylist = this.state.playlist;

		let currentlyPlayingIndex = filteredPlaylist.findIndex(
			(item) => item.id === currentlyPlayingUniqueID
		);
		return { currentlyPlayingIndex, filteredPlaylist };
	}

	handleEnded = (incrementIndex = true) => {
		let {
			currentlyPlayingIndex,
			filteredPlaylist,
		} = this.getFilteredPlaylist();

		currentlyPlayingIndex = categoryNextPreviousNavigation(
			currentlyPlayingIndex,
			filteredPlaylist,
			incrementIndex
		);

		let newCurrentlyPlayingOBJ =
			filteredPlaylist[currentlyPlayingIndex];

		let newCurrentlyPlaying = newCurrentlyPlayingOBJ["id"];
		// ============================================
		if (
			this.state.reviewConfig.reviewMode === "active" ||
			this.state.currentCategory.length
		) {
			console.log(
				"🚀 ==> newCurrentlyPlayingOBJ",
				newCurrentlyPlayingOBJ
			);
			return this.setCurrentlyPlaying(
				newCurrentlyPlaying,
				newCurrentlyPlayingOBJ
			);
		}

		if (this.state.repeatMode === "no-repeat") {
			this.handleNext();
		} else if (this.state.repeatMode === "repeat-one") {
			this.setVideoPosition(0);
		} else if (this.state.repeatMode === "repeat-all") {
			this.handleNext();
		}

		console.log('onEnded": ', this.state);
	};

	setCurrentlyPlayingPublic = (uniqueId, callback = () => {}) => {
		const chosenItemIndex = this.state.playlist.findIndex(
			(item) => item.id === uniqueId
		);
		const chosenItemItemOBJ = this.state.playlist[
			chosenItemIndex
		];

		const playingType = chosenItemItemOBJ["type"];
		if (playingType === "separator") {
			const nextPlayableIndex = chosenItemIndex + 1;

			const nextPlayableIndexOBJ = this.state.playlist[
				nextPlayableIndex
			];

			const playableUniqueID = nextPlayableIndexOBJ["id"];
			this.setCurrentlyPlayingPublic(playableUniqueID);
		}

		this.setCurrentlyPlaying(
			uniqueId,
			chosenItemItemOBJ,
			callback
		);
	};

	setCurrentlyPlaying = (
		uniqueId,
		currentlyPlayingOBJ,
		callback = () => {}
	) => {
		if (this.state.reviewConfig.reviewMode === "active") {
			console.log(
				"🚀 ==> currentlyPlayingOBJ",
				currentlyPlayingOBJ
			);
			let reviewStartRange = currentlyPlayingOBJ.startTime;
			let reviewEndRange = currentlyPlayingOBJ.endTime;

			// return setTimeout(() => {
			this.setState(
				{
					reviewConfig: {
						...this.state.reviewConfig,
						reviewStartRange,
						reviewEndRange,
					},
				},
				() => {
					this.setState(
						{
							url: currentlyPlayingOBJ.path,
							currentlyPlaying: uniqueId,
							playing: true,
							title: currentlyPlayingOBJ.name,
						},
						() => {
							callback();
						}
						// console.error('🚀 🚀 🚀 currentlyPlaying: ', this.state)
					);
				}
			);
			// }, 2000);
			return;
		}

		this.setState(
			{
				url: currentlyPlayingOBJ.path,
				currentlyPlaying: uniqueId,
				playing: true,
				title: currentlyPlayingOBJ.name,
			},
			() => {
				callback();
			}
			// console.error('🚀 🚀 🚀 currentlyPlaying: ', this.state)
		);
	};

	setCurrentCategory = (category, addCategory) => {
		let newCategories;
		if (addCategory) {
			newCategories = [...this.state.currentCategory, category];
			newCategories = [...new Set(newCategories)];
		} else {
			newCategories = this.state.currentCategory.filter(
				(item) => item !== category
			);
		}

		this.setState(
			{
				currentCategory: newCategories,
			},
			() => {
				if (addCategory) {
					this.handleEnded();
				}
			}
		);
	};

	setPlaylist = (
		items = [],
		replaceOldPlaylist,
		callback = () => {}
	) => {
		if (!items.length) return;

		let currentlyPlaying;
		let newPlaylist;
		let nextItemToPlay;
		if (replaceOldPlaylist) {
			newPlaylist = [...items];
			let index = 0;
			nextItemToPlay = newPlaylist[index];
			while (nextItemToPlay?.type === "separator") {
				nextItemToPlay = newPlaylist[index];
				index = index + 1;
			}

			currentlyPlaying = newPlaylist.find(
				(item) => item.id === nextItemToPlay.id
			);
		} else {
			const currentPlaylist = this.state.playlist;

			newPlaylist = [...currentPlaylist, ...items].filter(
				(item) => !item.isReview
			);
			// .filter(item => !item.category)
			let index = 0;
			nextItemToPlay = items[index];
			while (nextItemToPlay?.type === "separator") {
				nextItemToPlay = items[index];
				index = index + 1;
			}

			currentlyPlaying = newPlaylist.find(
				(item) => item.id === nextItemToPlay.id
			);
		}

		this.setState(
			{
				playlist: newPlaylist,
				currentlyPlaying: currentlyPlaying.id,
				url: nextItemToPlay?.path,
				playing: true,
			},
			() => {
				// console.log('🚀 ==> this.state.playlist', this.state.playlist)
				callback();
			}
		);
	};

	setSortType = (sortType) => {
		this.setState({ sortType }, () => {});
	};

	load = (url) => {
		this.setState({
			url,
			played: 0,
			loaded: 0,
			pip: false,
		});
	};

	handleDuration = (duration) => {
		console.log("onDuration", duration);
		this.setState({ duration });
	};

	handleToggleControls = () => {
		const url = this.state.url;

		this.setState(
			{
				controls: !this.state.controls,
				url: null,
			},
			() => this.load(url)
		);
	};

	handleToggleLight = () => {
		this.setState({ light: !this.state.light });
	};

	handleToggleLoop = () => {
		this.setState({ loop: !this.state.loop });
	};

	handleVolumeChange = (e) => {
		this.setState({ volume: parseFloat(e.target.value) });
	};

	handleToggleMuted = () => {
		this.setState({ muted: !this.state.muted });
	};

	handleTogglePIP = () => {
		this.setState({ pip: !this.state.pip });
	};

	handleEnablePIP = () => {
		//  console.log('onEnablePIP')
		this.setState({ pip: true });
	};

	handleDisablePIP = () => {
		//  console.log('onDisablePIP')
		this.setState({ pip: false });
	};

	handleSeekMouseDown = (e) => {
		this.setState({ seeking: true });
	};

	handleSeekChange = (e) => {
		this.setState({ played: parseFloat(e.target.value) });
	};

	handleSeekMouseUp = (e) => {
		this.setState({ seeking: false });
		this.player?.seekTo(parseFloat(e.target.value));
	};

	handleProgress = (state) => {
		this.setState({ currentPosition: state.playedSeconds });
		// console.log("onProgress", state);
		//=====
		// We only want to update time slider if we are not currently seeking
		if (!this.state.seeking) {
			this.setState(state);
		}
	};

	handleClickFullscreen = () => {
		screenfull.request(findDOMNode(this.player));
	};

	renderLoadButton = (url, label) => {
		return (
			<button onClick={() => this.load(url)}>{label}</button>
		);
	};

	ref = (player) => {
		return (this.player = player);
	};

	style = {
		position: "absolute",
		left: "-886px",
		height: "300px",
		width: "250px",
		background: " #a58181",
	};

	// ==========================================================
	// ==========================================================

	// ==========================================================
	// ==========================================================

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
			pip,
		} = this.state;
		return (
			<div className="app">
				<div className="player-wrapper">
					<div>
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
								console.log("onReady");
								//  this.videoOnLoadeddata()
							}}
							onStart={() => {
								console.log("onStart");
								this.videoOnLoadeddata();
							}}
							onPlay={this.handlePlay}
							onPause={this.handlePause}
							onSeek={(e) => console.log("onSeek", e)}
							onEnded={this.handleEnded}
							onError={this.handleError}
							onBuffer={() => console.log("onBuffer")}
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
										rel: 0,
									},
								},
							}}
						/>
						<PlaybackControl
							playing={playing}
							handlePlayPause={this.handlePlayPause}
							muted={muted}
							handleToggleMuted={this.handleToggleMuted}
							volume={volume}
							handleVolumeChange={
								this.handleVolumeChange
							}
							currentTime={this.state.currentPosition}
							setVideoPosition={this.setVideoPosition}
							totalDuration={this.state.duration}
							playbackRate={playbackRate}
							handlePlaybackRate={{
								increaseSpeed: this.increaseSpeed,
								reduceSpeed: this.reduceSpeed,
							}}
							handlePrevious={this.handlePrevious}
							handleNext={this.handleNext}
							//==
							handleRange={
								this.state.reviewConfig.reviewMode !==
								"inactive"
									? this.handleReviewMode.bind(this)
									: this.state.trackingConfig
											.trackingMode !==
									  "inactive"
									? this.handleTrackingRange.bind(
											this
									  )
									: () => null
							}
							range={
								this.state.reviewConfig.reviewMode !==
								"inactive"
									? {
											StartRange: this.state
												.reviewConfig
												.reviewStartRange,
											EndRange: this.state
												.reviewConfig
												.reviewEndRange,
									  }
									: this.state.trackingConfig
											.trackingMode !==
									  "inactive"
									? {
											StartRange: this.state
												.trackingConfig
												.startPosition,
											EndRange: this.state
												.trackingConfig
												.endPosition,
									  }
									: {
											StartRange: 0,
											EndRange: this.state
												.duration,
									  }
							}
						></PlaybackControl>
					</div>
					<Toolbar
						reviewMode={
							this.state.reviewConfig.reviewMode
						}
						setupReviewMode={this.setupReviewMode.bind(
							this
						)}
						trackingMode={
							this.state.trackingConfig.trackingMode
						}
						setupTrackingMode={this.setupTrackingMode.bind(
							this
						)}
						//==
						shufflePlaylist={this.shufflePlaylist}
						sortType={this.state.sortType}
						setSortType={this.setSortType}
						//=
						setCurrentCategory={this.setCurrentCategory}
						currentlyPlaying={this.state.currentlyPlaying}
						setCurrentlyPlaying={
							this.setCurrentlyPlayingPublic
						}
						playlist={this.state.playlist}
						setPlaylist={this.setPlaylist}
						handlePrevious={this.handlePrevious}
						handleNext={this.handleNext}
						notify={this.notify}
						//==
						toggleRepeatMode={this.toggleRepeatMode}
						repeatMode={this.state.repeatMode}
					></Toolbar>

					<ReactNotification></ReactNotification>
				</div>
			</div>
		);
	}
}
App.prototype.alertConfig = statsService.alertConfig;
App.prototype.setupTrackingMode = statsService.setupTrackingMode;
App.prototype.watcherForTrackingMode =
	statsService.watcherForTrackingMode;

App.prototype.notifyTrackingStatus =
	statsService.notifyTrackingStatus;

App.prototype.moveToPreviousPlaybackRange =
	statsService.moveToPreviousPlaybackRange;

App.prototype.moveToNextPlaybackRange =
	statsService.moveToNextPlaybackRange;
App.prototype.handleTrackingRange = statsService.handleTrackingRange;
App.prototype.seekToTime = statsService.seekToTime;
App.prototype.studyStatisticsTracker =
	statsService.studyStatisticsTracker;
App.prototype.getSplit = statsService.getSplit;
App.prototype.notifyReviewStatus = statsService.notifyReviewStatus;
App.prototype.setupReviewMode = statsService.setupReviewMode;
App.prototype.watcherForReviewMode =
	statsService.watcherForReviewMode;
App.prototype.alertAtKeyMoments = statsService.alertAtKeyMoments;
App.prototype.videoOnLoadeddata = statsService.videoOnLoadeddata;
App.prototype.videoOnPause = statsService.videoOnPause;
App.prototype.changeReviewMode = statsService.changeReviewMode;

export default hot(module)(App);
