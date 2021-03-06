import {viewAction} from "../actions/ViewAction";
import Logger from "../../dev/Logger";
import logConfig from '../../config/log'
import SocketWrapper from '../../model/SocketWrapper';

const INITIAL_STATE = {
	currentView: null,
	currentData: {
		textToShow: null,
		choices: []
	},
	componentVisibility: {
		timeBoard: viewAction.setComponentVisibility.state.visible
	}
	
};


const logger = new Logger(logConfig.reducer.view, "ViewReducer");
let currentIndex = 0;
const viewReducer = (state = INITIAL_STATE, action) => {

	const socket = new SocketWrapper();

	switch (action.type) {
		
		
		
		case viewAction.changeView.type:
			currentIndex=action.index
			
			state = {
				...state,
				currentView: action.view,
				currentData: action.data
			};
		break;

		case viewAction.getIndexCurrentAction.type:
			
			socket._type.emit('indexOfDataReceived',{
				dataType: action.dataType,
				data: currentIndex
			});

		break;
		
		case viewAction.setComponentVisibility.type :
			
			const {timeBoard,} = viewAction.setComponentVisibility.component;
			if ([timeBoard].includes(action.component)) {
				
				const {hidden, visible} = viewAction.setComponentVisibility.state;
				if ([hidden, visible].includes(action.state)) {
					
					if (action.component === timeBoard) {
						state = {
							...state,
							componentVisibility: {
								...state.componentVisibility,
								timeBoard: action.state
							}
						};
					} else {
					}
					
				} else {
					logger.warn("setComponentVisibility", "unknown component visibility state");
				}
				
			} else {
				logger.warn("setComponentVisibility", "unknown component");
			}
			
			break;
		
		default:
			break;
		
		
	}
	
	return state;
};

export {
	viewReducer
}