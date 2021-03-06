import React, {Component} from 'react';
import {comAction} from "../../../../redux/actions/CommunicationAction";
import {connect} from "react-redux";
import ComponentTitle from "../../../Global/reusableComponent/ComponentTitle";
import {SpeakableButton} from "../../../Global/reusableComponent/Button/SpeakableButton";
import PropTypes from 'prop-types'
import './AskOpenDoor.css'
import { viewAction } from '../../../../redux/actions/ViewAction';

const mapDispatchToProps = (dispatch) => {
	return {
		handleClick: () => {
			dispatch({
				type: viewAction.getIndexCurrentAction.type
			});
			dispatch({
				type: comAction.dataJs.type,
				data: {}
			})
		}
	}
};

const mapStateToProps = () => {
	return {}
};

class AskOpenDoor extends Component {
	
	static propTypes = {
		textToShow: PropTypes.shape({
			title: PropTypes.string.isRequired,
			description: PropTypes.arrayOf(PropTypes.string).isRequired
		})
	};
	
	render() {
		return (
			<div className={"AskOpenDoor"}>
				<ComponentTitle>{this.props.textToShow.title}</ComponentTitle>
				<div>
					
					<ul className="description">
						{this.props.textToShow.description.map(str =>
							<li>{str}</li>
						)}
					</ul>
					<div>
						<SpeakableButton
							onClick={this.props.handleClick}>Next</SpeakableButton>
					</div>
				</div>
			
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AskOpenDoor);