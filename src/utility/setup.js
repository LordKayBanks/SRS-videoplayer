/* eslint-disable no-undef */
import notify from "./notify.js";

const replayConfig = {
	startPosition: 0,
	endPosition: 120,
	unsubscribe: null,
	defaultStartOffset: 30,
	defaultEndOffset: 120,
	startOffset: 30,
	interval: 120,
	cachedPlaybackRate: 2.0,
};
const alertConfig = {
	alertConfigMidwayTime: null,
	alertConfigOneThirdTime: null,
	alertConfigTwoThirdTime: null,
	speedMode: 0, //1
	lastKeypressTime: null,
	delta: 500,
};

export function studyStatisticsTracker(increment = 1) {
	const currentSplit = parseInt(replayConfig.endPosition / replayConfig.interval);
	let reviews = JSON.parse(localStorage.getItem("reviews"));
	const reviewExists = !!reviews;
	let updatedReview = reviewExists ? reviews : {};
	let review = updatedReview[getVideoPath()];
	if (!review) {
		review = {
			name: getVideoTitle(),
			path: getVideoPath(),
			type: getVideoFormat(),
			replayHistory: {
				[`split-${currentSplit}`]: {
					count: increment,
					startTime: replayConfig.startPosition,
					endTime: replayConfig.endPosition,
				},
			},
			lastReviewDate: Date.now(),
		};
	} else {
		if (!review.replayHistory[`split-${currentSplit}`]) {
			review.replayHistory[`split-${currentSplit}`] = {
				count: increment,
				startTime: replayConfig.startPosition,
				endTime: replayConfig.endPosition,
			};
		} else {
			review.replayHistory[`split-${currentSplit}`].count =
				review.replayHistory[`split-${currentSplit}`].count + increment;
		}

		review.lastReviewDate = Date.now();
	}

	updatedReview[getVideoPath()] = { ...review };
	localStorage.setItem("reviews", JSON.stringify({ ...updatedReview }));
	notifyReviewStatus();
}

export function setupForStandardTrackingMode(reviewModeSate) {
	if (reviewModeSate !== "inactive") {
		reviewModeSate = "inactive";
		setupReviewMode({ activate: false });
	}

	let videoSplit = getVideoSplitFactor();
	replayConfig.interval = parseInt(getVideoTotalDuration() / videoSplit);
	replayConfig.startOffset = convertToNearestX(getVideoCurrentTime(), replayConfig.interval);
}

let speedTracker = 2;
export function trackingMode(offSet, renormalize = true) {
	clearInterval(alertConfig.alertConfigMidwayTime);
	clearInterval(alertConfig.alertConfigTwoThirdTime);
	clearInterval(alertConfig.alertConfigOneThirdTime);
	//   ========================
	if (replayConfig.unsubscribe) {
		clearInterval(replayConfig.unsubscribe);
		replayConfig.unsubscribe = null;
		notify.display("Replay: Stopped!");
	} else {
		if (renormalize) {
			replayConfig.startPosition = Math.max(
				convertToNearest30(getVideoCurrentTime()) - offSet,
				0
			);

			replayConfig.endPosition = Math.min(
				replayConfig.startPosition + offSet,
				getVideoTotalDuration()
			);
		} else {
			replayConfig.startPosition = Math.max(replayConfig.startOffset, 0);
			replayConfig.endPosition = Math.min(
				replayConfig.startPosition + replayConfig.interval,
				getVideoTotalDuration()
			);
		}

		this.setSpeed(2);
		const minDurationForVideoSplitFactor = 5 * 60;

		getVideoTotalDuration() < minDurationForVideoSplitFactor
			? setVideoPosition(0)
			: setVideoPosition(parseInt(replayConfig.startPosition));

		replayConfig.unsubscribe = setInterval(() => {
			if (
				getVideoCurrentTime() >= replayConfig.endPosition - 5 ||
				getVideoCurrentTime() < replayConfig.startPosition
			) {
				setVideoPosition(replayConfig.startPosition);
				const speedTOptions = [2, 3, 10];
				speedTracker = (speedTracker + 1) % speedTOptions.length;
				this.setSpeed(speedTOptions[speedTracker]);
				studyStatisticsTracker();
			}
		}, 1000);
		notifyReviewStatus();
	}
}

