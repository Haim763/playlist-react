import React from 'react';
import './Loader.css';

export default (props) => {
    return (
        props.mini ?
            <div className="loader_small"></div>
            :
            <div className="loader_container">
                <div className="loader"></div>
            </ div>
    )
}