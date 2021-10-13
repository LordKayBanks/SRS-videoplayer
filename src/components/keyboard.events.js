const rules = [
	{
		condition(meta, code, shift) {
			return code === "Backslash" || code === "Quote" || code === "Semicolon";
		},
		action(e) {
			if (e.code === "Semicolon") {
				this.setupTrackingMode();
				// this.trackingMode(null, false);
			} else if (e.code === "Quote") {
				this.changeReviewMode();
			} else if (e.code === "Backslash") {
				this.notifyReviewStatus();
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
				this.moveToPreviousPlaybackRange();
			} else {
				this.moveToNextPlaybackRange();
			}
			return true;
		},
	},

	//=================
	{
		condition(meta, code, shift) {
			return code === "KeyN" || code === "KeyB";
		},
		action(event) {
			if (event.code === "KeyN") {
				this.handleNext();
			} else {
				this.handlePrevious();
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
				this.seekToTime(20);
			} else {
				this.seekToTime(-20);
			}
			return true;
		},
	},
	//=================
	{
		condition(meta, code) {
			return code === "BracketRight" || code === "BracketLeft";
		},
		action(e) {
			if (e.code === "BracketRight") {
				this.increaseSpeed();
			} else {
				this.reduceSpeed();
			}
			return true;
		},
	},
	{
		condition(meta, code) {
			return code === "KeyM";
		},
		action() {
			this.handleToggleMuted();
			return true;
		},
	},
	{
		condition(meta, code, shift) {
			return code === "ArrowDown" || code === "Space";
		},
		action(event) {
			event.preventDefault();
			this.handlePlayPause();
			return true;
		},
	},
	{
		condition(meta, code, shift) {
			return code === "MetaRight" || code === "AltRight";
		},
		action(event) {
			event.preventDefault();
			if (this.trackingConfig.trackingMode === "active") {
				if (event.code === "AltRight") this.studyStatisticsTracker(10);
				else this.studyStatisticsTracker(-2);
				// this.notify.display('Split count : 15')
			}
			return true;
		},
	},
	{
		// change volume
		condition(meta, code) {
			if (code === "KeyQ" || code === "KeyW") {
				return true;
			}
		},
		action(e) {
			const volume = Math.min(
				1,
				Math.max(
					0,
					Math.round(this.state.volume * 100 + (e.code === "KeyW" ? 5 : -5)) / 100
				)
			);

			this.setState({ volume });
			// notify.display('Volume: ' + (v.volume * 100).toFixed(0) + '%')
			return true;
		},
	},
];

export default function documentOnKeyDown(_this) {
	return (e) => {
		const meta = e.metaKey || e.ctrlKey;

		for (let { condition, action } of rules) {
			condition = condition.bind(_this);
			action = action.bind(_this);
			if (condition(meta, e.code, e.shiftKey)) {
				if (action(e)) {
					e.preventDefault();
				}
				break;
			}
		}
	};
}
