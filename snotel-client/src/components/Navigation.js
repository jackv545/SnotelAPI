import React, { useState, useEffect } from 'react';

import { AppBar, Toolbar, Grid, TextField, InputAdornment, Popper, Paper, 
    Typography, ButtonGroup, Fade, Container, useMediaQuery, Hidden } 
    from '@material-ui/core';
import { AcUnit, Search, Place } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequestWithBody } from '../api/restfulAPI';
import LinkButton from '../utils/LinkButton';

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
    search: props => ({
        backgroundColor: props.prefersDarkMode ? null : theme.palette.primary.light,
        borderRadius: theme.shape.borderRadius
    }),
    mobileSearch: {
        width: '100%',
        marginBottom: theme.spacing(1)
    },
    desktopSearch: props => ({
        transition: theme.transitions.create('width'),
        width: props.searchFocus ? '40ch' : '30ch'
    }),
    adornment: {
        color: theme.palette.primary.contrastText
    },
    input: {
        color: theme.palette.primary.contrastText
    },
    outlinedInput: {
        '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
                borderColor: theme.palette.grey[600]
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.grey[600]
            }
        }
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
    const [anchorEl, setAnchorEl] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [inputValueFirstLetter, setInputValueFirstLetter] = useState('');
    const [stations, setStations] = useState([]);
    const [filteredStations, setFilteredStations] = useState([]);
    const [searchFocus, setSearchFocus] = useState(false);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);

        if (event.target.value.length > 1) {
            setAnchorEl(event.currentTarget)
        } else {
            setAnchorEl(null);
        }
    }

    useEffect(() => {
        setInputValueFirstLetter(inputValue.charAt(0));

        setFilteredStations(
            stations.filter(station => 
                station.name.toLowerCase().startsWith(inputValue.toLowerCase())
            )
        );
    }, [inputValue, stations]);

    //Load search suggestions into client after the first letter is typed
    useEffect(() => {
        if(inputValueFirstLetter !== '') {
            sendServerRequestWithBody({ requestType: 'stations', requestVersion: 1, 
                searchField:'name',  searchTerm:inputValueFirstLetter })
            .then((response => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    setStations(response.body.stations);
                } else {
                    console.error("Response code: ", response.statusCode, response.statusText);
                }
            }));
        }
    }, [inputValueFirstLetter])

    const closeSuggestions = () => {
        setAnchorEl(null);
        setInputValue('');
    }

    const classes = useStyles(
        {prefersDarkMode: props.prefersDarkMode, searchFocus: searchFocus}
    );

    const suggestions = (
        <Paper className={classes.suggestions}>
            {filteredStations.length !== 0 
            ? <ButtonGroup orientation="vertical" variant="text">
                {filteredStations.map((station, i) => (
                    <LinkButton
                        key={i.toString()} startIcon={<Place/>}
                        className={classes.suggestion} fullWidth
                        onClick={closeSuggestions}
                        to={`/location/${station.urlName}`}
                    >
                        {station.name}
                    </LinkButton>
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

    const homeButton = (
        <LinkButton
            to="/" size="large" startIcon={<AcUnit/>} disableRipple
            classes={{ label: classes.homeButton, root: classes.noHover }}
            color="inherit"
        >
            Snotel
        </LinkButton>
    );

    const handleOnFocus = (event) => {
        if(inputValue.length > 1) {
            setAnchorEl(event.currentTarget)
        }
        setSearchFocus(true);
    }

    const handleOnBlur = () => {
        setAnchorEl(null);
        setSearchFocus(false);
    }

    const smUp = useMediaQuery(theme => theme.breakpoints.up('sm'));

    const search = (
        <TextField
            color={props.prefersDarkMode ? "secondary" : null} 
            placeholder="Search for a Mountain" variant="outlined"
            value={inputValue} onChange={handleInputChange} 
            className={
                `${classes.search} ${smUp 
                    ? classes.desktopSearch : classes.mobileSearch}`
            }
            onFocus={handleOnFocus} onBlur={handleOnBlur}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search/>
                    </InputAdornment>
                ),
                classes: {
                    adornedStart: classes.adornment,
                    input: classes.input
                }
            }}
            classes={{ //override mui classes in light theme
                root: props.prefersDarkMode ? null : classes.outlinedInput
            }}
        />
    );

    const mobileMenu = (
        <>
        <Grid container justify="space-between" alignItems="center">
            <Grid item>
                {homeButton}
            </Grid>
            <Grid item>
                {props.darkModeButton}
            </Grid>
        </Grid>
        {search}
        {suggestionsDropdown}
        </>
    );

    const desktopMenu = (
        <Toolbar disableGutters>
            <Grid container alignItems="center" justify="flex-start" spacing={1}
            >
                <Grid item>
                    {homeButton}
                </Grid>
                <Grid item>
                    {search}
                    {suggestionsDropdown}
                </Grid>
            </Grid>
            {props.darkModeButton}
        </Toolbar>
    );

    return (
        <AppBar position="static" color={props.prefersDarkMode ? "inherit" : "primary"}>
                <Container maxWidth="md">
                    <Hidden xsDown>
                        {desktopMenu}
                    </Hidden> 
                    <Hidden smUp>
                        {mobileMenu}
                    </Hidden>
                </Container>
        </AppBar>
    );
}
