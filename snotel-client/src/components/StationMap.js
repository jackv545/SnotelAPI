import React from 'react';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map, Marker, Popup, TileLayer } from "react-leaflet";

export default function StationMap(props) {
    const tileLayer = () => {
        const tileURL = props.prefersDarkMode 
            ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

        return( <TileLayer url={tileURL}/> );
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

    const marker = () => {
        return(
            <Marker 
                icon={icon(props.prefersDarkMode)} 
                position={[props.selectedStation.lat, props.selectedStation.lng]}
            >
                <Popup>
                    {props.selectedStation.name}
                </Popup>
            </Marker>
        );
    }

    return(
        <Map
            center={[props.selectedStation.lat, props.selectedStation.lng]}
            zoom={8}
            attributionControl={false}
            style={{ height: 500, maxwidth: 700 }}
        >
            {tileLayer()}
            {marker()}
        </Map>
    );
}
