import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Container, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';

import StationMap from './StationMap';
import { sendServerRequestWithBody } from '../api/restfulAPI';
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
        const reqHeader = {requestType: 'stations', requestVersion: 1};
        const search = {searchField: 'urlName', searchTerm: urlParams.stationUrlName};

        sendServerRequestWithBody({...reqHeader, ...search})
        .then((response => {
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                setSelectedStation(response.body.stations[0]);
            } else {
                console.error("Response code: ", response.statusCode, response.statusText);
            }
        }));
    }, [urlParams]);

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
                            {selectedStation ? selectedStation.snowDepth : <Skeleton/>}
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
                    <Typography variant="body2">
                        {selectedStation ? `${selectedStation.state}, United States` : <Skeleton/>}
                    </Typography>
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
