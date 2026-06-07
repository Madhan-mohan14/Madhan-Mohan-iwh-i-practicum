require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo.
const PRIVATE_APP_ACCESS = process.env.ACCESS_TOKEN;

const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
};

// ROUTE 1 - Homepage: fetch all video game character contacts and render table
app.get('/', async (req, res) => {
    const url = 'https://api.hubapi.com/crm/v3/objects/contacts';
    try {
        const resp = await axios.get(url, {
            headers,
            params: { properties: 'character_name,game_title,special_ability', limit: 100 }
        });
        const objects = resp.data.results;
        res.render('homepage', { title: 'Video Game Characters | HubSpot Practicum', objects });
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching data from HubSpot.');
    }
});

// ROUTE 2 - Form page: render the form to add a new character
app.get('/update-cobj', (req, res) => {
    res.render('updates', {
        pageTitle: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
    });
});

// ROUTE 3 - Form submit: create new contact record, then redirect home
app.post('/update-cobj', async (req, res) => {
    const { character_name, game_title, special_ability } = req.body;
    const url = 'https://api.hubapi.com/crm/v3/objects/contacts';
    try {
        await axios.post(url, {
            properties: { firstname: character_name, character_name, game_title, special_ability }
        }, { headers });
        res.redirect('/');
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).send('Error creating record in HubSpot.');
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));
