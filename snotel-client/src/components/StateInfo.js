import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

import { Container, Grid, Card, CardContent, Link } 
    from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequestWithBody } from '../api/restfulAPI';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(1)
    },
    link: {
        fontWeight: 'bold',
        '&:hover': {
            textDecoration: 'none'
        }
    }
}));

export default function StateInfo(props) {
    const [stations, setStations] = useState([]);

    let urlParams = useParams();

    useEffect(() => {
        const reqHeader = {requestType: 'stations', requestVersion: 1};
        const search = {searchField: 'state', searchTerm: urlParams.state};

        sendServerRequestWithBody({...reqHeader, ...search})
        .then((response => {
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                setStations(response.body.stations);
            } else {
                console.error("Response code: ", response.statusCode, response.statusText);
            }
        }));
    }, [urlParams]);

    const classes = useStyles();

    return(
        <Container maxWidth="md" className={classes.container}>
            <Grid container spacing={1}>
                {stations.map((station) => (
                    <Grid item xs={12} sm={6} key={station.urlName}>
                        <Card>
                            <CardContent>
                                <Link
                                    component={RouterLink} className={classes.link}
                                    to={`/location/${station.urlName}`} color="secondary"
                                >
                                    {station.name}
                                </Link>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
