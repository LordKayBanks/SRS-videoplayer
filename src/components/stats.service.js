import {
	convertToNearest30,
	convertToNearestX,
	getVideoSplitFactor,
	toMinutesSeconds,
} from "../utility/index";

// export const reviewConfig = {
// 	reviewMode: "inactive",
// 	reviewStartRange: 0,
// 	reviewEndRange: 0,
// };

// export const trackingConfig = {
// 	trackingMode: "inactive",
// 	startPosition: 0,
// 	endPosition: 120,
// 	unsubscribe: null,
// 	defaultStartOffset: 30,
// 	defaultEndOffset: 120,
// 	startOffset: 30,
// 	interval: 120,
// 	cachedPlaybackRate: 2.0,
// };
export const alertConfig = {
	alertConfigMidwayTime: null,
	alertConfigOneThirdTime: null,
	alertConfigTwoThirdTime: null,
	speedMode: 0, //1
	lastKeypressTime: null,
	delta: 500,
};

export function studyStatisticsTracker(increment = 1) {
	const { trackingConfig } = this.state;
	const currentSplit = parseInt(trackingConfig.endPosition / trackingConfig.interval);
	let reviews = JSON.parse(localStorage.getItem("reviews"));
	const reviewExists = !!reviews;
	let updatedReview = reviewExists ? reviews : {};
	let review = updatedReview[this.state.url];

	if (!review) {
		review = {
			name: this.state.title,
			path: this.state.url,
			type: this.state.videoFormat,
			replayHistory: {
				[`split-${currentSplit}`]: {
					count: increment,
					startTime: trackingConfig.startPosition,
					endTime: trackingConfig.endPosition,
				},
			},
			lastReviewDate: Date.now(),
		};
	} else {
		if (!review.replayHistory[`split-${currentSplit}`]) {
			review.replayHistory[`split-${currentSplit}`] = {
				count: increment,
				startTime: trackingConfig.startPosition,
				endTime: trackingConfig.endPosition,
			};
		} else {
			review.replayHistory[`split-${currentSplit}`].count =
				review.replayHistory[`split-${currentSplit}`].count + increment;
		}

		review.lastReviewDate = Date.now();
	}

	updatedReview[this.state.url] = { ...review };
	localStorage.setItem("reviews", JSON.stringify({ ...updatedReview }));
	// this.notifyReplayStatus();
}

// =============================================================================
// =============================================================================

export function setupTrackingMode() {
	const { reviewConfig, trackingConfig, duration } = this.state;

	if (reviewConfig.reviewMode !== "inactive") {
		this.setState({ reviewConfig: { ...reviewConfig, reviewMode: "inactive" } });
		this.setSortType("playlist");
		this.setupReviewMode({ activate: false });
	}
	//====================

	let videoSplit = getVideoSplitFactor(duration);
	const interval = parseInt(duration / videoSplit);

	const startOffset = convertToNearestX(
		this.player?.getCurrentTime(),
		trackingConfig.interval
	);

	this.setState({ trackingConfig: { ...trackingConfig, interval, startOffset } });
	//====================
	this.watcherForTrackingMode(null, false);
}

let speedTracker = 2;
let unsubscribeToTracking = null;