function setVideoPosition() {}

function getVideoPlaybackrate() {}

function videoSetplaybackRate(newSpeed) {}

function getVideoCurrentTime() {}

function getVideoFormat() {}

function getVideoPath() {}

function getVideoTitle() {}

export function alertAtKeyMoments() {
	clearInterval(alertConfig.alertConfigMidwayTime);
	clearInterval(alertConfig.alertConfigTwoThirdTime);
	clearInterval(alertConfig.alertConfigOneThirdTime);
	alertConfig.speedMode === 1 && setSpeed(2.5);
	alertConfig.speedMode === 2 && setSpeed(2.5);
	//   =================
	//   const standardLength = 10 * 60; //10mins
	//   const minimumLength = 6 * 60; //6mins
	//   if (getVideoTotalDuration() < minimumLength) return;
	//   =================>
	alertConfig.alertConfigOneThirdTime = setInterval(() => {
		const _25PercentTime = getVideoTotalDuration() * 0.25; //80%
		if (
			// getVideoTotalDuration() > standardLength &&
			getVideoCurrentTime() > _25PercentTime &&
			getVideoCurrentTime() < _25PercentTime * 2
		) {
			alertConfig.speedMode === 1 && setSpeed(3);
			alertConfig.speedMode === 2 && setSpeed(3.5);
			const remainTime = getVideoTotalDuration() - _25PercentTime; //25%

			notify.display(
				`Alert:\r\nJust Past 25%`,
				`\r\n[${toMinutesSeconds(remainTime, false)}]`
			);
			clearInterval(alertConfig.alertConfigOneThirdTime);
		}
	}, 2000);

	//   =================>

	alertConfig.alertConfigMidwayTime = setInterval(() => {
		const midwayTime = getVideoTotalDuration() * 0.5; //60%
		if (getVideoCurrentTime() > midwayTime) {
			alertConfig.speedMode === 1 && setSpeed(3);
			alertConfig.speedMode === 2 && setSpeed(4);
			const remainTime = getVideoTotalDuration() - midwayTime; //40%

			notify.display(
				`Alert:\r\nJust Past 50%`,
				`\r\n[${toMinutesSeconds(remainTime, false)}]`
			);
			clearInterval(alertConfig.alertConfigMidwayTime);
		}
	}, 2000);

	//   =====================>
	alertConfig.alertConfigTwoThirdTime = setInterval(() => {
		const _75PercentTime = getVideoTotalDuration() * 0.75; //80%
		if (
			// getVideoTotalDuration() > standardLength &&
			getVideoCurrentTime() > _75PercentTime
		) {
			alertConfig.speedMode === 1 && setSpeed(3.5);
			alertConfig.speedMode === 2 && setSpeed(4.5);
			const remainTime = getVideoTotalDuration() - _75PercentTime; //25%

			notify.display(
				`Alert:\r\nJust Past 75%`,
				`\r\n[${toMinutesSeconds(remainTime, false)}]`
			);
			clearInterval(alertConfig.alertConfigTwoThirdTime);
		}
	}, 2000);
}

function toMinutesSeconds(seconds, getFullFormat = true) {
	const format = (val) => `0${Math.floor(val)}`.slice(-2);
	const hours = seconds / 3600;
	const minutes = (seconds % 3600) / 60;
	const fullFormat = [hours, minutes, seconds % 60].map(format).join(":");
	const hourMinuteOnlyFormat = [hours, minutes].map(format).join(":");
	return getFullFormat ? fullFormat : hourMinuteOnlyFormat;
}

