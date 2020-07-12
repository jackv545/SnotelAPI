import React, { useState, useEffect } from 'react';

import { Container, Paper, Grid, Typography, TextField, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(3)
    },
    paper: {
        padding: theme.spacing(2)
    },
    grid: {
        paddingTop: theme.spacing(2)
    },
    button: {
        textTransform: 'none'
    },
    outlinedInput: {
        '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
                borderColor: theme.palette.primary.main
            }
        }
    }
}));

export default function Contact(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [emailValid, setEmailValid] = useState(false);
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = e => {
        const encode = (data) => {
            return Object.keys(data)
                .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
                .join("&");
        };

        const content = {
            name: name, email: email, message: message
        };

        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: encode({ "form-name": "snotel", ...content })
        })
            .then(() => setSubmitted(true))
            .catch(error => console.error(error));

        e.preventDefault();
    };

    useEffect(() => {
        const regex = /^\S+@\S+$/;
        setEmailValid(regex.test(email));
    }, [email]);

    const classes = useStyles();

    const form = () => {
        const emailInputError = email === '' ? false : !emailValid;

        const formProps = (name) => {
            let color;
            if(props.prefersDarkMode) {
                color = 'secondary';
                if(name === 'email' && emailInputError) {
                    color = 'primary';
                }
            } else {
                color = 'primary';
            }

            return {
                fullWidth: true, name: name,
                label: name.charAt(0).toUpperCase().concat(name.slice(1)), 
                variant: 'outlined', color: color,
                classes: { //override mui classes in light theme
                    root: !props.prefersDarkMode && !emailInputError 
                        ? classes.outlinedInput : null
                }
            }
        };

        return(
            <form onSubmit={handleSubmit} name="snotel">
                <Grid container spacing={2} className={classes.grid}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            {...formProps('name')} value={name} 
                            onChange={e => setName(e.target.value)}
                        />
                        
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            {...formProps('email')} 
                            error={emailInputError} value={email} 
                            onChange={e => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            {...formProps('message')} 
                            multiline rows={4} value={message} 
                            onChange={e => setMessage(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                            variant="contained" color="secondary" className={classes.button}
                            type="submit" disabled={!emailValid || message === ''}
                        >
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </form>
        );
    };

    const successMessage = (
        <Typography>
            Thanks for getting in touch. 
        </Typography>
    );

    return(
        <Container maxWidth="md" className={classes.container}>
            <Paper className={classes.paper}>
                <Typography variant="h6" component="h1">
                    Contact
                </Typography>
                {submitted ? successMessage : form()}
            </Paper>
        </Container>
    );
}
