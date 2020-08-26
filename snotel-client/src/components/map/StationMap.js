import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

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
    },
    popup: {
        '& .leaflet-popup-content-wrapper': {
            ...theme.typography.caption,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary
        },
        '& .leaflet-popup-tip': {
            background: theme.palette.background.paper,
        }
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
            iconUrl: require(`../../images/map-marker-${markerType}.png`),
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

    onMarkerClick = (urlName) => {
        if(urlName) {
            this.props.history.push(`/location/${urlName}`);
        }
    }

    marker = (lat, lng, name, prefersDarkMode, urlName) => {
        const { classes } = this.props;

        return(
            <Marker 
                icon={icon(prefersDarkMode, false)} 
                position={[lat, lng]} key={name}
                onMouseOver={(e) => e.target.openPopup()}
                onMouseOut={(e) => e.target.closePopup()}
                onClick={() => this.onMarkerClick(urlName)}
            >
                <Popup 
                    closeButton={false} className={classes.popup} 
                    key={`${name}${this.props.prefersDarkMode ? 'dark' : 'light'}`}
                >
                    {name}
                </Popup>
            </Marker>
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
                bounds={this.props.bounds}
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
                            this.props.prefersDarkMode, station.urlName)
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
                center={station ? [station.lat, station.lng] : [42, -115]}
                zoom={8} {...mapProps} className={classes.map}
            >
                {tileLayer(this.props.prefersDarkMode)}
                {station ? this.singleMarker(
                        station.lat, station.lng, this.props.prefersDarkMode)
                    : null}
            </Map>
        );
    }

    render() {
        return(this.props.all ? this.allStationMap() : this.singleStationMap());
    }
}

export default withRouter(withStyles(useStyles)(StationMap));
