import "./playlistItem.scss";

import React, { useEffect } from "react";

export default function PlaylistItem({
	file,
	currentlyPlaying,
	title,
	setCurrentlyPlaying,
	durationTextContent,
	ref,
	fileSeparator,
	category,
	sortType,
	setCurrentCategory,
	scrollIntoView,
	isDisabled,
}) {
	// const scroll = () => file.id === currentlyPlaying && scrollIntoView(file.id)
	// useEffect(() => {
	//     scroll()
	//     console.log('🚀 ', file.id, '===', currentlyPlaying)
	// })
	useEffect(() => {
		if (file.id === currentlyPlaying) {
			let objControl = document.getElementById(file.id);

			objControl?.scrollIntoView();
		}
	}, [currentlyPlaying, file.id]);

	const CustomTag = `${fileSeparator ? "div" : "li"}`;
	return (
		<CustomTag
			ref={ref}
			//  file={file}
			key={file.id}
			id={file.id}
			className={`${fileSeparator} ${file.id === currentlyPlaying ? "active" : ""}`}
			title={title}
			disabled={isDisabled}
			onClick={(e) => {
				setCurrentlyPlaying(file.id, () => {});
			}}>
			{sortType !== "playlist" && category && (
				<label className="category-checkbox">
					<input
						className="category"
						type="checkbox"
						id={file.id}
						name="category"
						value={category}
						onClick={(e) => {
							const value = e.target.value;
							const action = e.target.checked ? true : false;

							setCurrentCategory(value, action);
						}}
					/>
					<i></i>
					<span></span>
				</label>
			)}
			<span className="video-title">{`${file.name}` || `${file.src}`}</span>
			<span className="video-duration">{durationTextContent}</span>
		</CustomTag>
	);
}
