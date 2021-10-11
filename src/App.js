import "./App.css";
import "react-notifications-component/dist/theme.css";

import React, { Component } from "react";
import ReactNotification, { store } from "react-notifications-component";
import {
	categoryNextPreviousNavigation,
	// convertToNearest30,
	// convertToNearestX,
	// getVideoSplitFactor,
	// toMinutesSeconds
} from "./utility/index";

import ReactPlayer from "react-player";
import Toolbar from "./components/toolbar";
import { findDOMNode } from "react-dom";
import { hot } from "react-hot-loader";
import screenfull from "screenfull";
import documentOnKeyDown from "./components/keyboard.events";
import * as statsService from "./components/stats.service";

class App extends Component {
	state = {
		// url: 'https://www.youtube.com/watch?v=oUFJJNQGwhk',
		url: null,
		pip: false,
		playing: true,
		controls: false,
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
		sortType: "playlist",
		repeatMode: "repeat-all",
		currentlyPlaying: "",
		currentCategory: [],
		title: "",
		videoFormat: "",
		//==========
	};

	componentDidUpdate() {
		document.title = this.state.title?.replaceAll("'", "");
	}

	componentDidMount() {
		document.title = this.state.title?.replaceAll("'", "");
		document.addEventListener("keydown", documentOnKeyDown(this));
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", documentOnKeyDown(this));
	}

