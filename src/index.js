import "./index.scss";

import App from "./App";
import React from "react";
import { keepTrackOfReviews } from "./utility/startup";
import { render } from "react-dom";
import setupInitialSeed from "./utility/seedData.js";

// ===============================
// import './player/context'
// import './player/boost'
// import './storage.js'
// import './keyboard.js'

// setupInitialSeed({ isOnline: false });
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
	setupInitialSeed({ isOnline: true });
} else {
	setupInitialSeed({ isOnline: false });
}

keepTrackOfReviews();
// ===============================
const container = document.getElementById("root");
render(<App />, container);
