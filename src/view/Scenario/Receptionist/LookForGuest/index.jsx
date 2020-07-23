import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from "prop-types";
import './LookForGuest.css';
import {comAction} from "../../../../redux/actions/CommunicationAction";
import { viewAction } from '../../../../redux/actions/ViewAction';
import ComponentTitle from "../../../Global/reusableComponent/ComponentTitle";
import {Doughnut} from 'react-chartjs-2'

class LookForGuest extends Component {
	
	static propTypes = {
		time: PropTypes.number.isRequired
	};
	
	constructor(props) {
		super(props);
		this.state = {
			remainingTime: this.props.time,
			elapsedTime: 0
		}
	}
	
	componentDidMount() {
		const self = this;
		const intervalId = setInterval(() => {
			self.setState(prev => {
				return {
					...prev,
					remainingTime: prev.remainingTime - 1,
					elapsedTime: prev.elapsedTime + 1
				}
			}, () => {
				if (self.state.remainingTime === 0) {
					clearInterval(intervalId);
					this.props.viewOk();
				}
			})
			
			
		}, 1000);
	}
	
	
	render() {
		
		let title = this.props.textToShow;
		const data = {
			labels: [
				"", ""
			],
			datasets: [{
				data: [this.props.time - this.state.elapsedTime, this.state.elapsedTime],
				backgroundColor: [
					'#12c4ff',
					'rgba(54,162,235,0)',
				],
				
			}]
		};
		
		const options = {
			elements: {
				arc: {
					borderWidth: 0
				},
			},
			legend: {
				display: false
			},
			tooltips: {
				enabled: false
			},
			responsive: true,
			scales: {xAxes: [{display: false,}], yAxes: [{display: false,}],},
			
			
		};
		const chart = <Doughnut data={data} options={options}/>;
		
		return (
			<div id="LookForGuest">
				<ComponentTitle>{title}</ComponentTitle>
				<div id="chart">
					<span className={"timer"}>{this.state.remainingTime}</span>
					{chart}
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {}
};

const mapDispatchToProps = (dispatch) => {
	return {
		viewOk: () => {
			dispatch({
				type: viewAction.getIndexCurrentAction.type
			});
			dispatch({
				type: comAction.dataJs.type,
				data: {status: 200}
			})
		}
	}
};


export default connect(mapStateToProps, mapDispatchToProps)(LookForGuest);