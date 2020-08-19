import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Navigation from './Navigation';
import Home from './Home';
import WorldMap from './WorldMap';
import States from './States';
import StateInfo from './stateInfo/StateInfo';
import StationInfo from './StationInfo';
import Contact from './margins/Contact';
import Footer from './margins/Footer';
import PageNotFound from './margins/PageNotFound';

export default function Routes(props) {
    return (
        <>
            <Navigation
                prefersDarkMode={props.prefersDarkMode}
                darkModeButton={props.darkModeButton}
                setDarkModeFocus={props.setDarkModeFocus}
            />
            <Switch>
                <Route exact path="/">
                    <Home prefersDarkMode={props.prefersDarkMode}/>
                </Route>
                <Route exact path="/contact">
                    <Contact prefersDarkMode={props.prefersDarkMode}/>
                </Route>
                <Route exact path="/map/:state?">
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
                <Route path="*">
                    <PageNotFound/>
                </Route>
            </Switch>
            <Footer prefersDarkMode={props.prefersDarkMode}/>
        </>
    );
}
