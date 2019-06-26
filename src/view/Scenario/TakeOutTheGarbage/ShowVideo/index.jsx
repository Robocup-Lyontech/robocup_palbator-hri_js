import React, {Component} from 'react';
import ComponentTitle from "../../../Global/reusableComponent/ComponentTitle";
import PropTypes from 'prop-types'
import './ShowVideo.css'
import {SpeakableButton} from "../../../Global/reusableComponent/Button/SpeakableButton";
import {comAction} from "../../../../redux/actions/CommunicationAction";
import {connect} from "react-redux";

class ShowVideo extends Component {
	
	static propTypes = {
		textToShow: PropTypes.shape({
			title: PropTypes.string.isRequired,
			description: PropTypes.arrayOf(PropTypes.string).isRequired
		}),
		video: PropTypes.object.isRequired,
	};
	
	
	render() {
		const textToShow = this.props.textToShow || {
			title: "Please reproduce the videos",
			description: ["A", "B", "C", "D"]
		};
		return (
			<div className={"ShowVideo"}>
				<ComponentTitle>{textToShow.title}</ComponentTitle>
				<SpeakableButton onClick={this.props.viewOk}>I'm done</SpeakableButton>
				<div>
					<div className={"video"}>
						<video autoPlay loop muted
					            src={this.props.video['pathOnTablet']}/>
					</div>
					
					<ol className={"description"}
					    id="steps">{textToShow.description.map(str =>
						<li>{str}</li>)}</ol>
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
				type: comAction.dataJs.type,
				data: {status: 200}
			})
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowVideo);