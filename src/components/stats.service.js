import {
	convertToNearest30,
	convertToNearestX,
	getVideoSplitFactor,
	toMinutesSeconds,
} from "../utility/index";

export const reviewConfig = {
	reviewMode: "inactive",
	reviewStartRange: 0,
	reviewEndRange: 0,
};

export const trackingConfig = {
	trackingMode: "inactive",
	startPosition: 0,
	endPosition: 120,
	unsubscribe: null,
	defaultStartOffset: 30,
	defaultEndOffset: 120,
	startOffset: 30,
	interval: 120,
	cachedPlaybackRate: 2.0,
};
export const alertConfig = {
	alertConfigMidwayTime: null,
	alertConfigOneThirdTime: null,
	alertConfigTwoThirdTime: null,
	speedMode: 0, //1
	lastKeypressTime: null,
	delta: 500,
};

export function studyStatisticsTracker(increment = 1) {
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
	if (reviewConfig.reviewMode !== "inactive") {
		reviewConfig.reviewMode = "inactive";
		this.setupReviewMode({ activate: false });
	}

	let videoSplit = getVideoSplitFactor(this.player?.getDuration());

	trackingConfig.interval = parseInt(this.player?.getDuration() / videoSplit);
	trackingConfig.startOffset = convertToNearestX(
		this.player?.getCurrentTime(),
		trackingConfig.interval
	);
	//====================
	this.trackingMode(null, false);
}

let speedTracker = 2;

export function trackingMode(offSet, renormalize = true) {
	clearInterval(alertConfig.alertConfigMidwayTime);
	clearInterval(alertConfig.alertConfigTwoThirdTime);
	clearInterval(alertConfig.alertConfigOneThirdTime);
	//   ========================

	if (trackingConfig.unsubscribe) {
		clearInterval(trackingConfig.unsubscribe);
		trackingConfig.unsubscribe = null;
		trackingConfig.trackingMode = "inactive";
		this.notify({
			title: "Tracking mode:",
			message: "Tracking: Stopped!",
		});
	} else {
		if (renormalize) {
			trackingConfig.startPosition = Math.max(
				convertToNearest30(this.player?.getCurrentTime()) - offSet,
				0
			);

			trackingConfig.endPosition = Math.min(
				trackingConfig.startPosition + offSet,
				this.player?.getDuration()
			);
		} else {
			trackingConfig.startPosition = Math.max(trackingConfig.startOffset, 0);
			trackingConfig.endPosition = Math.min(
				trackingConfig.startPosition + trackingConfig.interval,
				this.player?.getDuration()
			);
		}

		this.setSpeed(2);

		const minDurationForVideoSplitFactor = 5 * 60;

		this.player?.getDuration() < minDurationForVideoSplitFactor
			? this.setVideoPosition(0)
			: this.setVideoPosition(parseInt(trackingConfig.startPosition));

		trackingConfig.unsubscribe = setInterval(() => {
			if (
				this.player?.getCurrentTime() >= trackingConfig.endPosition - 5 ||
				this.player?.getCurrentTime() < trackingConfig.startPosition
			) {
				this.setVideoPosition(trackingConfig.startPosition);

				const speedTOptions = [2, 3, 10];

				speedTracker = (speedTracker + 1) % speedTOptions.length;
				this.setSpeed(speedTOptions[speedTracker]);
				this.studyStatisticsTracker();
			}
		}, 1000);
		trackingConfig.trackingMode = "active";
		this.notifyTrackingStatus();
		// this.notify({
		//     title: 'Tracking mode:',
		//     message: 'Tracking: Started!'
		// })
	}
}

// =============================================================================
// =============================================================================

export function moveToNextPlaybackRange() {
	trackingConfig.startPosition = Math.min(
		trackingConfig.startPosition + trackingConfig.interval,
		this.player?.getDuration() - trackingConfig.interval
	);

	trackingConfig.endPosition = Math.min(
		trackingConfig.startPosition + trackingConfig.interval,
		this.player?.getDuration()
	);
	this.setVideoPosition(trackingConfig.startPosition);
	this.notifyTrackingStatus();
}

