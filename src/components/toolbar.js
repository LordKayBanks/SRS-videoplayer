import "./toolbar.scss";

import React, { useState, useContext } from "react";
import { ToolbarState } from "../App";
import Buttons from "./buttons";
import Playlist from "./playlist";
import SelectSortingOption from "./SortingOption";

export default function Toolbar({
	shufflePlaylist,
	notify,
	currentlyPlaying,
	setCurrentlyPlaying,
	playlist,
	setPlaylist,
	onSelectPlaylistItem = null,
	toggleRepeatMode,
	repeatMode,
	setCurrentCategory,
	trackingMode,
	setupTrackingMode,
	setupReviewMode,
	reviewMode,
	setSortType,
	sortType,
}) {
	// const [toolbarOpen, setToolbarOpen] = useState(true);
	const { toolbarOpen, setToolbarOpen } = useContext(ToolbarState);
	return (
		<div
			className={`toolbar ${
				toolbarOpen ? "toolbar-open" : "toolbar-hide"
			}`}
		>
			{toolbarOpen && (
				<SelectSortingOption
					setSortType={setSortType}
					setupReviewMode={setupReviewMode}
				/>
			)}
			<Playlist
				setCurrentCategory={setCurrentCategory}
				setPlaylist={setPlaylist}
				playlist={playlist}
				setCurrentlyPlaying={setCurrentlyPlaying}
				currentlyPlaying={currentlyPlaying}
				sortType={sortType}
				hidePlaylist={`${toolbarOpen ? "" : "hide-playlist"}`}
				notify={notify}
				onSelectPlaylistItem={onSelectPlaylistItem}
			></Playlist>
			{/*
			{toolbarOpen && (
				<input
					onKeyDown={onAddNewURL}
					id="external-link"
					type="text"
					className="external-link"
					placeholder="Paste link here...or drag and drop"
					name="text"
				/>
			)} */}
			<Buttons
				shufflePlaylist={shufflePlaylist}
				reviewMode={reviewMode}
				setupReviewMode={setupReviewMode}
				trackingMode={trackingMode}
				setupTrackingMode={setupTrackingMode}
				horizontalButtons={`${
					toolbarOpen ? "horizontal-buttons" : ""
				}`}
				boost={2}
				togglePToolbar={() => {
					setToolbarOpen(!toolbarOpen);
				}}
				toggleRepeatMode={toggleRepeatMode}
				repeatMode={repeatMode}
				changeBoost={() => {}}
			/>
		</div>
	);
}
