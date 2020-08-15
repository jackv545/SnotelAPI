import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link as RouterLink } from 'react-router-dom';

import {Container, Grid, Card, CardContent, Link, Typography, Button,
    Menu, MenuItem, ButtonBase, useMediaQuery, Hidden } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles, useTheme } from '@material-ui/styles';
import { fade } from '@material-ui/core/styles';
import { Public, Sort, ArrowDropDown } from '@material-ui/icons';

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
    noTextTransform: {
        textTransform: 'none',
    },
    endIcon: {
        marginLeft: 'auto'
    },
    tab: {
        ...theme.typography.button,
        textTransform: 'none',
        padding: '5px 15px',
        width: '100%',
        transition: theme.transitions.create(['background-color'], {
            duration: theme.transitions.duration.short,
        }),
        borderRadius: theme.shape.borderRadius,
        justifyContent: 'left',
        [theme.breakpoints.down('xs')]: {
            borderRadius: theme.spacing(2),
            justifyContent: 'center'
        },
        border: `1px solid ${
            theme.palette.type === 'light' 
            ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'
        }`,
        '&:hover': {
            backgroundColor: 
                fade(theme.palette.text.primary, theme.palette.action.hoverOpacity),
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                backgroundColor: 'transparent',
            }
        }
    },
    mt1: {
        marginTop: theme.spacing(1)
    },
    mt2: {
        marginTop: theme.spacing(2)
    },
    mt2smUp: {
        [theme.breakpoints.up('sm')]: {
            marginTop: theme.spacing(2)
        }
    },
}));

// A custom hook that builds on useLocation to parse the query string
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function StateInfo(props) {
    let query = useQuery();

    useEffect(() => {
        if(query.get('tab')) {
            setSelectedView(query.get('tab'));
        } else {
            setSelectedView('snowpack');
        }
    }, [query]);

    const classes = useStyles();
    const theme = useTheme();

    const viewOptions = ['snowpack', 'elevation'];
    const [selectedView, setSelectedView] = useState('snowpack');

    const viewTabs = (
        viewOptions.map((viewOption, i) => (
            <Grid 
                item xs={6} sm={12} key={viewOption} 
                className={i === 0 ? classes.mt2smUp : null}
            >
                <ButtonBase 
                    focusRipple classes={{root: classes.tab}} 
                    component={RouterLink} to={`?tab=${viewOption}`}
                    style={viewOption === selectedView ? { 
                        backgroundColor: 
                            fade(
                                theme.palette.secondary.main, 
                                theme.palette.action.activatedOpacity
                            ),
                        pointerEvents: 'none'
                    } : null}
                >
                    {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
                </ButtonBase>
            </Grid>
        ))
    );

    const sortOptions = { none: 'None', alphabetical: 'A-Z', 
        elevation: 'Elevation', snowDepth: 'Snowpack' };
    const [selectedSort, setSelectedSort] = useState('alphabetical');

    const [stations, setStations] = useState([]);
    
    //set tab title
    useEffect(() => {
        if (stations.length > 0) {
            document.title = `${stations[0].stateName} | Snotel`;
        }
    }, [stations]);

    let urlParams = useParams();

    //get stations from state url param
    useEffect(() => {
        const reqHeader = { requestType: 'stations', requestVersion: 1 };
        const search = { searchField: 'state', searchTerm: urlParams.state };

        sendServerRequestWithBody({ ...reqHeader, ...search, orderBy: selectedSort })
            .then((response => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    setStations(response.body.stations);
                } else {
                    console.error("Response code: ", response.statusCode, response.statusText);
                }
            })
        );
    }, [urlParams, selectedSort]);

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

    const smUp = useMediaQuery(theme => theme.breakpoints.up('sm'));

    const sortSelect = (
        <div className={classes.mt2smUp}>
            <Hidden xsDown>
                <Grid item xs>
                    <Typography variant="caption">
                        Sort by:
                    </Typography>
                </Grid>
            </Hidden>
                <Button
                    fullWidth variant="outlined" aria-controls="sort-menu"
                    aria-haspopup="true"
                    classes={{ label: classes.label, endIcon: classes.endIcon }}
                    onClick={handleClick} endIcon={<ArrowDropDown/>}
                    startIcon={smUp ? null : <Sort/>}
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
                            selected={optionKey === selectedSort} key={optionKey}
                        >
                            {sortOptions[optionKey]}
                        </MenuItem>
                    ))}
                </Menu>
        </div>
    );

    const mapButton = (
        <Button
            fullWidth variant="outlined" startIcon={<Public/>}
            classes={{ label: smUp ? classes.label : classes.noTextTransform}} 
            className={classes.mt2smUp}
            component={RouterLink} to={`/map/${urlParams.state}`}
        >
            Switch to Map
        </Button>
    );

    const listOptions = (
        <Grid container spacing={1} className={classes.listOptions}>
            <Grid item xs={12}>
                <Typography variant="h4" component="h1">
                    {stations.length > 0 ? stations[0].stateName : <Skeleton />}
                </Typography>
            </Grid>
            {viewTabs}
            <Grid item xs={6} sm={12}>
                {sortSelect}
            </Grid>
            <Grid item xs={6} sm={12}>
                {mapButton}
            </Grid>
        </Grid>
    );

    const stationInfo = (station, selectedView) => {
        let label, value;
        if (selectedView === 'snowpack') {
            label = 'Snow Depth:'
            value = `${station.snowDepth}"`;
        } else {
            label = 'Elevation:'
            value = `${commasInNumber(station.elevation)}'`;
        }

        return (
            <Grid container justify="space-around" className={classes.mt1}>
                {[label, value].map((text, i) => (
                    <Grid item key={`${station.urlName}${i}`}>
                        <Typography variant="body2">{text}</Typography>
                    </Grid>
                ))}
            </Grid>
        );
    };

    const listSkeleton = (
        [...Array(20)].map((val, i) => (
            <Grid item xs={12} sm={6} key={i.toString()}>
                <Skeleton variant="rect" height={80}/>
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