export function moveToPreviousPlaybackRange() {
	trackingConfig.startPosition = Math.max(
		trackingConfig.startPosition - trackingConfig.interval,
		0
	);

	trackingConfig.endPosition = Math.min(
		trackingConfig.startPosition + trackingConfig.interval,
		this.player?.getDuration()
	);
	this.setVideoPosition(trackingConfig.startPosition);
	this.notifyTrackingStatus();
}
// =============================================================================
// =============================================================================

let unsubscribeToReview = null;

export function setupReviewMode({ activate = true, loopCurrentSplit = false }) {
	if (!activate) {
		clearInterval(unsubscribeToReview);
		unsubscribeToReview = null;
		reviewConfig.reviewMode = "inactive";
		return this.notify({
			title: "reviewMode:",
			message: "Review: Stopped!",
		});
	}

	if (trackingConfig.trackingMode === "active") {
		trackingConfig.trackingMode = "inactive";
		trackingConfig.unsubscribe = null;
		this.trackingMode(null, false);
	}
	// =====================================

	if (loopCurrentSplit) {
		reviewConfig.reviewMode = "loop";
		this.notify({
			title: "reviewMode:",
			message: " Review mode: Looping",
		});
	} else {
		reviewConfig.reviewMode = "active";
		this.notify({
			title: "reviewMode:",
			message: " Review mode: Active",
		});
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
			// todo ========
			this.handleNext();
			this.setState({
				currentlyPlaying: this.state.currentlyPlaying + 1,
			});
			this.setVideoPosition(reviewConfig.reviewStartRange);
			//  ========
			clearInterval(unsubscribeToReview);
			this.watcherForReviewMode();
			// ===================
			//  this.setVideoPosition( reviewConfig.reviewStartRange);
			//  this.setSpeed(speedTOptions[this.speedTracker]);
			//  studyStatisticsTracker();
			this.notifyReplayStatus();
		}
	}, 1000);
}
// =============================================================================
// =============================================================================

export function alertAtKeyMoments() {
	clearInterval(alertConfig.alertConfigMidwayTime);
	clearInterval(alertConfig.alertConfigTwoThirdTime);
	clearInterval(alertConfig.alertConfigOneThirdTime);
	alertConfig.speedMode === 1 && this.setSpeed(2.5);
	alertConfig.speedMode === 2 && this.setSpeed(2.5);
	//   =================
	//   const standardLength = 10 * 60; //10mins
	//   const minimumLength = 6 * 60; //6mins
	//   if (this.player?.getDuration()< minimumLength) return;
	//   =================>
	alertConfig.alertConfigOneThirdTime = setInterval(() => {
		const _25PercentTime = this.player?.getDuration() * 0.25; //80%

		if (
			// this.player?.getDuration()> standardLength &&
			this.player?.getCurrentTime() > _25PercentTime &&
			this.player?.getCurrentTime() < _25PercentTime * 2
		) {
			alertConfig.speedMode === 1 && this.setSpeed(3);
			alertConfig.speedMode === 2 && this.setSpeed(3.5);

			const remainTime = this.player?.getDuration() - _25PercentTime; //25%

			this.notify({
				title: `Alert: Just Past 25%`,
				message: `[${toMinutesSeconds(remainTime, false)}]`,
			});
			clearInterval(alertConfig.alertConfigOneThirdTime);
		}
	}, 2000);

	//   =================>
	alertConfig.alertConfigMidwayTime = setInterval(() => {
		const midwayTime = this.player?.getDuration() * 0.5; //60%

		if (this.player?.getCurrentTime() > midwayTime) {
			alertConfig.speedMode === 1 && this.setSpeed(3);
			alertConfig.speedMode === 2 && this.setSpeed(4);

			const remainTime = this.player?.getDuration() - midwayTime; //40%

			this.notify({
				title: `Alert:Just Past 50%`,
				message: `[${toMinutesSeconds(remainTime, false)}]`,
			});
			clearInterval(alertConfig.alertConfigMidwayTime);
		}
	}, 2000);

	//   =====================>
	alertConfig.alertConfigTwoThirdTime = setInterval(() => {
		const _75PercentTime = this.player?.getDuration() * 0.75; //80%

		if (
			// this.player?.getDuration()> standardLength &&
			this.player?.getCurrentTime() > _75PercentTime
		) {
			alertConfig.speedMode === 1 && this.setSpeed(3.5);
			alertConfig.speedMode === 2 && this.setSpeed(4.5);

			const remainTime = this.player?.getDuration() - _75PercentTime; //25%

			this.notify({
				title: `Alert:Just Past 75%`,
				message: `[${toMinutesSeconds(remainTime, false)}]`,
			});
			clearInterval(alertConfig.alertConfigTwoThirdTime);
		}
	}, 2000);
}

