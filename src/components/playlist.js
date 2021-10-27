import "./playlist.scss";

import React, { Component } from "react";

import PlaylistItem from "./playlistItem";
import axios from "axios";
import { drop } from "../player/drag";
import { parseYoutubeUrl } from "../utility/youtube";
import playlistCreator from "../utility/playlistCreator";
import { uuid } from "uuidv4";

class Playlist extends Component {
	state = {
		drag: false,
		dragClassName: "",
		playlist: [],
	};

	dropRef = React.createRef();
	isSameArray = (arrayOne, arrayTwo) => {
		return (
			arrayOne.length === arrayTwo.length &&
			arrayOne.every(
				(o, i) =>
					Object.keys(o).length === Object.keys(arrayTwo[i]).length &&
					Object.keys(o).every((k) => o[k] === arrayTwo[i][k])
			)
		);
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.sortType !== this.props.sortType) {
			if (this.props.sortType !== "playlist") {
				this.loadReviews();
			} else {
				this.loadPlaylist();
			}
		}

		const isSameArray = this.isSameArray(prevProps.playlist, this.props.playlist);
		if (!isSameArray) {
			// this.loadPlaylist()
			this.setState({ playlist: this.props.playlist });
		}
	}

	componentDidMount() {
		if (this.props.sortType === "playlist") {
			this.loadPlaylist();
		} else {
			this.loadReviews();
		}

		let div = this.dropRef.current;
		if (div) {
			div.addEventListener("dragstart", this.handleTextDropStart);
			div.addEventListener("drop", this.handleTextDropEnd);
			//==
			div.addEventListener("dragenter", this.handleDragIn);
			div.addEventListener("dragleave", this.handleDragOut);
			div.addEventListener("dragover", this.handleDrag);
			div.addEventListener("drop", this.handleFileDrop);
		}

		document.body.addEventListener(
			"keydown",
			(e) => {
				e = e || window.event;
				var key = e.which || e.keyCode; // keyCode detection
				var ctrl = e.ctrlKey ? e.ctrlKey : key === 17 ? true : false; // ctrl detection
				if (key === 86 && ctrl) {
					this.handleCopyFromClipBoard();
				}
			},
			false
		);
	}

	componentWillUnmount() {
		let div = this.dropRef.current;
		if (!div) return;

		div.removeEventListener("dragstart", this.handleTextDropStart);
		div.removeEventListener("drop", this.handleTextDropEnd);
		//==
		div.removeEventListener("dragenter", this.handleDragIn);
		div.removeEventListener("dragleave", this.handleDragOut);
		div.removeEventListener("dragover", this.handleDrag);
		div.removeEventListener("drop", this.handleFileDrop);
	}

	handleTextDropStart = (event) => {
		//  if (this.props.sortType !== 'playlist')
		//    return this.setState({ drag: true, dragClassName: 'wrong-list' })

		if (event.dataTransfer) {
			// Note: textData is empty here for Safari and Google Chrome :(
			event.dataTransfer.getData("Text");
			let newText = "..."; //Modify the data being dragged BEFORE it is dropped.
			event.dataTransfer.setData("Text", newText);
		}
	};

	getMetadata = async (url) => {
		const videoUrl = url;
		const requestUrl = `http://youtube.com/oembed?url=${videoUrl}&format=json`;
		const result = await axios.get(requestUrl);
		return result.data;
	};

	handleCopyFromClipBoard = async () => {
		const videoURL = await navigator.clipboard?.readText();

		let playlistItem = {
			name: videoURL,
			path: videoURL,
			type: "external",
			id: uuid(),
		};

		if (parseYoutubeUrl(videoURL)) {
			const videoInfo = await this.getMetadata(videoURL);
			if (videoInfo) {
				playlistItem = {
					name: videoInfo.title,
					path: videoURL,
					type: "video/external",
					id: uuid(),
					author: videoInfo.author_name,
					source: videoInfo.provider_name,
				};
			}
		}

		playlistCreator.loadVideo([playlistItem]);
		this.props.setPlaylist(
			{
				playlist: playlistCreator.entries,
			},
			false,
			() => {
				this.notify({
					title: "Notification",
					message: "New Item Added to Playlist",
				});
			}
		);
	};

	handleTextDropEnd = async (event) => {
		if (event.dataTransfer) {
			let videoURL = event.dataTransfer.getData("Text");
			if (!videoURL) return;

			let playlistItem = {
				name: videoURL,
				path: videoURL,
				type: "external",
				id: uuid(),
			};

			if (parseYoutubeUrl(videoURL)) {
				const videoInfo = await this.getMetadata(videoURL);
				if (videoInfo) {
					playlistItem = {
						name: videoInfo.title,
						path: videoURL,
						type: "video/external",
						id: uuid(),
						author: videoInfo.author_name,
						source: videoInfo.provider_name,
					};
				}
			}

			playlistCreator.loadVideo([playlistItem]);
			this.props.setPlaylist(
				{
					playlist: playlistCreator.entries,
				},
				false,
				() => {
					console.log("🚀 ==> playlistCreator.entries", playlistCreator.entries);
				}
			);

			this.setState({
				dragClassName: "",
			});
		} else if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
		return false;
		//else ... Some (less modern) browsers don't support dataTransfer objects.
		// =======================

		// Use stopPropagation and cancelBubble to prevent the browser
		// from performing the default `drop` action for this element.
	};

	//========================================
	handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	handleDragIn = (e) => {
		e.preventDefault();
		e.stopPropagation();
		this.dragCounter++;
		//  if (this.props.sortType !== 'playlist')
		//    return this.setState({ drag: true, dragClassName: 'wrong-list' })
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			this.setState({ drag: true, dragClassName: "on-drag" });
		}
	};

	handleDragOut = (e) => {
		e.preventDefault();
		e.stopPropagation();
		this.dragCounter--;
		this.setState({ dragClassName: "" });
		if (this.dragCounter === 0) {
			this.setState({ drag: false, dragClassName: "" });
		}
	};

	handleFileDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		this.setState({ drag: false, dragClassName: "" });
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			// this.props.handleFileDrop(e.dataTransfer.files)
			drop([...e.dataTransfer.items], playlistCreator.loadVideo);
			e.dataTransfer.clearData();
			this.dragCounter = 0;
			this.props.setPlaylist(playlistCreator.entries, false, () => {});
		}
	};
	//========================================

	loadReviews = () => {
		playlistCreator.loadReviews(this.props.sortType);
		this.props.setPlaylist(playlistCreator.entries, true);
	};

	loadPlaylist = () => {
		playlistCreator.loadPlaylistFromStorage();
		this.props.setPlaylist(playlistCreator.entries, false);
	};

	render() {
		const refs = this.props.playlist.reduce((acc, file) => {
			acc[file.id] = React.createRef();
			return acc;
		}, {});

		const scrollIntoView = (id) => {
			if (!refs) return;

			refs[id].current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		};
		return (
			<ol
				className={`playlist ${this.props.hidePlaylist} ${this.state.dragClassName}`}
				ref={this.props.sortType === "playlist" ? this.dropRef : null}
			>
				{this.state.playlist.map((file, index) => {
					const isSeparator = file.type === "separator";
					const category = file.type === "separator" ? file.name : null;
					let title = isSeparator ? file.name : file.split;
					let isDisabled = isSeparator ? true : false;
					let durationTextContent = isSeparator ? " " : "--:--";
					let fileSeparator = isSeparator ? "file-separator" : "";
					return (
						<PlaylistItem
							sortType={this.props.sortType}
							key={file.id}
							category={category}
							ref={refs[file.id]}
							scrollIntoView={scrollIntoView}
							title={title}
							durationTextContent={durationTextContent}
							fileSeparator={fileSeparator}
							file={file}
							currentlyPlaying={this.props.currentlyPlaying}
							setCurrentlyPlaying={this.props.setCurrentlyPlaying}
							setCurrentCategory={this.props.setCurrentCategory}
							isDisabled={isDisabled}
						></PlaylistItem>
					);
					// file.e = LI
				})}
			</ol>
		);
	}
}

export default Playlist;
