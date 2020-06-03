import React, { useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';

import Navigation from './Navigation';
import Home from './Home';
import WorldMap from './WorldMap';

export default function Snotel(props) {
    let history = useHistory();

    const [selectedStation, updateSelectedStationState] = useState(null);

    const setSelectedStation = (station) => {
        updateSelectedStationState(station);

        if (station === null) {
            history.push('/');
        } else {
            history.push(`/${station.name.replace(/[\W_]/g, '')}`);
        }
    }

    return (
        <>
            <Navigation
                prefersDarkMode={props.prefersDarkMode}
                darkModeButton={props.darkModeButton}
                selectedStation={selectedStation}
                setSelectedStation={setSelectedStation}
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
