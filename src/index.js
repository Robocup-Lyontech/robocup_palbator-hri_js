import 'core-js';
import 'core-js/es/set'
import 'core-js/es/map'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import QiWrapper from "./model/QiWrapper";
import ConfigWrapper from "./controller/ConfigWrapper";

/////
import SocketWrapper from './model/SocketWrapper';


async function initApp() {
	

	// Instantiate
const socket = new SocketWrapper();

	// const qi = await QiWrapper.createInstance();
	await ConfigWrapper.setConfigFromALMemory();
	
	const SocketBridge = require("./controller/SocketBridge").default;
	
	SocketBridge.initBridge();
	const App = require("./App").default;
	const Provider = require("react-redux").Provider;
	const getStore = require("./redux/Store").default;
	const Debug = require("./view/Debug/Debug").default;
	
	ReactDOM.render(<Provider store={getStore()}>
		<App/>
		{/* <Debug/> */}
	</Provider>, document.getElementById('root'));
	
	
}

initApp().then(() => {
	console.log("App Loaded")
	// const {apis: {tabletLM}} = ConfigWrapper.get();
	// QiWrapper.raise(tabletLM["tabletOperational"]["ALMemory"], {'time': Date.now()})

	
	
});


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
