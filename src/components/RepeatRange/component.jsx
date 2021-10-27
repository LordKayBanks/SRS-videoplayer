import { Range, getTrackBackground, useThumbOverlap } from "react-range";
import React from "react";
import { toMinutesSeconds, convertToNearestX } from "../../utility";

const COLORS = ["#2467e6", "#ff0000", "#9CBCF8", "#ccc"];
const THUMB_SIZE = 32;

class RepeatRange extends React.Component {
	constructor(props) {
		super(props);
		this.state = { values: [50, 100], MIN: 0, MAX: 100, STEP: 10 };
		this.rangeRef = React.createRef();
		window.addEventListener("keydown", this.keyPressHandler);
	}

	componentDidMount() {
		this.setState(
			{
				...this.state,
				values: this.props.values,
				MAX: this.props.MAX,
				STEP: this.props.STEP,
			},
			this.triggerMarkRepaint
		);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.MAX !== this.props.MAX) {
			this.setState(
				{
					...this.state,
					values: this.props.values,
					MAX: this.props.MAX,
					STEP: this.props.STEP,
				},
				this.triggerMarkRepaint
			);
		}
	}

	// hack to properly render the grade line
	triggerMarkRepaint = () => {
		let element = document.querySelector(".playback-control");
		let width = element.offsetWidth;
		element.style.width = `${width + 1}px`;
		setTimeout(() => {
			width = element.offsetWidth;
			element.style.width = `${width - 1}px`;
		}, 100);
	};

	keyPressHandler = (e) => {
		const { key } = e;
		e.preventDefault();

		let {
			STEP,
			MAX,
			values: [valueMin, valueMax],
		} = this.state;

		if (key === "ArrowLeft") {
			let newMinLeft = Math.max(0, valueMin - STEP);
			newMinLeft = convertToNearestX(newMinLeft, STEP);
			this.setState({ values: [newMinLeft, valueMax] }, () =>
				this.props.handleReviewMode([newMinLeft, valueMax])
			);
			return;
		}

		if (key === "ArrowRight") {
			let newMinRight = Math.min(valueMax - STEP, valueMin + STEP);
			newMinRight = convertToNearestX(newMinRight, STEP);
			this.setState({ values: [newMinRight, valueMax] }, () =>
				this.props.handleReviewMode([newMinRight, valueMax])
			);
			return;
		}

		//===========
		if (key === "ArrowUp") {
			let newMaxLeft = Math.max(valueMin + STEP, valueMax - STEP);
			newMaxLeft = convertToNearestX(newMaxLeft, STEP);
			this.setState({ values: [valueMin, newMaxLeft] }, () =>
				this.props.handleReviewMode([valueMin, newMaxLeft])
			);
			return;
		}

		if (key === "ArrowDown") {
			let newMaxRight = Math.min(MAX, valueMax + STEP);
			newMaxRight = convertToNearestX(newMaxRight, STEP);
			this.setState({ values: [valueMin, newMaxRight] }, () =>
				this.props.handleReviewMode([valueMin, newMaxRight])
			);
			return;
		}
	};

	render() {
		const { values, MIN, MAX, STEP } = this.state;

		const renderMark = ({ props, index }) => (
			<div
				{...props}
				style={{
					...props.style,
					height: "16px",
					width: "5px",
					border: "1px solid black",
					backgroundColor: index * STEP < values[0] ? "#548BF4" : "#ccc",
				}}
			/>
		);
		const renderTrack = ({ props, children }) => (
			<div
				onMouseDown={props.onMouseDown}
				onTouchStart={props.onTouchStart}
				style={{
					...props.style,
					height: "36px",
					display: "flex",
					width: "100%",
				}}
			>
				<div
					ref={props.ref}
					style={{
						height: "5px",
						width: "100%",
						borderRadius: "4px",
						background: getTrackBackground({
							values: values,
							colors: COLORS,
							min: MIN,
							max: MAX,
							rtl: this.props.rtl,
						}),
						alignSelf: "center",
					}}
				>
					{children}
				</div>
			</div>
		);
		const renderThumb = ({ props, index, isDragged }) => (
			<div
				{...props}
				style={{
					...props.style,
					height: `${THUMB_SIZE}px`,
					width: `${THUMB_SIZE}px`,
					borderRadius: "4px",
					backgroundColor: "#FFF",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					boxShadow: "0px 2px 6px #AAA",
				}}
			>
				<ThumbLabel rangeRef={this.rangeRef.current} values={values} index={index} />
				<div
					style={{
						height: "16px",
						width: "5px",
						backgroundColor: isDragged ? "#548BF4" : "#CCC",
					}}
				/>
			</div>
		);
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					flexWrap: "wrap",
				}}
			>
				<Range
					ref={this.rangeRef}
					values={values}
					step={STEP}
					min={MIN}
					max={MAX}
					rtl={this.props.rtl}
					onChange={(values) => {
						this.props.handleReviewMode(values);
						this.setState({ values });
					}}
					renderMark={renderMark}
					renderTrack={renderTrack}
					renderThumb={renderThumb}
				/>
			</div>
		);
	}
}

export default RepeatRange;
function ThumbLabel({ rangeRef, values, index }) {
	const [labelValue, labelStyle] = useThumbOverlap(
		rangeRef,
		values,
		index,
		1,
		" - ",
		(value) => `${toMinutesSeconds(value, true)}`
	);
	return (
		<div
			data-label={index}
			style={{
				display: "block",
				position: "absolute",
				top: "-28px",
				color: "#fff",
				fontWeight: "bold",
				fontSize: "14px",
				fontFamily: "Arial,Helvetica Neue,Helvetica,sans-serif",
				padding: "4px",
				borderRadius: "4px",
				backgroundColor: "#548BF4",
				whiteSpace: "nowrap",
				...labelStyle,
			}}
		>
			{labelValue}
		</div>
	);
}
