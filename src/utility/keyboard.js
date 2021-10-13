/* eslint-disable no-undef */
/*eslint no-undef: "error"*/
// import notify from './notify.js'

const keyboard = {};

const rules = [
	{
		condition(meta, code, shift) {
			if (
				code === "Minus" ||
				code === "Equal" ||
				code === "Digit9" ||
				code === "Digit0"
			) {
				return true;
			}
		},
		action(e) {
			if (e.code === "Digit9") {
				replayConfig.startPosition = Math.max(
					replayConfig.startPosition - replayConfig.defaultStartOffset,
					0
				);

				replayConfig.startPosition = parseInt(replayConfig.startPosition);
				setVideoPosition(replayConfig.startPosition);
			} else if (e.code === "Digit0") {
				replayConfig.startPosition = Math.min(
					replayConfig.startPosition + replayConfig.defaultStartOffset,
					convertToNearest30(replayConfig.endPosition) -
						replayConfig.defaultEndOffset,
					getVideoTotalDuration()
				);

				replayConfig.startPosition = parseInt(replayConfig.startPosition);
				setVideoPosition(replayConfig.startPosition);
			} else if (e.code === "Minus") {
				replayConfig.endPosition = Math.max(
					convertToNearest30(replayConfig.endPosition) -
						replayConfig.defaultStartOffset,
					replayConfig.startPosition + replayConfig.defaultEndOffset,
					0
				);
				replayConfig.endPosition = parseInt(replayConfig.endPosition);
				//   setVideoPosition(replayConfig.startPosition);
			} else if (e.code === "Equal") {
				replayConfig.endPosition = Math.min(
					replayConfig.endPosition + replayConfig.defaultStartOffset,
					getVideoTotalDuration()
				);
				replayConfig.endPosition = parseInt(replayConfig.endPosition);
				//   videoSetTimereplayConfig.startPosition);
			}

			notifyReviewStatus();
			return true;
		},
	},
	{
		condition(meta, code, shift) {
			return (
				code === "Digit1" ||
				code === "Backslash" ||
				code === "Quote" ||
				code === "Semicolon"
			);
		},
		action(e) {
			if (e.code === "Semicolon") {
				setupForStandardTrackingMode();
				trackingMode(null, false);
			} else if (e.code === "Backslash") {
				trackingMode(parseInt(getVideoTotalDuration()));
			} else if (e.code === "Digit1") {
				notifyReviewStatus();
			}
			return true;
		},
	},
	{
		condition(meta, code, shift) {
			return code === "KeyA" || code === "KeyS" || code === "Comma" || code === "Period";
		},
		action(e) {
			if (e.code === "KeyA" || e.code === "Comma") {
				moveToPreviousPlaybackRange();
			} else {
				moveToNextPlaybackRange();
			}
			return true;
		},
	},
	{
		condition(meta, code, shift) {
			return code === "ArrowRight" || code === "ArrowLeft";
		},
		action(event) {
			event.preventDefault();

			if (event.code === "ArrowRight") {
				seekToTime(10);
			} else {
				seekToTime(-10);
			}
			return true;
		},
	},

	//=================
	{
		condition(meta, code, shift) {
			return code === "KeyB";
			// return code === 'KeyP' && meta && shift;
		},
		action() {
			document.getElementById("previous").click();
			return true;
		},
	},
	{
		condition(meta, code, shift) {
			return code === "KeyN";
			// return code === 'KeyN' && meta && shift;
		},
		action() {
			document.getElementById("next").click();
			return true;
		},
	},
	//=================
	{
		// toggle playlist
		condition(meta, code) {
			return code === "Slash";
			// return code === 'KeyP' && meta;
		},
		action() {
			document.getElementById("p-button").click();
			return true;
		},
	},

	{
		condition(meta, code) {
			return code === "KeyO";
		},
		action() {
			reduceSpeed(5);
			return true;
		},
	},
	{
		condition(meta, code) {
			return code === "KeyP";
		},
		action() {
			increaseSpeed(5);
			return true;
		},
	},
	{
		condition(meta, code) {
			return code === "BracketLeft";
		},
		action() {
			reduceSpeed();
			return true;
		},
	},
	{
		condition(meta, code) {
			return code === "BracketRight";
		},
		action() {
			increaseSpeed();
			return true;
		},
	},
];

export const documentOnKeyDown = (e) => {
	const meta = e.metaKey || e.ctrlKey;

	for (const { condition, action } of rules) {
		if (condition(meta, e.code, e.shiftKey)) {
			if (action(e)) {
				e.preventDefault();
			}
			break;
		}
	}
};

keyboard.register = (rule) => rules.push(rule);

export default keyboard;