export function watcherForTrackingMode(offSet, reNormalize = true) {
	const { trackingConfig, duration } = this.state;
	clearInterval(alertConfig.alertConfigMidwayTime);
	clearInterval(alertConfig.alertConfigTwoThirdTime);
	clearInterval(alertConfig.alertConfigOneThirdTime);
	//   ========================

	if (trackingConfig.trackingMode === "active") {
		clearInterval(unsubscribeToTracking);
		this.setState({
			trackingConfig: { ...trackingConfig, trackingMode: "inactive" },
		});

		// this.notify({
		// 	title: "Tracking mode:",
		// 	message: "Tracking: Stopped!",
		// });
	} else {
		let startPosition;
		let endPosition;

		if (reNormalize) {
			startPosition = Math.max(
				convertToNearest30(this.player?.getCurrentTime()) - offSet,
				0
			);
			endPosition = Math.min(startPosition + offSet, duration);
			this.setState({
				trackingConfig: { ...trackingConfig, startPosition, endPosition },
			});
		} else {
			startPosition = Math.max(trackingConfig.startOffset, 0);
			endPosition = Math.min(startPosition + trackingConfig.interval, duration);
			this.setState({
				trackingConfig: { ...trackingConfig, startPosition, endPosition },
			});
		}

		this.setSpeed(2);

		const minDurationForVideoSplitFactor = 5 * 60;
		duration < minDurationForVideoSplitFactor
			? this.setVideoPosition(0)
			: this.setVideoPosition(parseInt(startPosition));

		unsubscribeToTracking = setInterval(() => {
			const {
				trackingConfig: { startPosition, endPosition },
			} = this.state;

			if (
				this.player?.getCurrentTime() >= endPosition - 5 ||
				this.player?.getCurrentTime() < startPosition
			) {
				this.setVideoPosition(startPosition);

				const speedOptions = [2, 3, 10];
				speedTracker = (speedTracker + 1) % speedOptions.length;
				this.setSpeed(speedOptions[speedTracker]);
				this.studyStatisticsTracker();
			}
		}, 1000);

		this.setState(
			{
				trackingConfig: { ...trackingConfig, trackingMode: "active" },
			},
			() => {
				this.notifyTrackingStatus();
				console.log("🚀 ==> watcherForTrackingMode ==> this.state", this.state);
			}
		);
	}
}

// =============================================================================
// =============================================================================

export function moveToNextPlaybackRange() {
	const { trackingConfig, duration } = this.state;

	const startPosition = Math.min(
		trackingConfig.startPosition + trackingConfig.interval,
		duration - trackingConfig.interval
	);

	const endPosition = Math.min(startPosition + trackingConfig.interval, duration);
	this.setState({
		trackingConfig: { ...trackingConfig, startPosition, endPosition },
	});
	// this.setVideoPosition(trackingConfig.startPosition);
	this.setVideoPosition(startPosition);
	this.notifyTrackingStatus();
}

export function moveToPreviousPlaybackRange() {
	const { trackingConfig, duration } = this.state;
	const startPosition = Math.max(trackingConfig.startPosition - trackingConfig.interval, 0);

	const endPosition = Math.min(
		trackingConfig.startPosition + trackingConfig.interval,
		duration
	);

	this.setState({
		trackingConfig: { ...trackingConfig, startPosition, endPosition },
	});
	// this.setVideoPosition(trackingConfig.startPosition);
	this.setVideoPosition(startPosition);
	this.notifyTrackingStatus();
}
// =============================================================================
// =============================================================================

let unsubscribeToReview = null;

export function setupReviewMode({ activate = true, loopCurrentSplit = false }) {
	const { reviewConfig, trackingConfig } = this.state;

	if (!activate) {
		clearInterval(unsubscribeToReview);
		unsubscribeToReview = null;
		this.setState({
			reviewConfig: { ...reviewConfig, reviewMode: "inactive" },
		});
		return;
	}

	if (trackingConfig.trackingMode === "active") {
		clearInterval(unsubscribeToReview);
		this.setState({
			trackingConfig: { ...trackingConfig, trackingMode: "inactive" },
		});
		this.setSortType("time-descending");
		this.watcherForTrackingMode(null, false);
	}
	// =====================================

	if (loopCurrentSplit) {
		this.setState(
			{
				reviewConfig: { ...reviewConfig, reviewMode: "loop" },
			},
			() => {
				this.notify({
					title: "Review:",
					message: " Review Mode: Loop",
				});
			}
		);
	} else {
		this.setState(
			{
				reviewConfig: { ...reviewConfig, reviewMode: "active" },
			},
			() => {
				this.notify({
					title: "Review:",
					message: " Review Mode: Active",
				});
			}
		);
	}
	if (reviewConfig.reviewStartRange) this.setVideoPosition(reviewConfig.reviewStartRange);

	clearInterval(unsubscribeToReview);
	unsubscribeToReview = null;
	this.watcherForReviewMode(loopCurrentSplit);
}