	notify({
		title = "SR-Videoplayer: Sample Message Title",
		message = "This is a sample message",
	}) {
		store.addNotification({
			title: title,
			message: message,
			type: "success",
			insert: "top",
			container: "top-left",
			animationIn: ["animate__animated", "animate__fadeIn"],
			animationOut: ["animate__animated", "animate__fadeOut"],
			dismiss: {
				duration: 10000,
				onScreen: true,
			},
		});
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

	handleSetPlaybackRate = (e) => {
		this.setState({ playbackRate: parseFloat(e.target.value) });
	};

	setSpeed = (value) => {
		this.setState({ playbackRate: parseFloat(value) });
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

		if (category && this.state.currentCategory.length) return this.handleEnded(false);

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

		newCurrentlyPlayingOBJ = this.state.playlist[currentlyPlayingIndex];

		const playingType = newCurrentlyPlayingOBJ["type"];

		if (playingType === "separator") {
			const nextPlayableIndex = currentlyPlayingIndex - 1;
			const nextPlayableIndexOBJ = this.state.playlist[nextPlayableIndex];
			const playableUniqueID = nextPlayableIndexOBJ["id"];
			return this.handlePrevious(null, playableUniqueID);
		}

		const newCurrentlyPlaying = newCurrentlyPlayingOBJ["id"];

		this.setCurrentlyPlaying(newCurrentlyPlaying, newCurrentlyPlayingOBJ);
		// if (this.reviewConfig.reviewMode !== 'inactive') {
		//     setTimeout(() => {
		//          this.setupReviewMode({})
		//     }, 1000)
		// }
	};

	handleNext = (_, playableUniqueID) => {
		const res = this.state.playlist.find(
			(item) => item.id === this.state.currentlyPlaying
		);

		if (res?.category && this.state.currentCategory.length) return this.handleEnded(true);

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

		if (currentlyPlayingIndex >= this.state.playlist.length - 1) {
			currentlyPlayingIndex = 0;
		}

		newCurrentlyPlayingOBJ = this.state.playlist[currentlyPlayingIndex];

		const playingType = newCurrentlyPlayingOBJ["type"];

		if (playingType === "separator") {
			const nextPlayableIndex = currentlyPlayingIndex + 1;
			const nextPlayableIndexOBJ = this.state.playlist[nextPlayableIndex];
			const playableUniqueID = nextPlayableIndexOBJ["id"];
			return this.handleNext(null, playableUniqueID);
		}

		const newCurrentlyPlaying = newCurrentlyPlayingOBJ["id"];

		this.setCurrentlyPlaying(newCurrentlyPlaying, newCurrentlyPlayingOBJ);
		// if (this.reviewConfig.reviewMode !== 'inactive') {
		//     setTimeout(() => {
		//          this.setupReviewMode({})
		//     }, 1000)
		// }
	};

	handlePause = () => {
		//  console.log('onPause')
		this.setState({ playing: false });
	};

	handlePlay = () => {
		this.setState({ playing: true });
		console.log("onPlay");
	};

	handleError = (error) => {
		this.handleNext();
		console.log("🚀 ~ file: App.js ~ line 169 ~ App ~ error", error);
	};

	handleEnded = (goToNext = true) => {
		const currentlyPlayingUniqueID = this.state.currentlyPlaying;

		const { category = false } = this.state.playlist.find(
			(item) => item.id === currentlyPlayingUniqueID
		);

		if (category && this.state.currentCategory.length) {
			const filteredByCategory = this.state.playlist.filter((item) => {
				return this.state.currentCategory.includes(item.category);
			});
			let currentlyPlayingIndex = filteredByCategory.findIndex(
				(item) => item.id === currentlyPlayingUniqueID
			);

			// currentlyPlayingIndex++
			// if (currentlyPlayingIndex >= filteredByCategory.length - 1) {
			//     currentlyPlayingIndex = 0
			// }
			currentlyPlayingIndex = categoryNextPreviousNavigation(
				currentlyPlayingIndex,
				filteredByCategory,
				goToNext
			);

			const newCurrentlyPlayingOBJ = filteredByCategory[currentlyPlayingIndex];
			const newCurrentlyPlaying = newCurrentlyPlayingOBJ["id"];

			this.setCurrentlyPlaying(newCurrentlyPlaying, newCurrentlyPlayingOBJ);
		} else if (this.state.repeatMode === "no-repeat") {
			this.handleNext();
		} else if (this.state.repeatMode === "repeat-one") {
			this.setVideoPosition(0);
		} else if (this.state.repeatMode === "repeat-all") {
			this.handleNext();
		}

		console.log('onEnded": ', this.state);
	};

	setCurrentlyPlayingPublic = (uniqueId, callback = () => {}) => {
		const chosenItemIndex = this.state.playlist.findIndex((item) => item.id === uniqueId);
		const chosenItemItemOBJ = this.state.playlist[chosenItemIndex];
		const playingType = chosenItemItemOBJ["type"];

		if (playingType === "separator") {
			const nextPlayableIndex = chosenItemIndex + 1;
			const nextPlayableIndexOBJ = this.state.playlist[nextPlayableIndex];
			const playableUniqueID = nextPlayableIndexOBJ["id"];

			this.setCurrentlyPlayingPublic(playableUniqueID);
		}

		this.setCurrentlyPlaying(uniqueId, chosenItemItemOBJ, callback);
	};

	setCurrentlyPlaying = (uniqueId, currentlyPlayingOBJ, callback = () => {}) => {
		console.log("🚀 ==> currentlyPlayingOBJ", currentlyPlayingOBJ);

		if (this.reviewConfig.reviewMode !== "inactive") {
			this.reviewConfig.reviewStartRange = currentlyPlayingOBJ.startTime;
			this.reviewConfig.reviewEndRange = currentlyPlayingOBJ.endTime;
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
			newCategories = this.state.currentCategory.filter((item) => item !== category);
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

	setPlaylist = (items = [], isReview, callback = () => {}) => {
		if (!items.length) return;

		let currentlyPlaying;
		let newPlaylist;
		let nextItemToPlay;

		if (isReview) {
			newPlaylist = [...items];

			let index = 0;

			nextItemToPlay = newPlaylist[index];

			while (nextItemToPlay?.type === "separator") {
				nextItemToPlay = newPlaylist[index];
				index = index + 1;
			}

			currentlyPlaying = newPlaylist.find((item) => item.id === nextItemToPlay.id);
		} else {
			const currentPlaylist = this.state.playlist;

			newPlaylist = [...currentPlaylist, ...items].filter((item) => !item.isReview);
			// .filter(item => !item.category)

			let index = 0;

			nextItemToPlay = items[index];

			while (nextItemToPlay?.type === "separator") {
				nextItemToPlay = items[index];
				index = index + 1;
			}

			currentlyPlaying = newPlaylist.find((item) => item.id === nextItemToPlay.id);
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
		//  console.log('onDuration', duration)
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
		//  console.log('onProgress', state)

		// We only want to update time slider if we are not currently seeking
		if (!this.state.seeking) {
			this.setState(state);
		}
	};

	handleClickFullscreen = () => {
		screenfull.request(findDOMNode(this.player));
	};

	renderLoadButton = (url, label) => {
		return <button onClick={() => this.load(url)}>{label}</button>;
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

					<Toolbar
						sortType={this.state.sortType}
						setSortType={this.setSortType}
						reviewMode={this.reviewConfig.reviewMode}
						setupReviewMode={this.setupReviewMode.bind(this)}
						trackingMode={this.trackingConfig.trackingMode}
						setupTrackingMode={this.setupTrackingMode.bind(this)}
						setCurrentCategory={this.setCurrentCategory}
						currentlyPlaying={this.state.currentlyPlaying}
						setCurrentlyPlaying={this.setCurrentlyPlayingPublic}
						playlist={this.state.playlist}
						setPlaylist={this.setPlaylist}
						handlePrevious={this.handlePrevious}
						handleNext={this.handleNext}
						notify={this.notify}
						toggleRepeatMode={this.toggleRepeatMode}
						repeatMode={this.state.repeatMode}></Toolbar>
					<ReactNotification></ReactNotification>
				</div>
			</div>
		);
	}
}
App.prototype.alertConfig = statsService.alertConfig;
App.prototype.trackingConfig = statsService.trackingConfig;
App.prototype.reviewConfig = statsService.reviewConfig;
App.prototype.setupTrackingMode = statsService.setupTrackingMode;
App.prototype.trackingMode = statsService.trackingMode;
App.prototype.notifyReplayStatus = statsService.notifyReplayStatus;
App.prototype.notifyTrackingStatus = statsService.notifyTrackingStatus;
App.prototype.moveToPreviousPlaybackRange = statsService.moveToPreviousPlaybackRange;
App.prototype.moveToNextPlaybackRange = statsService.moveToNextPlaybackRange;
App.prototype.seekToTime = statsService.seekToTime;
App.prototype.increaseSpeed = statsService.increaseSpeed;
App.prototype.reduceSpeed = statsService.reduceSpeed;
App.prototype.studyStatisticsTracker = statsService.studyStatisticsTracker;
App.prototype.setupReviewMode = statsService.setupReviewMode;
App.prototype.watcherForReviewMode = statsService.watcherForReviewMode;
App.prototype.alertAtKeyMoments = statsService.alertAtKeyMoments;
App.prototype.videoOnLoadeddata = statsService.videoOnLoadeddata;
App.prototype.videoOnPause = statsService.videoOnPause;
App.prototype.changeReviewMode = statsService.changeReviewMode;

export default hot(module)(App);
