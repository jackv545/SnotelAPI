import React, { Component } from 'react';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import L from 'leaflet';
import { Map, Marker, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import './LeafletCluster.css';
import { sendServerRequestWithBody } from '../api/restfulAPI'

import { withStyles } from '@material-ui/core/styles';

const useStyles = (theme) => ({
    map: {
        zIndex: 0,
        height: 500,
    },
    allStationMap: {
        zIndex: 0,
        marginTop: theme.spacing(1)
    }
});

const tileLayer = (prefersDarkMode) => {
    const tileURL = prefersDarkMode 
        ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    return ( <TileLayer url={tileURL}/> );
}

const icon = (prefersDarkMode, selected) => {
    let markerType = prefersDarkMode ? 'secondary' : 'primary';

    if(selected) {
        markerType = markerType.concat('-selected');
    }

    return (
        new L.icon({
            iconUrl: require(`../images/map-marker-${markerType}.png`),
            iconAnchor: [18, 34],
            popupAnchor: [0, -32],
            shadowUrl: null
        })
    );
}

const mapProps = {
    attributionControl: false
}

class StationMap extends Component {
    createCluster = cluster => {
        return L.divIcon({
            html: `<span>${cluster.getChildCount()}</span>`,
            className: `marker-cluster ${this.props.prefersDarkMode ? 'dark' : 'light'}`,
            iconSize: L.point(40, 40, true),
        });
    }

    onMarkerClick = (name) => {
        this.props.setStationSelected(true);
        this.props.setSelectedStationMarker(null);
        sendServerRequestWithBody({requestType: 'stations', requestVersion: 1, searchField: 'name', searchTerm: name})
        .then((response => {
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                this.props.setSelectedStationMarker(response.body.stations[0]);
            } else {
                console.error("Response code: ", response.statusCode, response.statusText);
            }
        }));
    }

    marker = (lat, lng, name, prefersDarkMode, key='1') => {
        let selected = false;
        if(this.props.selectedStationMarker !== null) {
            selected = key === this.props.selectedStationMarker.triplet;
        }
        
        return(
            <Marker 
                icon={icon(prefersDarkMode, selected)} 
                position={[lat, lng]} key={key}
                onClick={key === '1' ? null : () => this.onMarkerClick(name)}
            />
        );
    }

    singleMarker = (lat, lng, prefersDarkMode) => {
        return(
            <Marker 
                icon={icon(prefersDarkMode, false)} 
                position={[lat, lng]} interactive={false}
            />
        );
    }

    allStationMap = () => {
        const { classes } = this.props;

        return(
            <Map
                bounds={[[70.37, -164.29], [32.92, -103.79]]}
                {...mapProps} className={`${classes.map} ${classes.allStationMap}`}
            >
                {tileLayer(this.props.prefersDarkMode)}
                <MarkerClusterGroup
                    iconCreateFunction={this.createCluster}
                    showCoverageOnHover={false}
                    maxClusterRadius={70}
                >
                    {this.props.stations.map((station) => (
                        this.marker(station.lat, station.lng, station.name, 
                            this.props.prefersDarkMode, station.triplet)
                    ))}
                </MarkerClusterGroup>
            </Map> 
        );
    }

    singleStationMap = () => {
        const station = this.props.selectedStation;
        const { classes } = this.props;

        return(
            <Map
                center={[station.lat, station.lng]}
                zoom={8} {...mapProps} className={classes.map}
            >
                {tileLayer(this.props.prefersDarkMode)}
                {this.singleMarker(station.lat, station.lng, 
                    this.props.prefersDarkMode)}
            </Map>
        );
    }

    render() {
        return(this.props.all ? this.allStationMap() : this.singleStationMap());
    }
}

export default withStyles(useStyles)(StationMap);
