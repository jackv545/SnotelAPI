import React, { useState, useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';

import { sendServerRequestWithBody } from '../api/restfulAPI';
import Navigation from './Navigation';
import Home from './Home';
import WorldMap from './WorldMap';

export default function Snotel(props) {
    let history = useHistory();

    const [selectedStation, updateSelectedStationState] = useState(null);
    const [stations, setStations] = useState([]);

    const setSelectedStation = (station) => {
        updateSelectedStationState(station);

        if (station === null) {
            history.push('/');
        } else {
            history.push(`/${station.name.replace(/[\W_]/g, '')}`);
        }
    }

    useEffect(() => {
        sendServerRequestWithBody({ requestType: 'stations', requestVersion: 1 })
            .then((response => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    setStations(response.body.stations)
                } else {
                    console.error("Response code: ", response.statusCode, response.statusText);
                }
            }));
    }, []);

    return (
        <>
            <Navigation
                prefersDarkMode={props.prefersDarkMode}
                darkModeButton={props.darkModeButton}
                selectedStation={selectedStation}
                setSelectedStation={setSelectedStation}
                stations={stations} theme={props.theme}
            />
            <Switch>
                <Route path="/worldMap">
                    <WorldMap prefersDarkMode={props.prefersDarkMode} />
                </Route>
                <Route path="/">
                    <Home
                        theme={props.theme}
                        prefersDarkMode={props.prefersDarkMode}
                        selectedStation={selectedStation}
                        setSelectedStation={setSelectedStation}
                    />
                </Route>
            </Switch>
        </>
    );
}
