import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link as RouterLink } from 'react-router-dom';

import {Container, Grid, Typography, Button, Menu, MenuItem, ButtonBase, useMediaQuery, 
    Hidden, Chip } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles, useTheme } from '@material-ui/styles';
import { fade } from '@material-ui/core/styles';
import { Public, Sort, ArrowDropDown } from '@material-ui/icons';

import SkiAreas from './SkiAreas';
import BackcountryStations from './BackcountryStations';
import { sendServerRequest } from '../../api/restfulAPI';

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
    chip: {
        backgroundColor: theme.palette.type === 'light' 
            ? theme.palette.grey[400] : theme.palette.grey[700]
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
    mtSmUp: {
        [theme.breakpoints.up('sm')]: {
            marginTop: `calc(${theme.spacing(4)}px + ${theme.typography.h4.fontSize} - 1px)`
        }
    }
}));

// A custom hook that builds on useLocation to parse the query string
export function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export const VIEW_OPTIONS = {'ski-areas': 'Ski Areas', backcountry: 'Backcountry'};
export const VIEW_OPTION_KEYS = Object.keys(VIEW_OPTIONS);

export default function StateInfo(props) {
    const [selectedView, setSelectedView] = useState(VIEW_OPTION_KEYS[0]);

    const sortOptions = { none: 'None', alphabetical: 'A-Z', elevation: 'Elevation'};
    const backcountrySortOptions = {...sortOptions, snowDepth: 'Snowpack' };
    const [selectedSort, setSelectedSort] = useState('alphabetical');
    
    let query = useQuery();

    useEffect(() => {
        if(query.get('tab')) {
            setSelectedView(query.get('tab'));
            if(query.get('tab') === VIEW_OPTION_KEYS[0] && selectedSort === 'snowDepth') {
                setSelectedSort('alphabetical');
            }
        } else {
            setSelectedView(VIEW_OPTION_KEYS[0]);
        }
    }, [query, selectedSort]);

    const classes = useStyles();
    const theme = useTheme();

    const [skiAreaCount, setSkiAreaCount] = useState(-1);
    const [backcountryStationCount, setBackcountryStationCount] = useState(-1);
    
    const viewTabChip = (count) => {
        return (count > -1
            ? <Chip 
                size="small" label={count} className={classes.endIcon}
                classes={{root: classes.chip}}
            />
            : <Skeleton 
                variant="circle" width={32} height={24} 
                className={classes.endIcon}
            />
        );
    };

    const viewTabs = (
        VIEW_OPTION_KEYS.map((viewOption, i) => (
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
                    {VIEW_OPTIONS[viewOption]}
                    {viewTabChip(
                        viewOption === VIEW_OPTION_KEYS[0] 
                            ? skiAreaCount : backcountryStationCount
                    )}
                </ButtonBase>
            </Grid>
        ))
    );

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

    const sortSelect = (sortOptions) => {
        return(
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
    };

    let urlParams = useParams();

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

    const [stateName, setStateName] = useState('');
    const [regionID, setRegionID] = useState(0);

    useEffect(() => {
        sendServerRequest(`state?state=${urlParams.state}&includeStats=true`)
            .then((response => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    setStateName(response.body.stateName);
                    setRegionID(response.body.region);
                    setSkiAreaCount(response.body.skiAreaCount);
                    setBackcountryStationCount(response.body.backcountryStationCount);
                } else {
                    console.error("Response code: ", response.statusCode, response.statusText);
                }
            }));
    }, [urlParams.state]);


    const listOptions = (
        <Grid container spacing={1} className={classes.listOptions}>
            <Grid item xs={12}>
                <Typography variant="h4" component="h1">
                    {stateName.length > 0 ? stateName : <Skeleton />}
                </Typography>
            </Grid>
            {viewTabs}
            <Grid item xs={6} sm={12}>
                {sortSelect(selectedView === VIEW_OPTION_KEYS[0] 
                    ? sortOptions : backcountrySortOptions
                )}
            </Grid>
            <Grid item xs={6} sm={12}>
                {mapButton}
            </Grid>
        </Grid>
    );

    return (
        <Container maxWidth="lg" className={classes.container}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    {listOptions}
                </Grid>
                <Grid item xs={12} sm={8} className={classes.mtSmUp}>
                    {selectedView === VIEW_OPTION_KEYS[0] 
                        ? <SkiAreas 
                            stateName={stateName} regionID={regionID} selectedSort={selectedSort}
                        />
                        : <BackcountryStations 
                            state={urlParams.state} stateName={stateName} regionID={regionID} 
                            selectedSort={selectedSort}
                        />
                    }
                </Grid>
            </Grid>
        </Container>
    );
}
