import React, {Component} from 'react';
import PropTypes from "prop-types";
import ConfigWrapper from "../../../controller/ConfigWrapper";
import './Location.css'
const {locations} = ConfigWrapper.get();

class Location extends Component {
	
	static propTypes = {
		id: PropTypes.string.isRequired
	};
	
	render() {
		
		
		const ind = locations.findIndex(step => step.id === this.props.id);
		
		
		
		return (
			<img
				src={locations[ind].pathOnTablet}
				alt={this.props.id}/>
		);
	}
}

export default Location;