function moveToNextPlaybackRange() {
	replayConfig.startPosition = Math.min(
		replayConfig.startPosition + replayConfig.interval,
		getVideoTotalDuration() - replayConfig.interval
	);

	replayConfig.endPosition = Math.min(
		replayConfig.startPosition + replayConfig.interval,
		getVideoTotalDuration()
	);
	setVideoPosition(replayConfig.startPosition);
	notifyReviewStatus();
}

export function moveToPreviousPlaybackRange() {
	replayConfig.startPosition = Math.max(
		replayConfig.startPosition - replayConfig.interval,
		0
	);

	replayConfig.endPosition = Math.min(
		replayConfig.startPosition + replayConfig.interval,
		getVideoTotalDuration()
	);
	setVideoPosition(replayConfig.startPosition);
	notifyReviewStatus();
}

const multipleKeysMap = {};
export function handleMultipleKeyPress(evt) {
	let { keyCode, type } = evt || Event; // to deal with IE
	let isKeyDown = type === "keydown";
	multipleKeysMap[keyCode] = isKeyDown;
	if (isKeyDown && multipleKeysMap[8] && multipleKeysMap[189]) {
		//   backspace & Minus
		moveToPreviousPlaybackRange();
	} else if (isKeyDown && multipleKeysMap[8] && multipleKeysMap[187]) {
		//   backspace & Equal
		moveToNextPlaybackRange();
	}
}

let isReviewing = false;
let unsubscribeToReview = null;
export function setupReviewMode({
	activate = true,
	loopCurrentSplit = false,
	trackingMode,
	videoInfo,
}) {
	const deactivate = !activate;
	if (deactivate) {
		clearInterval(unsubscribeToReview);
		return notify.display("Review: Stopped!");
	}

	if (trackingMode === "active") {
		trackingMode = "inactive";
		trackingMode(null, false);
	}

	if (videoInfo.origin.startTime) videoInfo.currentTime = videoInfo.origin.startTime;

	clearInterval(unsubscribeToReview);
	loopCurrentSplit && notify.display(`Reviews: Looping`);
	watcherForReviewMode(loopCurrentSplit);
}

function watcherForReviewMode(loopCurrentSplit = false, videoInfo, player, playlistPosition) {
	unsubscribeToReview = setInterval(() => {
		if (videoInfo.currentTime < videoInfo.origin.startTime) {
			videoInfo.currentTime = videoInfo.origin.startTime;
		}

		if (loopCurrentSplit) {
			if (videoInfo.currentTime >= videoInfo.origin.endTime - 5) {
				videoInfo.currentTime = videoInfo.origin.startTime;
				studyStatisticsTracker(0.5);
			}
		} else {
			if (videoInfo.currentTime >= videoInfo.origin.endTime - 5) {
				studyStatisticsTracker(0.25);
				player.play(playlistPosition + 1);
				videoInfo.currentTime = videoInfo.origin.startTime;
				clearInterval(unsubscribeToReview);
				watcherForReviewMode();
				// ===================
				//  videoInfo.currentTime = videoInfo.origin.startTime;
				//  setSpeed(speedTOptions[speedTracker]);
				//  studyStatisticsTracker();
				//   notifyReviewStatus();
			}
		}
	}, 1000);
}

// video.addEventListener('seeked', alertAtKeyMoments);
export const videoOnLoadeddata = ({ setState, notify }) => {
	//   clearInterval(replayConfig.unsubscribe);
	alertAtKeyMoments();

	//   setupForStandardTrackingMode();
	//   trackingMode(null, false);
	//   setTimeout(notifyReviewStatus, 5000);

	if (replayConfig.unsubscribe) {
		replayConfig.unsubscribe = null;
		setupForStandardTrackingMode();
		trackingMode(null, false);
		return setTimeout(notifyReviewStatus, 5000);
	}

	const videoTitle = `${getVideoTitle()}  `;
	notify(videoTitle, `[${toMinutesSeconds(getVideoTotalDuration())}]`);
};

// video.addEventListener('timeupdate', detectBackwardSkipSeek);

export const videoOnPause = () => {
	//   replayConfig.unsubscribe && studyStatisticsTracker(0.5);
	studyStatisticsTracker(0.5);
};

export const videoOnended = () => {
	if (replayConfig.unsubscribe) {
		setVideoPosition(replayConfig.startPosition);
		notifyReviewStatus();
	}

	//   setSpeed(replayConfig.cachedPlaybackRate || 3);

	//   clearInterval(replayConfig.unsubscribe);
	//   replayConfig = {};
	notify.display(`Toggle Speed Stopped:`);
};

function getVideoSplitFactor() {
	let videoSplit;
	if (getVideoTotalDuration() >= 30 * 60) videoSplit = 8;
	else if (getVideoTotalDuration() >= 20 * 60) videoSplit = 6;
	else if (getVideoTotalDuration() >= 10 * 60) videoSplit = 4;
	else if (getVideoTotalDuration() >= 5 * 60) videoSplit = 2;
	else videoSplit = 1;
	return videoSplit;
}

const convertToNearest30 = (num) => Math.round(num / 30) * 30;
const convertToNearestX = (num, X) => Math.floor(num / X) * X;
export const seekToTime = function (value) {
	let seekToTime = getVideoCurrentTime() + value;
	if (seekToTime < 0) {
		setVideoPosition(0);
	} else if (seekToTime > getVideoTotalDuration()) setVideoPosition(getVideoTotalDuration());

	setVideoPosition(seekToTime);
	notify.display(
		`Current Position: <${toMinutesSeconds(getVideoCurrentTime())}> of <${toMinutesSeconds(
			getVideoTotalDuration()
		)}>`
	);
};

function getVideoTotalDuration() {}

export function reduceSpeed(value = 0.25) {
	const MIN_SPEED = 0.5;
	let newSpeed = getVideoPlaybackrate() - value;
	newSpeed = newSpeed < MIN_SPEED ? MIN_SPEED : newSpeed;
	setSpeed(newSpeed);
}

export function increaseSpeed(value = 0.25) {
	const MAX_SPEED = 15;
	let newSpeed = getVideoPlaybackrate() + value;
	newSpeed = newSpeed > MAX_SPEED ? MAX_SPEED : newSpeed;
	setSpeed(newSpeed);
}

function notifyReviewStatus() {
	const currentSplit = parseInt(replayConfig.endPosition / replayConfig.interval);
	const totalSplit = parseInt(getVideoTotalDuration() / replayConfig.interval);
	let reviews = JSON.parse(localStorage.getItem("reviews"));

	let videoStat =
		reviews && reviews[getVideoPath()]?.replayHistory[`split-${currentSplit}`]?.count;

	notify.display(
		`Video Stats: Split watch count:: ${videoStat ?? 0} times!
    \r\nReplay: is ${
		!!replayConfig.unsubscribe ? "ON!:" : "OFF!:"
	}\r\nStart Time: ${toMinutesSeconds(
			replayConfig.startPosition
		)}\r\nEnd Time:  ${toMinutesSeconds(replayConfig.endPosition)}`,
		`\r\nPosition:   [${currentSplit}] of [${totalSplit}]`,
		20000
	);
}
// =====================================================
// =====================================================

// video.addEventListener('ended', () => {
//   stats.set(video.origin, 0)
//   playlist.state = 0
//   navigator.mediaSession.setActionHandler('seekbackward', null)
//   navigator.mediaSession.setActionHandler('seekforward', null)

//   if (playlist.index + 1 !== playlist.entries.length) {
//     playlist.play(playlist.index + 1, playlist.configs.delay)
//   } else {
//     if (repeat.dataset.mode === 'repeat-all') {
//       playlist.play(0, playlist.configs.delay)
//     } else if (repeat.dataset.mode === 'repeat-one') {
//       playlist.play(playlist.index, playlist.configs.delay)
//     }
//   }
// })

