import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

import {Container, Grid, Card, CardContent, Link, Typography, Button,
    Menu, MenuItem, Tab, Tabs} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { fade } from '@material-ui/core/styles';
import { Public, ArrowDropDown } from '@material-ui/icons';

import { sendServerRequestWithBody } from '../api/restfulAPI';
import { commasInNumber } from '../utils/NumberCommas';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(3)
    },
    link: {
        fontWeight: 'bold',
        '&:hover': {
            textDecoration: 'none'
        }
    },
    listOptions: {
        position: 'sticky',
        [theme.breakpoints.up('sm')]: {
            //top: (AppBar height) - (Header height)
            top: `calc(${theme.spacing(6)}px - ${theme.typography.h4.fontSize})`
        }
    },
    label: {
        textTransform: 'none',
        justifyContent: 'left'
    },
    endIcon: {
        marginLeft: 'auto'
    },
    tab: {
        minHeight: theme.spacing(3),
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${
            theme.palette.type === 'light' 
            ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'
        }`,
        textTransform: 'none',
        '&:hover': {
            backgroundColor: 
                fade(theme.palette.text.primary, theme.palette.action.hoverOpacity),
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                backgroundColor: 'transparent',
            }
        }
    },
    tabSelected: {
        backgroundColor: 
            fade(theme.palette.secondary.main, theme.palette.action.activatedOpacity),
        pointerEvents: 'none'
    },
    tabWrapper: {
        alignItems: 'flex-start'
    },
    mt1: {
        marginTop: theme.spacing(1)
    },
    mt2: {
        marginTop: theme.spacing(2)
    }
}));

export default function StateInfo(props) {
    const [stations, setStations] = useState([]);

    useEffect(() => {
        if (stations.length > 0) {
            document.title = `${stations[0].stateName} | Snotel`;
        }

    }, [stations]);

    let urlParams = useParams();

    useEffect(() => {
        const reqHeader = { requestType: 'stations', requestVersion: 1 };
        const search = { searchField: 'state', searchTerm: urlParams.state };

        sendServerRequestWithBody({ ...reqHeader, ...search })
            .then((response => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    setStations(response.body.stations);
                } else {
                    console.error("Response code: ", response.statusCode, response.statusText);
                }
            }));
    }, [urlParams]);

    const classes = useStyles();

    const viewOptions = ['snowpack', 'elevation'];
    const [selectedView, setSelectedView] = useState(0);
    const handleTabChange = (event, newValue) => setSelectedView(newValue);

    const viewTabs = (
        <Tabs
            orientation="vertical" aria-label="station-info"
            onChange={handleTabChange}
            value={selectedView} className={classes.mt2}
        >
            {viewOptions.map((viewOption, i) => (
                <Tab 
                    label={viewOption.charAt(0).toUpperCase() + viewOption.slice(1)} 
                    value={i} key={viewOption} id={`tab${i}`}
                    classes={{root: classes.tab, selected: classes.tabSelected, 
                        wrapper: classes.tabWrapper}} 
                    className={classes.mt1}
                />
            ))}
        </Tabs>
    );

    const sortOptions = { alphabetical: 'A-Z', elevation: 'Elevation', snowpack: 'Snowpack' };
    const [selectedSort, setSelectedSort] = useState('alphabetical');
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (optionKey) => {
        setSelectedSort(optionKey);
        handleClose();
    }

    const sortSelect = (
        <div className={classes.mt1}>
            <Typography variant="caption">
                Sort By:
            </Typography>
            <Button
                fullWidth variant="outlined" aria-controls="sort-menu"
                aria-haspopup="true"
                classes={{ label: classes.label, endIcon: classes.endIcon }}
                onClick={handleClick} endIcon={<ArrowDropDown />}
            >
                {sortOptions[selectedSort]}
            </Button>
            <Menu
                id="sort-menu" anchorEl={anchorEl} keepMounted
                open={Boolean(anchorEl)} onClose={handleClose}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                {Object.keys(sortOptions).map((optionKey) => (
                    <MenuItem
                        onClick={() => handleMenuItemClick(optionKey)}
                        key={optionKey}
                    >
                        {sortOptions[optionKey]}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );

    const mapButton = (
        <Button
            fullWidth variant="outlined" startIcon={<Public />}
            classes={{ label: classes.label }} className={classes.mt1}
            component={RouterLink} to={`/location`}
        >
            Switch to Map
        </Button>
    );

    const listOptions = (
        <Grid container direction="column" spacing={1} className={classes.listOptions}>
            <Grid item>
                <Typography variant="h4" component="h1">
                    {stations.length > 0 ? stations[0].stateName : <Skeleton />}
                </Typography>
            </Grid>
            {viewTabs}
            <Grid item>
                {sortSelect}
            </Grid>
            <Grid item>
                {mapButton}
            </Grid>
        </Grid>
    );

    const stationInfo = (station, selectedView) => {
        let label, value;
        if (selectedView === 0) {
            label = 'Snow Depth:'
            value = `${station.snowDepth}"`;
        } else {
            label = 'Elevation:'
            value = `${commasInNumber(station.elevation)}'`;
        }

        return (
            <Grid container justify="space-around" className={classes.mt1}>
                {[label, value].map((text) => (
                    <Grid item>
                        <Typography variant="body2">{text}</Typography>
                    </Grid>
                ))}
            </Grid>
        );
    };

    const listSkeleton = (
        [...Array(20)].map((val, i) => (
            <Grid item xs={12} sm={6} key={i.toString()}>
                <Skeleton height={80}/>
            </Grid>
        ))
    );

    const stationList = (
        <Grid container spacing={1}>
            {stations.length > 0 
            ? stations.map((station) => (
                <Grid item xs={12} sm={6} key={station.urlName}>
                    <Card>
                        <CardContent>
                            <Link
                                component={RouterLink} className={classes.link}
                                to={`/location/${station.urlName}`} color="secondary"
                            >
                                {station.name}
                            </Link>
                            {stationInfo(station, selectedView)}
                        </CardContent>
                    </Card>
                </Grid>
            ))
            : listSkeleton}
        </Grid>
    );

    return (
        <Container maxWidth="md" className={classes.container}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    {listOptions}
                </Grid>
                <Grid item xs={12} sm={8}>
                    {stationList}
                </Grid>
            </Grid>
        </Container>
    );
}
