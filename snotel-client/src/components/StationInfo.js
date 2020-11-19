import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

import { Container, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, Link, Chip } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';

import StationMap from './map/StationMap';
import { sendServerRequest } from '../api/restfulAPI';
import { commasInNumber } from '../utils/NumberCommas';

const useStyles = makeStyles((theme) => ({
    header: {
        marginTop: theme.spacing(3)
    }
}));

export default function StationInfo(props) {
    const [selectedStation, setSelectedStation] = useState(null);

    useEffect(() => {
        if(selectedStation) {
            document.title = `${selectedStation.name} | Snotel`;
        }
    }, [selectedStation]);

    let urlParams = useParams();

    useEffect(() => {
        sendServerRequest(`stations?searchField=urlName&searchTerm=${urlParams.stationUrlName}`)
        .then((response => {
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                setSelectedStation(response.body.stations[0]);
            } else {
                console.error("Response code: ", response.statusCode, response.statusText);
            }
        }));
    }, [urlParams]);

    const lastUpdatedChip = (selectedStation) => {
        if(selectedStation.hasOwnProperty('lastUpdated')) {
            let updatedTime = Date.now() - selectedStation.lastUpdated;
            let p = 60 * 60 * 1000; // milliseconds in an hour
            let timeAgo = Math.round(updatedTime / p);

            let unit = '';
            if (timeAgo < 2) {
                timeAgo = 1;
                unit = 'hr';
            } else if (timeAgo > 1 && timeAgo < 24) {
                unit = 'hrs';
            } else if (timeAgo > 23 && timeAgo < 48) {
                timeAgo = 1;
                unit = 'day';
            } else {
                timeAgo = Math.round(updatedTime / 24);
                unit = 'days';
            }
    
            return(
                <Chip size="small" label={`${timeAgo} ${unit} ago`}/>
            );
        } 
    }

    const classes = useStyles();

    const infoTable = (
        <TableContainer component={Paper}>
            <Table aria-label="summary-table">
                <TableHead>
                    <TableRow>
                        <TableCell>Altitude (ft)</TableCell>
                        <TableCell>Snow Depth (in)</TableCell>
                        <TableCell>Identifier</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            {selectedStation 
                                ? commasInNumber(selectedStation.elevation) : <Skeleton/>}
                        </TableCell>
                        <TableCell>
                            {selectedStation ? 
                            <Grid container justify="flex-start" alignItems="center" spacing={2}>
                                <Grid item>
                                    <Typography variant="body2">
                                        {selectedStation.snowDepth}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    {lastUpdatedChip(selectedStation)}
                                </Grid>
                            </Grid>
                            : <Skeleton/>}
                        </TableCell>
                        <TableCell>
                            {selectedStation ? selectedStation.triplet : <Skeleton/>}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );

    return(
        <Container maxWidth="lg">
            <Grid container spacing={1} className={classes.header}>
                <Grid item xs={12} sm={12} md={4}>
                    <Typography variant="h4" component="h1">
                        {selectedStation ? selectedStation.name : <Skeleton/>}
                    </Typography>
                    <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                            {selectedStation ? <Link 
                                color="secondary" underline="none" variant="body1"
                                component={RouterLink} 
                                to={selectedStation ? `/explore/${selectedStation.state}` : '/'}
                            >
                                {selectedStation.stateName} 
                            </Link> : <Skeleton width="10ch"/>}
                        </Grid>
                        <Grid item>
                            <Typography variant="h6" component="span">
                                {' · '}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography>
                                United States
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={12} md={8}>
                    {infoTable}
                </Grid>
                <Grid item xs={12} sm={12} md={4}>

                </Grid>
                <Grid item xs={12} sm={12} md={8}>
                    <StationMap
                        prefersDarkMode={props.prefersDarkMode}
                        selectedStation={selectedStation}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}
