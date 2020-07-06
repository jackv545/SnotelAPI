import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Navigation from './Navigation';
import Home from './Home';
import WorldMap from './WorldMap';
import States from './States';
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
                <Route path="/worldMap">
                    <WorldMap prefersDarkMode={props.prefersDarkMode}/>
                </Route>
                <Route path="/explore">
                    <States/>
                </Route>
                <Route exact path="/">
                    <Home/>
                </Route>
                <Route path="/:stationUrlName">
                    <StationInfo prefersDarkMode={props.prefersDarkMode}/>
                </Route>
            </Switch>
            <Footer prefersDarkMode={props.prefersDarkMode}/>
        </>
    );
}
