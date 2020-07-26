import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { AppBar, Toolbar, Grid, TextField, InputAdornment, Popper, Paper, 
    Typography, Fade, Container, useMediaQuery, Hidden, ClickAwayListener, 
    MenuList, MenuItem, ListItemIcon, Box, ButtonBase } from '@material-ui/core';
import { Search, Place } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

import { sendServerRequestWithBody } from '../api/restfulAPI';

import HomeButtonOrange from '../images/HomeButtonOrange.png';
import HomeButtonBlue from '../images/HomeButtonBlue.png';

const useStyles = makeStyles((theme) => ({
    homeButton: {
        borderRadius: theme.shape.borderRadius
    },
    img: {
        height: theme.spacing(4)
    },
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
    contrastText: {
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
    },
    noResults: {
        padding: theme.spacing(2)
    }
}));

export default function Navigation(props) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [inputValueFirstLetter, setInputValueFirstLetter] = useState('');
    const [stations, setStations] = useState([]);
    const [filteredStations, setFilteredStations] = useState([]);
    const [searchFocus, setSearchFocus] = useState(false);
    const [autoFocusItem, setAutoFocusItem] = useState(false);

    const homeButtonRef = useRef(null);

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
    }, [inputValueFirstLetter]);

    const closeSuggestions = (resetInput) => {
        if(resetInput) {
            setInputValue('');
        }
        setSearchFocus(false);
        setAnchorEl(null);
        setAutoFocusItem(false);
    }
    
    const handleListKeyDown = (event) => {
        if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
            closeSuggestions(false);
            props.setDarkModeFocus();
        } else if (event.key === 'Tab' && event.shiftKey) {
            event.preventDefault();
            closeSuggestions(false);
            homeButtonRef.current.focus();
        }
    };

    const classes = useStyles(
        {prefersDarkMode: props.prefersDarkMode, searchFocus: searchFocus}
    );

    const suggestions = (
        <Paper className={classes.suggestions}>
            {filteredStations.length !== 0 
            ? <MenuList 
                id="suggestions" onKeyDown={handleListKeyDown}
                autoFocusItem={autoFocusItem}
            >
                {filteredStations.map((station, i) => (
                    <MenuItem 
                        component={Link} onClick={() => closeSuggestions(true)}
                        to={`/location/${station.urlName}`}
                        key={i.toString()}
                    >
                        <ListItemIcon>
                            <Place/>
                        </ListItemIcon>
                        {station.name}
                    </MenuItem>
                ))}
            </MenuList>
            : <Typography className={classes.noResults}>
                No results were found.
            </Typography>}
        </Paper>
    );

    const suggestionsDropdown = (
        <Popper 
            open={Boolean(anchorEl)} anchorEl={anchorEl} 
            role={undefined} placement="bottom-start" transition
        >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={200}>
                    {suggestions}
                </Fade>
            )}
        </Popper>
    );

    const homeButton = (
        <ButtonBase 
            component={Link} to="/" ref={homeButtonRef} 
            focusRipple className={classes.homeButton}
        >
            <img 
                className={classes.img} alt="Snotel"
                src={props.prefersDarkMode ? HomeButtonBlue : HomeButtonOrange}
            />
        </ButtonBase>
    );

    const handleOnFocus = (event) => {
        if(inputValue.length > 1) {
            setAnchorEl(event.currentTarget)
        }
        setSearchFocus(true);
    };

    const handleSearchKeyUp = (event) => {
        if(event.key === 'ArrowDown' && Boolean(anchorEl)) {
            event.preventDefault();
            setAutoFocusItem(true);
        } else if (event.key === 'Escape') {
            setInputValue('');
            if(Boolean(anchorEl)) {
                setAnchorEl(null);
            }
        }
    };

    const handleSearchKeyDown = (event) => {
        if(event.key === 'Tab' && !event.shiftKey) {
            if(Boolean(anchorEl)) {
                event.preventDefault();
                closeSuggestions(false);
            } else {
                setSearchFocus(false);
            }
        } else if(event.key === 'Tab' && event.shiftKey) {
            if(Boolean(anchorEl)) {
                closeSuggestions(false);
            } else {
                setSearchFocus(false);
            }
            event.preventDefault();
            homeButtonRef.current.focus();
        }
    }

    const smUp = useMediaQuery(theme => theme.breakpoints.up('sm'));

    const textField = (
        <TextField
            color={props.prefersDarkMode ? "secondary" : null} 
            placeholder="Search for a Mountain" variant="outlined"
            value={inputValue} onChange={handleInputChange}
            className={
                `${classes.search} ${smUp 
                    ? classes.desktopSearch : classes.mobileSearch}`
            }
            onFocus={handleOnFocus} onKeyUp={handleSearchKeyUp}
            onKeyDown={handleSearchKeyDown}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search/>
                    </InputAdornment>
                ),
                classes: {
                    adornedStart: classes.contrastText,
                    input: classes.contrastText
                }
            }}
            classes={{ //override mui classes in light theme
                root: props.prefersDarkMode ? null : classes.outlinedInput
            }}
        />
    );

    const search = (
        <ClickAwayListener onClickAway={() => closeSuggestions(false)}>
            <Box>
                {textField}
                {suggestionsDropdown}
            </Box>
        </ClickAwayListener>
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
        </>
    );

    const desktopMenu = (
        <Toolbar disableGutters>
            <Grid container alignItems="center" justify="flex-start" spacing={1}>
                <Grid item>
                    {homeButton}
                </Grid>
                <Grid item>
                    {search}
                </Grid>
            </Grid>
            {props.darkModeButton}
        </Toolbar>
    );

    return (
        <AppBar position="sticky" color={props.prefersDarkMode ? "inherit" : "primary"}>
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
