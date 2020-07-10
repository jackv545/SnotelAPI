import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Navigation from './Navigation';
import Home from './Home';
import WorldMap from './WorldMap';
import States from './States';
import StateInfo from './StateInfo';
import StationInfo from './StationInfo';
import Footer from './Footer';

export default function Snotel(props) {
    return (
        <>
            <Navigation
                prefersDarkMode={props.prefersDarkMode}
                darkModeButton={props.darkModeButton}
            />
            <Switch>
                <Route exact path="/">
                    <Home/>
                </Route>
                <Route exact path="/location">
                    <WorldMap prefersDarkMode={props.prefersDarkMode}/>
                </Route>
                <Route path="/location/:stationUrlName">
                    <StationInfo prefersDarkMode={props.prefersDarkMode}/>
                </Route>
                <Route exact path="/explore">
                    <States/>
                </Route>
                <Route path="/explore/:state">
                    <StateInfo/>
                </Route>
            </Switch>
            <Footer prefersDarkMode={props.prefersDarkMode}/>
        </>
    );
}
