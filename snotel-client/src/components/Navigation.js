import React, { useState, useEffect, useRef } from 'react';

import { AppBar, Toolbar, Grid, TextField, InputAdornment, Popper, Paper, 
    Typography, Button, ButtonGroup, Fade} from '@material-ui/core';
import { AcUnit, Search, Place } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequestWithBody } from '../api/restfulAPI';
import LinkButton from '../utils/LinkButton';
import useOutsideAlerter from '../utils/OutsideAlerter';

const useStyles = makeStyles((theme) => ({
    homeButton: {
        textTransform: 'none'
    },
    noHover: props => ({
        '&:hover': {
            backgroundColor: props.prefersDarkMode ? theme.palette.background.paper
                : theme.palette.primary.main
        }
    }),
    search: {
        width: '100%'
    },
    suggestions: {
        overflowY: 'auto',
        maxHeight: '50vh',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1)
    },
    suggestion: {
        textTransform: 'none',
        justifyContent: 'left',
        paddingLeft: theme.spacing(2)
    },
    noResults: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
    }
}));

export default function Navigation(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [inputValue, setInputValue] = useState('');
    const [inputValueFirstLetter, setInputValueFirstLetter] = useState('');
    const [stations, setStations] = useState([]);
    const [filteredStations, setFilteredStations] = useState([]);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);

        if (event.target.value.length > 1) {
            setAnchorEl(event.currentTarget)
        } else {
            setAnchorEl(null);
        }
    }

    const handleOnFocus = (event) => {
        if(inputValue.length > 1) {
            setAnchorEl(event.currentTarget)
        }
    }

    useEffect(() => {
        setInputValueFirstLetter(inputValue.charAt(0));

        setFilteredStations(
            stations.filter(station => station.name.toLowerCase().startsWith(inputValue.toLowerCase()))
        );
    }, [inputValue, stations]);

    //Load search suggestions into client after the first letter is typed
    useEffect(() => {
        if(inputValueFirstLetter !== '') {
            sendServerRequestWithBody({ requestType: 'stations', requestVersion: 1, 
                searchField:'name',  searchTerm:inputValueFirstLetter })
            .then((response => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    setStations(response.body.stations)
                } else {
                    console.error("Response code: ", response.statusCode, response.statusText);
                }
            }));
        }
    }, [inputValueFirstLetter])

    const selectStation = (station) => {
        //Close the search suggestions and clear the search bar after a selection is made
        setAnchorEl(null);
        setInputValue('');
        props.setSelectedStation(station);
    }

    const classes = useStyles(props);

    const suggestions = (
        <Paper className={classes.suggestions}>
            {filteredStations.length !== 0 
            ? <ButtonGroup orientation="vertical" variant="text">
                {filteredStations.map((station, i) => (
                    <Button
                        key={i.toString()}
                        className={classes.suggestion} fullWidth
                        startIcon={<Place/>}
                        onClick={() => selectStation(station)}
                    >
                        {station.name}
                    </Button>
                ))}
            </ButtonGroup>
            : <Typography className={classes.noResults}>
                No results
            </Typography>}
        </Paper>
    );

    const suggestionsDropdown = (
        <Popper 
            open={Boolean(anchorEl)} anchorEl={anchorEl} 
            placement="bottom-start" transition
        >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={200}>
                    {suggestions}
                </Fade>
            )}
        </Popper>
    );

    //Close search suggestions on click outside
    const wrapperRef = useRef(null);
    const clickAway = () => setAnchorEl(null);
    useOutsideAlerter(wrapperRef, clickAway);

    const search = (
        <TextField
            color="secondary" placeholder="Search for a Mountain" variant="outlined"
            value={inputValue} onChange={handleInputChange} className={classes.search}
            ref={wrapperRef}
            onFocus={handleOnFocus}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search/>
                    </InputAdornment>
                ),
            }}
        />
    );

    return (
        <AppBar position="static" color={props.prefersDarkMode ? "inherit" : "primary"}>
            <Toolbar>
                <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={12} sm={1}>
                        <LinkButton
                            to="/" size="large" startIcon={<AcUnit/>} disableRipple
                            classes={{ label: classes.homeButton, root: classes.noHover }}
                            onClick={() => props.setSelectedStation(null)}
                        >
                            Snotel
                        </LinkButton>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                        {search}
                        {suggestionsDropdown}
                        
                    </Grid>
                    <Grid item xs={12} sm={1}>
                        {props.darkModeButton}
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    );
}