// video.addEventListener('play', () => (playlist.state = 1))
// video.addEventListener('playing', () => (playlist.state = 1))
// video.addEventListener('pause', () => (playlist.state = 2))
// video.addEventListener('waiting', () => (playlist.state = 3))
// video.addEventListener('loadstart', () => (playlist.state = 3))
// video.addEventListener('loadedmetadata', () => {
//   const d = video.duration
//   const h = Math.floor(d / 3600)
//   const m = Math.floor((d % 3600) / 60)
//   const s = Math.floor((d % 3600) % 60)

//   video.origin.e.querySelector('span[data-id=duration]').textContent =
//     ('0' + h).substr(-2) +
//     ':' +
//     ('0' + m).substr(-2) +
//     ':' +
//     ('0' + s).substr(-2)
// })

// previous.addEventListener('click', () => {
//   playlist.play(playlist.index - 1)

//   if (isReviewing) {
//     setTimeout(() => {
//       setupReviewMode({})
//     }, 1000)
//   }
// })

// next.addEventListener('click', () => {
//   playlist.play(playlist.index + 1)

//   if (isReviewing) {
//     setTimeout(() => {
//       setupReviewMode({})
//     }, 1000)
//   }
// })

// sortOptions.addEventListener('change', e => {
//   //   setupReviewMode({ activate: true });
//   if (isReviewing) {
//     reviewModeElement.dataset.mode = 'inactive'
//     reviewModeElement.click()
//   }
// })

// reviewModeElement.addEventListener('click', e => {
//   const modes = ['active', 'loop', 'inactive']
//   let index = (modes.indexOf(e.target.dataset.mode) + 1) % modes.length
//   const value = modes[index]

//   if (value === 'active') {
//     const reviews = playlist.loadReviews()

//     if (!reviews) return
//     setupReviewMode({ activate: true })
//     isReviewing = true
//   } else if (value === 'loop') {
//     //  playlist.loadReviews();
//     setupReviewMode({ loopCurrentSplit: true })
//     isReviewing = true
//   } else if (value === 'inactive') {
//     playlist.loadPlaylistFromStorage()
//     setupReviewMode({ activate: false })
//     isReviewing = false
//   }

//   reviewModeElement.dataset.mode = modes[index]
// })

// trackingModeElement.addEventListener('click', e => {
//   const value = e.target.dataset.mode

//   if (value === 'active') {
//     e.target.dataset.mode = 'inactive'
//     trackingMode(null, false)
//   } else {
//     e.target.dataset.mode = 'active'
//     setupForStandardTrackingMode()
//     trackingMode(null, false)
//   }
// })

// repeat.addEventListener('click', e => {
//   const modes = ['no-repeat', 'repeat-all', 'repeat-one']
//   const index = (modes.indexOf(e.target.dataset.mode) + 1) % 3

//   repeat.dataset.mode = modes[index]
// })

// speed.addEventListener('click', e => {
//   const modes = ['2X', '3X', '3.5X', '4X', '4.25X', '4.5X', '4.75X', '5X']
//   const index = (modes.indexOf(e.target.dataset.mode) + 1) % modes.length

//   speed.dataset.mode = modes[index]
//   updateSpeedIcon(modes[index])
//   speed.title = (() => {
//     return `CURRENT: ${modes[index]}:\n
//     Adjust player's speed (2X [DEFAULT], 3X, 3.5X, 4X, 4.5X and 5X)\n (Ctrl + X or Command + X)`
//   })()
//   video.playbackRate = parseFloat(modes[index])
// })

// boost.addEventListener('click', e => {
//   const modes = ['2b', '3b', '4b']
//   //   const modes = ['1b', '2b', '3b', '4b'];
//   const index = (modes.indexOf(e.target.dataset.mode) + 1) % 3

//   boost.dataset.mode = modes[index]
//   setTimeout(() => {
//     video.boost = parseInt(modes[index])
//   }, 100)
// })