export function notifyReplayStatus() {
	const currentSplit = parseInt(trackingConfig.endPosition / trackingConfig.interval);
	const totalSplit = parseInt(this.player?.getDuration() / trackingConfig.interval);
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
	const currentSplit = parseInt(trackingConfig.endPosition / trackingConfig.interval);
	const totalSplit = parseInt(this.player?.getDuration() / trackingConfig.interval);
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
	let isReviewMode_TrackingMode_Active =
		trackingConfig.trackingMode !== "inactive" || reviewConfig.reviewMode !== "inactive";

	if (!isReviewMode_TrackingMode_Active) {
		this.alertAtKeyMoments();
	}
	//   clearInterval( trackingConfig.unsubscribe);
	//

	//   setupTrackingMode();
	//   this.trackingMode(null, false);
	//   setTimeout(this.notifyReplayStatus, 5000);

	if (trackingConfig.unsubscribe) {
		trackingConfig.unsubscribe = null;
		this.setupTrackingMode();
		this.trackingMode(null, false);
		return setTimeout(this.notifyTrackingStatus.bind(this), 5000);
	}

	// this.notify({
	// 	title: `Title: ${this.state.title}`,
	// 	message: `[${toMinutesSeconds(this.player?.getDuration())}]`,
	// });
}

// video.addEventListener('timeupdate', detectBackwardSkipSeek);

export function videoOnPause() {
	//    trackingConfig.unsubscribe && studyStatisticsTracker(0.5);
	this.studyStatisticsTracker(0.5);
}
export function videoOnended() {
	if (trackingConfig.unsubscribe) {
		this.setVideoPosition(trackingConfig.startPosition);
		this.notifyTrackingStatus();
	}

	//   this.setSpeed( trackingConfig.cachedPlaybackRate || 3);

	//   clearInterval( trackingConfig.unsubscribe);
	//    trackingConfig = {};

	// this.notify({
	// 	title: `Toggle Speed Stopped:`,
	// 	message: "",
	// });
}

export function seekToTime(value) {
	let seekToTime = this.player?.getCurrentTime() + value;

	if (seekToTime < 0) {
		this.setVideoPosition(0);
	} else if (seekToTime > this.player?.getDuration())
		this.setVideoPosition(this.player?.getDuration());

	this.setVideoPosition(seekToTime);
	// this.notify({
	//     title: 'Sample Title: ',
	//     message: `Current Position: <${toMinutesSeconds(
	//         this.player?.getCurrentTime()
	//     )}> of <${toMinutesSeconds(this.player?.getDuration())}>`
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
	if (this.reviewConfig.reviewMode === "active") {
		this.setupReviewMode({ loopCurrentSplit: true });
	} else if (this.reviewConfig.reviewMode === "loop") {
		this.setupReviewMode({ activate: false });
	} else if (this.reviewConfig.reviewMode === "inactive") {
		this.setupReviewMode({ activate: true });
	}
}
