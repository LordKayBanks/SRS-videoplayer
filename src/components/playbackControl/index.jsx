import Controls from "./component";
import React from "react";
import RepeatRange from "../RepeatRange/component";
import "./style.scss";
import { convertToNearestX } from "../../utility";

function PlaybackControl({
	playing,
	handlePlayPause,
	muted,
	handleToggleMuted,
	volume,
	handleVolumeChange,
	currentTime,
	totalDuration,
	playbackRate,
	handlePlaybackRate,
	reviewRange,
	handleReviewMode,
	handlePrevious,
	handleNext,
}) {
	let position = parseInt((currentTime / totalDuration) * 100);
	let MAX = parseInt(totalDuration);
	let STEP = parseInt(totalDuration / 10);
	MAX = convertToNearestX(MAX, STEP);

	let values = [
		convertToNearestX(parseInt(reviewRange.reviewStartRange), STEP),
		convertToNearestX(parseInt(reviewRange.reviewEndRange), STEP),
	];
	return (
		<div
			className="playback-control"
			style={{ background: playing ? "#00000034" : "#726d6d" }}
		>
			<div>
				<div
					className="progress"
					style={{
						width: "100%",
						height: "4px",
						background: `linear-gradient(to right, #18ff00 ${position}%, rgba(255,255,255,0) ${position}%)`,
						position: "relative",
						top: "15px",
					}}
				></div>

				{!!MAX && (
					<RepeatRange
						handleReviewMode={handleReviewMode}
						values={values}
						MAX={MAX}
						STEP={STEP}
					></RepeatRange>
				)}

				<Controls
					playing={playing}
					handlePlayPause={handlePlayPause}
					muted={muted}
					handleToggleMuted={handleToggleMuted}
					volume={volume}
					handleVolumeChange={handleVolumeChange}
					currentTime={currentTime}
					totalDuration={totalDuration}
					playbackRate={playbackRate}
					handlePlaybackRate={handlePlaybackRate}
					handlePrevious={handlePrevious}
					handleNext={handleNext}
				></Controls>
			</div>
		</div>
	);
}

export default PlaybackControl;