export function watcherForReviewMode(loopCurrentSplit = false) {
	clearInterval(alertConfig.alertConfigMidwayTime);
	clearInterval(alertConfig.alertConfigTwoThirdTime);
	clearInterval(alertConfig.alertConfigOneThirdTime);
	//   ========================
	unsubscribeToReview = setInterval(() => {
		const { reviewConfig } = this.state;

		if (this.player?.getCurrentTime() < reviewConfig.reviewStartRange) {
			this.setVideoPosition(reviewConfig.reviewStartRange);
		}

		if (loopCurrentSplit) {
			if (this.player?.getCurrentTime() < reviewConfig.reviewEndRange - 5) return;
			this.setVideoPosition(reviewConfig.reviewStartRange);
			this.studyStatisticsTracker(0.5);
		} else {
			if (this.player?.getCurrentTime() < reviewConfig.reviewEndRange - 5) return;
			this.studyStatisticsTracker(0.25);
			// Todo ========
			this.handleNext();
			this.setVideoPosition(reviewConfig.reviewStartRange);
			//  ========
			clearInterval(unsubscribeToReview);
			this.watcherForReviewMode();
			this.notifyReplayStatus();
		}
	}, 1000);
}
// =============================================================================
// =============================================================================

export function alertAtKeyMoments() {
	const { duration } = this.state;
	clearInterval(alertConfig.alertConfigMidwayTime);
	clearInterval(alertConfig.alertConfigTwoThirdTime);
	clearInterval(alertConfig.alertConfigOneThirdTime);
	alertConfig.speedMode === 1 && this.setSpeed(2.5);
	alertConfig.speedMode === 2 && this.setSpeed(2.5);
	//   =================
	//   const standardLength = 10 * 60; //10mins
	//   const minimumLength = 6 * 60; //6mins
	//   if (duration< minimumLength) return;
	//   =================>
	alertConfig.alertConfigOneThirdTime = setInterval(() => {
		const _25PercentTime = duration * 0.25; //80%

		if (
			// duration> standardLength &&
			this.player?.getCurrentTime() > _25PercentTime &&
			this.player?.getCurrentTime() < _25PercentTime * 2
		) {
			alertConfig.speedMode === 1 && this.setSpeed(3);
			alertConfig.speedMode === 2 && this.setSpeed(3.5);

			const remainTime = duration - _25PercentTime; //25%
			this.notify({
				title: `Alert: Just Past 25%`,
				message: `[${toMinutesSeconds(remainTime, false)}]`,
			});
			clearInterval(alertConfig.alertConfigOneThirdTime);
		}
	}, 2000);

	//   =================>
	alertConfig.alertConfigMidwayTime = setInterval(() => {
		const midwayTime = duration * 0.5; //60%

		if (this.player?.getCurrentTime() > midwayTime) {
			alertConfig.speedMode === 1 && this.setSpeed(3);
			alertConfig.speedMode === 2 && this.setSpeed(4);

			const remainTime = duration - midwayTime; //40%
			this.notify({
				title: `Alert:Just Past 50%`,
				message: `[${toMinutesSeconds(remainTime, false)}]`,
			});
			clearInterval(alertConfig.alertConfigMidwayTime);
		}
	}, 2000);

	//   =====================>
	alertConfig.alertConfigTwoThirdTime = setInterval(() => {
		const _75PercentTime = duration * 0.75; //80%

		if (
			// duration> standardLength &&
			this.player?.getCurrentTime() > _75PercentTime
		) {
			alertConfig.speedMode === 1 && this.setSpeed(3.5);
			alertConfig.speedMode === 2 && this.setSpeed(4.5);

			const remainTime = duration - _75PercentTime; //25%
			this.notify({
				title: `Alert:Just Past 75%`,
				message: `[${toMinutesSeconds(remainTime, false)}]`,
			});
			clearInterval(alertConfig.alertConfigTwoThirdTime);
		}
	}, 2000);
}

