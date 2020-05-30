import React, { useState, useEffect } from 'react';

import { Container } from '@material-ui/core';

import StationMap from './StationMap';
import { sendServerRequestWithBody } from '../api/restfulAPI';

export default function WorldMap(props) {
    const [stations, setStations] = useState([]);

    useEffect(() => {
        sendServerRequestWithBody({requestType: 'stations', requestVersion: 1})
        .then((response => {
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                setStations(response.body.stations)
            } else {
                console.error("Response code: ", response.statusCode, response.statusText);
            }
        }));
    }, []);
    
    return(
        <Container maxWidth="md">
            <StationMap all stations={stations} prefersDarkMode={props.prefersDarkMode}/>
        </Container>
    );
}