import "./style.scss";

import React from "react";
import { toMinutesSeconds } from "../../utility";
import {
	BookmarkAddIcon,
	BookmarkRemoveIcon,
	EditNoteIcon,
	MutedVolume,
	UnmutedVolume,
	PlayIcon,
	PauseIcon,
	NextIcon,
	BackIcon,
} from "../assets";

export default function Controls({
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
	bookmarkNote,
	handlePrevious,
	handleNext,
}) {
	return (
		<div className="controls">
			<div className="control-group">
				<button
					onClick={handlePlayPause}
					className="playback-buttons play_pause_btn"
				>
					<PlayIcon playing={playing} />
					<PauseIcon playing={playing} />
				</button>

				<span className="time">
					<span className="video_time">
						{toMinutesSeconds(currentTime, true)}
					</span>
					<span className="separator"> | </span>
					<span className="video_length">
						{toMinutesSeconds(totalDuration, true)}
					</span>
				</span>
				<button
					onClick={handlePrevious}
					className="playback-buttons"
					title="Play Previous Song (Ctrl + Shift + P or Command + Shift + P)"
				>
					<BackIcon />
				</button>

				<button
					onClick={handleNext}
					className="playback-buttons"
					title="Play Next Song (Ctrl + Shift + N or Command + Shift + N)"
				>
					<NextIcon />
				</button>
				<button
					className="playback-buttons playback-speed"
					title="Playback Speed"
				>
					<div>{`${playbackRate} X`}</div>
				</button>
				<button
					onClick={() =>
						handlePlaybackRate.reduceSpeed(0.5)
					}
					className="playback-buttons rate-decrease"
					title="Decrease Speed"
				>
					<div>-</div>
				</button>
				<button
					onClick={() =>
						handlePlaybackRate.increaseSpeed(0.5)
					}
					className="playback-buttons rate-increase"
					title="Increase Speed"
				>
					<div>+</div>
				</button>
				<button
					onClick={handleToggleMuted}
					className="playback-buttons mute_unmute_btn"
				>
					<UnmutedVolume
						className={muted ? "hide" : "svg_mute_unmute"}
					/>
					<MutedVolume
						className={muted ? "svg_mute_unmute" : "hide"}
					/>
				</button>

				<input
					type="range"
					className="volume_range"
					onChange={handleVolumeChange}
					value={volume}
					step={0.1}
					min={0}
					max={1}
				/>
			</div>
			<div className="bookmark-group">
				<button
					onClick={() => null}
					className="bookmark-button"
					style={{
						marginRight: "5px",
						border: "1px solid #f0f8ff",
					}}
					title="Remove this Bookmark"
				>
					<BookmarkRemoveIcon height="16" width="16" />
				</button>
				<button
					onClick={() => null}
					className="bookmark-button"
					style={{
						marginRight: "20px",
						background: "#f0f8ff ",
					}}
					title="Add a Bookmark"
				>
					<BookmarkAddIcon height="16" width="16" />
				</button>

				<div className="bookmark-note">
					<button className="bookmark-button">
						<EditNoteIcon height="16" width="16" />
					</button>
					{bookmarkNote ? (
						<span className="time">{bookmarkNote}</span>
					) : (
						<span className="time">
							write a short description for this
							bookmark..
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
