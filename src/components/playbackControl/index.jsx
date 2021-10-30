/* eslint-disable padding-line-between-statements */
import Controls from "./component";
import React, { useEffect } from "react";
import RepeatRange from "../RepeatRange/component";
import "./style.scss";
import { convertToNearestX } from "../../utility";

import { Range } from "react-range";

function PlaybackControl({
	playing,
	handlePlayPause,
	muted,
	handleToggleMuted,
	volume,
	handleVolumeChange,
	currentTime,
	setVideoPosition,
	totalDuration,
	playbackRate,
	handlePlaybackRate,
	range,
	handleRange,
	handlePrevious,
	handleNext,
}) {
	let position = parseInt((currentTime / totalDuration) * 100);
	let MAX = parseInt(totalDuration);
	let STEP = parseInt(totalDuration / 10);
	MAX = convertToNearestX(MAX, STEP);

	let values = [
		convertToNearestX(parseInt(range.StartRange), STEP),
		convertToNearestX(parseInt(range.EndRange), STEP),
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
						// top: "18px",
						top: "55px",
					}}
				></div>
				<div
					className="prog-container"
					style={{
						position: "relate",
						top: "42px",
						width: " 100%",
						zIndex: "5",
					}}
				>
					<SuperSimple
						MAX={parseInt(totalDuration)}
						appValue={[position]}
						handleValueChange={setVideoPosition}
					></SuperSimple>
					{!!MAX && (
						<RepeatRange
							key={totalDuration}
							handleRange={handleRange}
							values={values}
							MAX={MAX}
							STEP={STEP}
						></RepeatRange>
					)}
				</div>

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
const SuperSimple = ({ MAX, appValue, handleValueChange }) => {
	return (
		<Range
			step={0.1}
			min={0}
			max={100}
			values={appValue}
			onChange={(values) => {
				let updatedValue = (values[0] / 100) * MAX;
				handleValueChange(updatedValue);
			}}
			renderTrack={({ props, children }) => (
				<div
					{...props}
					style={{
						...props.style,
						height: "42px",
						width: "100%",
						backgroundColor: "transparent",
						position: "relative",
						top: "42px",
						zIndex: "20",
					}}
				>
					{children}
				</div>
			)}
			renderThumb={({ props }) => (
				<div
					{...props}
					// style={{
					// 	...props.style,
					// 	height: "52px",
					// 	width: "52px",
					// 	backgroundColor: "#006eff",
					// }}
				/>
			)}
		/>
	);
};
