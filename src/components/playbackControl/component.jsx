import "./style.scss";

import React from "react";
import { toMinutesSeconds } from "../../utility";

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
				<button onClick={handlePlayPause} className="playback-buttons play_pause_btn">
					<svg
						className={!playing ? "svg_play_pause" : "hide"}
						viewBox="0 0 232.153 232.153"
					>
						<path
							d="M203.791,99.628L49.307,2.294c-4.567-2.719-10.238-2.266-14.521-2.266
c-17.132,0-17.056,13.227-17.056,16.578v198.94c0,2.833-0.075,16.579,17.056,16.579c4.283,0,9.955,0.451,14.521-2.267
l154.483-97.333c12.68-7.545,10.489-16.449,10.489-16.449S216.471,107.172,203.791,99.628z"
						/>
					</svg>

					<svg
						className={!playing ? "hide" : "svg_play_pause"}
						viewBox="0 0 232.153 232.153"
					>
						<path
							d="M80.543,0H35.797c-9.885,0-17.898,8.014-17.898,17.898v196.883
		c0,9.885,8.013,17.898,17.898,17.898h44.746c9.885,0,17.898-8.013,17.898-17.898V17.898C98.44,8.014,90.427,0,80.543,0z M196.882,0
		h-44.746c-9.886,0-17.899,8.014-17.899,17.898v196.883c0,9.885,8.013,17.898,17.899,17.898h44.746
		c9.885,0,17.898-8.013,17.898-17.898V17.898C214.781,8.014,206.767,0,196.882,0z"
						/>
					</svg>
				</button>

				<span className="time">
					<span className="video_time">{toMinutesSeconds(currentTime, true)}</span>
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
					<svg width="22" height="22" viewBox="0 0 32 32">
						<path d="M29.46,5.11a1,1,0,0,0-1,.08L18,12.63V6a1,1,0,0,0-1.58-.81l-14,10a1,1,0,0,0,0,1.63l14,10A1,1,0,0,0,18,26V19.37l10.42,7.44A1,1,0,0,0,30,26V6A1,1,0,0,0,29.46,5.11Z"></path>
					</svg>
				</button>

				<button
					onClick={handleNext}
					className="playback-buttons"
					title="Play Next Song (Ctrl + Shift + N or Command + Shift + N)"
				>
					<svg width="22" height="22" viewBox="0 0 24 24">
						<path
							d="M22.2,10.6l-9-5.4c-1-0.6-2.2,0.2-2.2,1.4v3.2L3.2,5.2C2.2,4.6,1,5.4,1,6.6v10.7c0,1.2,1.2,2,2.2,1.4l7.8-4.6   v3.2c0,1.2,1.2,2,2.2,1.4l9-5.4C23.3,12.8,23.3,11.2,22.2,10.6z"
							id="next"
						></path>
					</svg>
				</button>
				<button className="playback-buttons playback-speed" title="Playback Speed">
					<div>{`${playbackRate} X`}</div>
				</button>
				<button
					onClick={() => handlePlaybackRate.reduceSpeed(0.5)}
					className="playback-buttons rate-decrease"
					title="Decrease Speed"
				>
					<div>-</div>
				</button>
				<button
					onClick={() => handlePlaybackRate.increaseSpeed(0.5)}
					className="playback-buttons rate-increase"
					title="Increase Speed"
				>
					<div>+</div>
				</button>
				<button
					onClick={handleToggleMuted}
					className="playback-buttons mute_unmute_btn"
				>
					<svg className={muted ? "hide" : "svg_mute_unmute"} viewBox="0 0 20 20">
						<path
							fill="none"
							d="M9.344,2.593c-0.253-0.104-0.547-0.045-0.743,0.15L4.486,6.887H1.313c-0.377,0-0.681,0.305-0.681,0.681v4.916c0,0.377,0.304,0.681,0.681,0.681h3.154l4.137,4.142c0.13,0.132,0.304,0.201,0.482,0.201c0.088,0,0.176-0.017,0.261-0.052c0.254-0.105,0.42-0.354,0.42-0.629L9.765,3.224C9.765,2.947,9.599,2.699,9.344,2.593z M5.233,12.003c-0.128-0.127-0.302-0.2-0.483-0.2H1.994V8.249h2.774c0.182,0,0.355-0.072,0.483-0.201l3.151-3.173l0.001,10.305L5.233,12.003z"
						/>
						<path
							fill="none"
							d="M16.434,10.007c0-2.553-1.518-4.853-3.869-5.858C12.223,4,11.821,4.16,11.672,4.506c-0.148,0.346,0.013,0.746,0.359,0.894c1.846,0.793,3.041,2.6,3.041,4.608c0,1.997-1.188,3.799-3.025,4.592c-0.346,0.149-0.505,0.551-0.356,0.895c0.112,0.258,0.362,0.411,0.625,0.411c0.091,0,0.181-0.017,0.269-0.056C14.922,14.843,16.434,12.548,16.434,10.007z"
						/>
						<path
							fill="none"
							d="M13.418,10.005c0-1.349-0.802-2.559-2.042-3.086c-0.346-0.144-0.745,0.015-0.894,0.362c-0.146,0.346,0.016,0.745,0.362,0.893c0.737,0.312,1.212,1.031,1.212,1.832c0,0.792-0.471,1.509-1.2,1.825c-0.345,0.149-0.504,0.551-0.352,0.895c0.112,0.257,0.362,0.41,0.625,0.41c0.091,0,0.181-0.017,0.27-0.057C12.625,12.545,13.418,11.339,13.418,10.005z"
						/>
						<path
							fill="none"
							d="M13.724,1.453c-0.345-0.15-0.746,0.012-0.895,0.358c-0.148,0.346,0.013,0.745,0.358,0.894c2.928,1.256,4.819,4.122,4.819,7.303c0,3.171-1.886,6.031-4.802,7.289c-0.346,0.149-0.505,0.55-0.356,0.894c0.112,0.258,0.362,0.412,0.626,0.412c0.09,0,0.181-0.019,0.269-0.056c3.419-1.474,5.626-4.826,5.626-8.54C19.368,6.282,17.152,2.923,13.724,1.453z"
						/>
					</svg>

					<svg className={muted ? "svg_mute_unmute" : "hide"} viewBox="0 0 20 20">
						<path
							fill="none"
							d="M3.401,13.367h0.959l1.56-1.56H4.181v-4.07h3.177c0.207,0,0.405-0.084,0.553-0.23l3.608-3.633V6.21l1.56-1.56V1.983c0-0.315-0.192-0.602-0.485-0.721c-0.29-0.122-0.624-0.055-0.85,0.171L7.032,6.178h-3.63c-0.433,0-0.78,0.349-0.78,0.78v5.629C2.621,13.018,2.968,13.367,3.401,13.367z"
						/>
						<path
							fill="none"
							d="M11.519,15.674l-2.416-2.418L8,14.358l3.745,3.753c0.149,0.149,0.349,0.228,0.553,0.228c0.1,0,0.201-0.019,0.297-0.059c0.291-0.12,0.483-0.405,0.483-0.72V9.28l-1.56,1.56V15.674z"
						/>
						<path
							fill="none"
							d="M19.259,0.785c-0.167-0.168-0.387-0.25-0.606-0.25s-0.438,0.082-0.606,0.25l-4.968,4.968l-1.56,1.56l-4.496,4.494l-1.56,1.56L0.83,18.001c-0.335,0.335-0.335,0.877,0,1.213c0.167,0.167,0.386,0.251,0.606,0.251c0.22,0,0.439-0.084,0.606-0.251l5.407-5.407l1.105-1.104l2.965-2.966l1.56-1.56l6.18-6.181C19.594,1.664,19.594,1.12,19.259,0.785z"
						/>
					</svg>
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
			<div className="bookmark-description">
				<span>
					{bookmarkNote
						? bookmarkNote
						: "click to write a description for this bookmark"}
				</span>
			</div>
		</div>
	);
}
