import React, { Component } from 'react';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import L from 'leaflet';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import './LeafletCluster.css';

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

const icon = (prefersDarkMode) => {
    return (
        new L.icon({
            iconUrl: require(`../images/map-marker-${prefersDarkMode ? 'secondary' : 'red'}.png`),
            iconAnchor: [18, 34],
            popupAnchor: [0, -32],
            shadowUrl: null
        })
    );
}

const marker = (lat, lng, name, prefersDarkMode, key='1') => {
    return(
        <Marker 
            icon={icon(prefersDarkMode)} 
            position={[lat, lng]} key={key}
        >
            <Popup>
                {name}
            </Popup>
        </Marker>
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
                    {this.props.stations.map((station, i) => (
                        marker(station.lat, station.lng, station.name, 
                            this.props.prefersDarkMode, i.toString())
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
                {marker(station.lat, station.lng, station.name,
                    this.props.prefersDarkMode)}
            </Map>
        );
    }

    render() {
        return(this.props.all ? this.allStationMap() : this.singleStationMap());
    }
}

export default withStyles(useStyles)(StationMap);
