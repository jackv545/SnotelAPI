import React, { useState } from 'react';

import { Container, Paper, Grid, Typography, TextField, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(1)
    },
    paper: {
        padding: theme.spacing(1)
    },
    grid: {
        paddingTop: theme.spacing(2)
    },
    button: {
        textTransform: 'none'
    }
}));

const encode = (data) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
}

export default function Contact(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = e => {
        const content = {
            name: name,
            email: email,
            message: message
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

    const classes = useStyles();

    const form = (
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Grid container spacing={2} className={classes.grid}>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth label="Name" variant="outlined"
                        value={name} onChange={e => setName(e.target.value)}
                    />
                    
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth label="Email" variant="outlined"
                        value={email} onChange={e => setEmail(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField 
                        fullWidth label="Message" variant="outlined" multiline 
                        rows={4} value={message} onChange={e => setMessage(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button 
                        variant="contained" color="secondary" className={classes.button}
                        type="submit"
                    >
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </form>
    );

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
                {submitted ? successMessage : form}
            </Paper>
        </Container>
    )
}