export function notifyReplayStatus() {
	const { duration } = this.state;
	const { reviewConfig, trackingConfig } = this.state;
	const currentSplit = parseInt(trackingConfig.endPosition / trackingConfig.interval);
	const totalSplit = parseInt(duration / trackingConfig.interval);
	let reviews = JSON.parse(localStorage.getItem("reviews"));

	let videoStat =
		reviews && reviews[this.state.url]?.replayHistory[`split-${currentSplit}`]?.count;

	this.notify({
		title: `Video Stats:
        \r\nSplit watch count:: ${videoStat ?? 0} times!
        \r\nReview: is ${
			reviewConfig.reviewMode === "active" ? "ON!:" : "OFF!:"
		}\r\nStart Time: ${toMinutesSeconds(
			trackingConfig.startPosition
		)}\r\nEnd Time:  ${toMinutesSeconds(trackingConfig.endPosition)}`,
		message: `Position:   [${currentSplit}] of [${totalSplit}]`,
		delay: 20000,
	});
}
export function notifyTrackingStatus() {
	const { trackingConfig, duration } = this.state;
	const currentSplit = parseInt(trackingConfig.endPosition / trackingConfig.interval);
	const totalSplit = parseInt(duration / trackingConfig.interval);
	let reviews = JSON.parse(localStorage.getItem("reviews"));

	let videoStat =
		reviews && reviews[this.state.url]?.replayHistory[`split-${currentSplit}`]?.count;

	this.notify({
		title: "Tracking:",
		message: `Split watch count:: ${videoStat ?? 0} times!
        \r\nTracking: is ${trackingConfig.trackingMode === "active" ? "ON!:" : "OFF!:"}`,
		delay: 20000,
	});
}
//=================================================================
//=================================================================

// video.addEventListener('seeked', this.alertAtKeyMoments);
export function videoOnLoadeddata() {
	const { reviewConfig, trackingConfig } = this.state;

	let isReviewMode_TrackingMode_Active =
		trackingConfig.trackingMode !== "inactive" || reviewConfig.reviewMode !== "inactive";

	if (!isReviewMode_TrackingMode_Active) {
		this.alertAtKeyMoments();
	}
	//   clearInterval( unsubscribeToTracking);
	//

	//   setupTrackingMode();
	//   this.watcherForTrackingMode(null, false);
	//   setTimeout(this.notifyReplayStatus, 5000);

	if (trackingConfig.trackingConfig === "active") {
		this.setupTrackingMode();
		this.setupTrackingMode();
		// this.watcherForTrackingMode(null, false);
		// return setTimeout(this.notifyTrackingStatus.bind(this), 5000);
	}

	// this.notify({
	// 	title: `Title: ${this.state.title}`,
	// 	message: `[${toMinutesSeconds(duration)}]`,
	// });
}

// video.addEventListener('timeupdate', detectBackwardSkipSeek);

export function videoOnPause() {
	//    this.state.trackingMode==='active' && studyStatisticsTracker(0.5);
	this.studyStatisticsTracker(0.5);
}
export function videoOnended() {
	const { trackingConfig } = this.state;

	if (trackingConfig.trackingConfig === "active") {
		this.setVideoPosition(trackingConfig.startPosition);
		// this.notifyTrackingStatus();
	}

	//   this.setSpeed( trackingConfig.cachedPlaybackRate || 3);

	//   clearInterval( unsubscribeToTracking);
	//    trackingConfig = {};

	// this.notify({
	// 	title: `Toggle Speed Stopped:`,
	// 	message: "",
	// });
}

export function seekToTime(value) {
	const { duration } = this.state;
	let seekToTime = this.player?.getCurrentTime() + value;

	if (seekToTime < 0) {
		this.setVideoPosition(0);
	} else if (seekToTime > duration) this.setVideoPosition(duration);

	this.setVideoPosition(seekToTime);
	// this.notify({
	//     title: 'Sample Title: ',
	//     message: `Current Position: <${toMinutesSeconds(
	//         this.player?.getCurrentTime()
	//     )}> of <${toMinutesSeconds(duration)}>`
	// })
}

export function reduceSpeed(value = 0.25) {
	const MIN_SPEED = 0.5;
	let newSpeed = this.state.playbackRate - value;
	newSpeed = newSpeed < MIN_SPEED ? MIN_SPEED : newSpeed;
	this.setSpeed(newSpeed);
}

export function increaseSpeed(value = 0.25) {
	const MAX_SPEED = 15;
	let newSpeed = this.state.playbackRate + value;
	newSpeed = newSpeed > MAX_SPEED ? MAX_SPEED : newSpeed;
	this.setSpeed(newSpeed);
}

export function changeReviewMode() {
	const { reviewConfig } = this.state;

	if (reviewConfig.reviewMode === "active") {
		this.setupReviewMode({ loopCurrentSplit: true });
	} else if (reviewConfig.reviewMode === "loop") {
		this.setupReviewMode({ activate: false });
	} else if (reviewConfig.reviewMode === "inactive") {
		this.setupReviewMode({ activate: true });
	}
}
