const express = require('express');
const cors = require('cors');
const { expressjwt: expressJwt } = require('express-jwt');
const jwks = require('jwks-rsa');
const axios = require('axios');

const app = express();
app.use(cors());


const verifyJwt = expressJwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH0_DOMAIN}.well-known/jwks.json`
    }),
    audience: process.env.AUTH0_AUDIENCE,
    issuer: process.env.AUTH0_DOMAIN,
    algorithms: ['RS256']
}).unless({path: ['/']})

app.use(verifyJwt);

app.get('/', (req, res) => {
    res.send('Developer Portal API');
})

app.get('/protected', async (req, res) => {
    try{
        const accessToken = req.headers.authorization.split(' ')[1];
        const response = await axios.get(`${process.env.AUTH0_DOMAIN}userinfo`, {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });
        const userinfo = response.data
        res.send(userinfo);
    } catch(error) {
        res.send(error.message)
    }
});



app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    const status = error.status || 500
    const message = error.message || 'Internal server error';
    res.status(status).send(message);
})

app.listen(4000, () => console.log('Server on port 4000'));