import "./buttons.scss";

import React from "react";

export default function Buttons({
	shufflePlaylist,
	trackingMode,
	setupTrackingMode,
	setupReviewMode,
	reviewMode,
	horizontalButtons,
	boost = 3,
	toggleRepeatMode,
	repeatMode,
	togglePToolbar,
	changeBoost = () => {},
}) {
	const changeReviewMode = (e) => {
		if (reviewMode === "active") {
			setupReviewMode({ loopCurrentSplit: true });
		} else if (reviewMode === "loop") {
			setupReviewMode({ activate: false });
		} else if (reviewMode === "inactive") {
			setupReviewMode({ activate: true });
		}
	};
	return (
		<div className={`buttons ${horizontalButtons}`}>
			<input
				onChange={togglePToolbar}
				type="checkbox"
				id="p-button"
				title="Toggle Playlist (Ctrl + P or Command + P)"
			/>

			<label htmlFor="p-button" id="p-button-view">
				<svg width="22" height="22" viewBox="0 0 22 22">
					<rect width="16" height="2" x="3" y="3"></rect>
					<rect width="16" height="2" x="3" y="9"></rect>
					<rect width="16" height="2" x="3" y="15"></rect>
				</svg>
			</label>

			<label
				onClick={shufflePlaylist}
				className="shuffle"
				title="Shuffle Playlist"
			>
				<svg width="14" height="14" viewBox="0 0 16 16">
					<path d="M6.6,5.2 L1.4,0 L0,1.4 L5.2,6.6 L6.6,5.2 L6.6,5.2 Z M10.5,0 L12.5,2 L0,14.6 L1.4,16 L14,3.5 L16,5.5 L16,0 L10.5,0 L10.5,0 Z M10.8,9.4 L9.4,10.8 L12.5,13.9 L10.5,15.9 L16,15.9 L16,10.4 L14,12.4 L10.8,9.4 L10.8,9.4 Z"></path>
				</svg>
			</label>

			<label
				onClick={setupTrackingMode}
				id="trackingMode"
				className={`tracking-btn-${trackingMode}`}
				title="Tracking Mode"
			>
				<svg width="22" height="22" viewBox="0 0 48 48">
					<text
						x="50%"
						y="50%"
						alignmentBaseline="middle"
						textAnchor="middle"
					>
						T
					</text>
				</svg>
			</label>

			<label
				onClick={changeReviewMode}
				className={`review-btn-${reviewMode}`}
				id="reviewMode"
				data-mode="inactive"
				title="Review Mode"
			>
				<svg width="22" height="22" viewBox="0 0 48 48">
					<text
						x="50%"
						y="50%"
						alignmentBaseline="middle"
						textAnchor="middle"
					>
						R
					</text>
				</svg>
			</label>

			<label
				onClick={toggleRepeatMode}
				className={`repeat ${
					repeatMode !== "no-repeat" ? "active" : ""
				}`}
				title="Repeat Mode: no repeat, repeat one, repeat all"
			>
				<svg width="22" height="22" viewBox="0 0 48 48">
					{repeatMode === "repeat-one" ? (
						<path d="M14 14h20v6l8-8-8-8v6H10v12h4v-8zm20 20H14v-6l-8 8 8 8v-6h24V26h-4v8zm-8-4V18h-2l-4 2v2h3v8h3z"></path>
					) : (
						<path d="M14 14h20v6l8-8-8-8v6H10v12h4v-8zm20 20H14v-6l-8 8 8 8v-6h24V26h-4v8z"></path>
					)}
				</svg>
			</label>

			<label
				onClick={changeBoost}
				className="boost"
				data-mode="3b"
				title="Adjust player's volume boost (2B [default], 3B, 4B) (Ctrl + B or Command + B)"
			>
				<svg width="22" height="22" viewBox="0 0 48 48">
					<text
						x="50%"
						y="50%"
						alignmentBaseline="middle"
						textAnchor="middle"
					>
						{`${boost}B`}
					</text>
				</svg>
			</label>
		</div>
	);
}
