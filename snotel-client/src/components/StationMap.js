import React from 'react';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import L from 'leaflet';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import './LeafletCluster.css';

export default function StationMap(props) {
    const tileLayer = () => {
        const tileURL = props.prefersDarkMode 
            ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

        return ( <TileLayer url={tileURL}/> );
    }

    const icon = () => {
        return (
            new L.icon({
                iconUrl: require(`../images/map-marker-${props.prefersDarkMode ? 'secondary' : 'red'}.png`),
                iconAnchor: [18, 34],
                popupAnchor: [0, -32],
                shadowUrl: null
            })
        );
    }

    const marker = (lat, lng, name, key) => {
        return(
            <Marker 
                icon={icon(props.prefersDarkMode)} 
                position={[lat, lng]} key={key}
            >
                <Popup>
                    {name}
                </Popup>
            </Marker>
        );
    }

    const createCluster = cluster => {
        return L.divIcon({
            html: `<span>${cluster.getChildCount()}</span>`,
            className: `marker-cluster ${props.prefersDarkMode ? 'dark' : 'light'}`,
            iconSize: L.point(40, 40, true),
        });
    }

    const allStationMap = () => {
        return(
            <Map
                bounds={[[70.37, -164.29], [32.92, -103.79]]}
                attributionControl={false}
                style={{ height: 500, maxwidth: 700 }}
            >
                {tileLayer()}
                <MarkerClusterGroup
                    iconCreateFunction={createCluster}
                    polygonOptions={{weight: 0, fill: false}}
                >
                    {props.stations.map((station, i) => (
                        marker(station.lat, station.lng, station.name, i)
                    ))}
                </MarkerClusterGroup>
            </Map> 
        );
    }

    const singleStationMap = () => {
        const station = props.selectedStation;

        return(
            <Map
                center={[station.lat, station.lng]}
                zoom={8}
                attributionControl={false}
                style={{ height: 500, maxwidth: 700 }}
            >
                {tileLayer()}
                {marker(station.lat, station.lng, station.name)}
            </Map>
        );
    }

    return(props.all ? allStationMap() : singleStationMap());
}
