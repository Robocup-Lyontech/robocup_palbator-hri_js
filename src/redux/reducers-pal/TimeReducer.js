import {timeAction} from "../actions/TimeAction";
import debug from '../../config/log';
import Logger from "../../dev/Logger";
import Timer from "../../model/Timer";
import ConfigWrapper from "../../controller/ConfigWrapper";
import SocketWrapper from '../../model/SocketWrapper';


const logger = new Logger(debug.reducer.time, "TimeReducer");
const {apis: {generalManagerHRI}} = ConfigWrapper.get();

let i=0;

const init = (state, steps) => {
	
	
	state = {...state};
	
	
	const getDataFromJson = (jsonValue) => {
		
		return {
			name: jsonValue.name,
			eta: jsonValue.eta,
			id: jsonValue.id
		}
	};
	let order = 0;
	Object.keys(steps).forEach(key => {
		state.todoSteps.push({
			...getDataFromJson(steps[key]),
			order: order++
		});
	});
	
	state.allSteps = [...state.todoSteps];

	console.warn("State after init", state);
	
	return state
};


const DEFAULT_STATE = {
	// todo get only one list of steps with status incorporated
	currentStep: null,
	todoSteps: [],
	doneSteps: [],
	skippedSteps: [],
	allSteps: [],
	globalElapsedTime: 0,
	stepElapsedTime: 0,
	haveToReset: false
	
};

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function getDefaultState() {
	return clone(DEFAULT_STATE);
}


const INITIAL_STATE = init(getDefaultState(), []);

const possibleActionType = [];
Object.keys(timeAction).forEach(key => {
	possibleActionType.push(timeAction[key].type)
});


const timeReducer = (state = INITIAL_STATE, action) => {
	
	let clonedState = {...state}, stepIndex, todoSteps;
	const socket = new SocketWrapper();
	
	// Dont allow other reducer's action to interact with this reducer
	
	if (possibleActionType.includes(action.type)) {
		let doneSteps;
		let todoSteps;
		let currentStep;
		switch (action.type) {
			
			case timeAction.passSecond.type:
				
				if (action.globalElapsedTime !== undefined && action.timeFromLastEvent !== undefined) {
					logger.log(timeAction.passSecond.type, action.globalElapsedTime);
					
					
					clonedState = {
						...clonedState,
						globalElapsedTime: action.globalElapsedTime,
						stepElapsedTime: clonedState.stepElapsedTime + action.timeFromLastEvent
					};
					
				} else {
					logger.warn(timeAction.passSecond.type, "Care no action.globalElapsedTime");
				}
				
				
				break;
			
			case timeAction.resetStepsProgression.type:
				clonedState.haveToReset = action.state;
				break;
			
			case timeAction.currentStep.type:
				
			
				if (action.index !== undefined) {
					// console.log("HEY 1");
					
					console.log('current step cloned state : ',clonedState)
					
					const researchedStep = state.allSteps[action.index];
					

					stepIndex = clonedState.todoSteps.findIndex(step => step.id === researchedStep.id);
					
					// console.log("HEY 2", stepIndex);
					
					clonedState.stepElapsedTime = 0;
					
					todoSteps = [...state.todoSteps];
					const step = todoSteps.splice(stepIndex, 1)[0];
					
					// console.log("HEY 2.5", step);
					// if (clonedState.currentStep !== null) {
					// 	console.log("HEY 3");
					// 	todoSteps.push(clonedState.currentStep);
					// }
					
					clonedState = {
						...clonedState,
						currentStep: {
							...step
						},
						todoSteps: todoSteps
					};
					
					
					
				} else {
					logger.warn(timeAction.currentStep.type, "Care try to currentStep with an undefined step");
					
				}
				
				
				break;
			
			case timeAction.stepCompleted.type:
				
				doneSteps = [...clonedState.doneSteps];
				todoSteps = [...clonedState.todoSteps];
				currentStep = clonedState.currentStep;
				
				
				action.indexes.forEach(index => {
					const researchedStep = clonedState.allSteps[index];
					console.log(researchedStep)
					// const researchedStep = "findg1_wait";
					if (clonedState.currentStep.id === researchedStep.id) {
						currentStep = null;
					}
					
					const indexInTodo = todoSteps.findIndex(step => step.id === researchedStep.id);
					if (indexInTodo > -1) {
						todoSteps.splice(indexInTodo, 1);
					}
					doneSteps.push(researchedStep);
				});
				
				clonedState = {
					...clonedState,
					currentStep: currentStep,
					todoSteps: todoSteps,
					doneSteps: doneSteps,
				};
				console.log('step completed cloned state : ',clonedState)
				
				break;
			
			case timeAction.stepSkipped.type:
				// action.index
				doneSteps = [...clonedState.doneSteps];
				currentStep = clonedState.currentStep;
				action.indexes.forEach(index => {
					const researchedStep = clonedState.allSteps[index];
					if (clonedState.currentStep.id === researchedStep.id) {
						currentStep = null;
					}
					doneSteps.push(clonedState.allSteps[index]);
				});
				
				clonedState = {
					...clonedState,
					currentStep: currentStep,
					doneSteps: doneSteps,
				};
				
				
				break;
			
			case timeAction.timerState.type:
				
				const {on, off} = generalManagerHRI.timerState.state;
				
				if ([on, off].includes(action.state)) {
					switch (action.state) {
						case on:
							Timer.startTimer();
							break;
						
						case off:
							Timer.stopTimer();
							break;
						
						
						default:
							break
					}
				} else {
					logger.warn("ToggleTimer", "Unknown ALMstate for timerState")
				}
				
				break;
			
			case timeAction.replaceAllSteps.type:
				
					clonedState = init(getDefaultState(), []);
					console.log(clonedState)
					i=0

				break;

				case timeAction.putOneStep.type:

				console.log('ON RENTRE DANS PUTONESTEP')
				let stepAlreadyExisting=0
				if (action.steps.length !== undefined) {
					
					clonedState.todoSteps.forEach(step => {
						let a = JSON.stringify(step)
						let b = JSON.stringify(action.steps[0])
						if(a === b){
							stepAlreadyExisting = 1;
						}
					})

					if(clonedState.currentStep === null && i === 0) {
						clonedState = init(getDefaultState(), action.steps);
						i=1;
					}
					else{
						action.steps.forEach(step => {
							if(stepAlreadyExisting === 0){
								if(step.order !== 0) clonedState.todoSteps.push(step)
							clonedState.allSteps.push(step)
							}
						});
					}

				}
				
				break;
			
			
			default:
				break;
		}
		
	}
	
	
	return clonedState;
};

export {
	timeReducer
}

