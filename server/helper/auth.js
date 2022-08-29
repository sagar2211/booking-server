var jwt = require('jsonwebtoken');
const MESSAGE = require('../../config/message.json')
require('dotenv');
// const { secret } = require('config.json');

function verifyToken(req, res, next){
    if(!req.headers.authorization){
            // res = message.header_authorization;
            return res.status(401).send(
                MESSAGE.JWT.ERROR_HEADER_AUTHORIZATION
            )
        }
        let token = req.headers.authorization.split(' ')[1];
        if(token === 'null') {
            return res.status(401).send(
                MESSAGE.JWT.ERROR_TOKEN_NOT_FOUND
            )
        }
        let payload = jwt.verify(token, process.env.JWTSECRET )
        if(!payload){
            return res.status(401).send(
                MESSAGE.JWT.ERROR_PAYLOAD
            )
        }
        req.userId = payload.sub;
        next();
}

module.exports = verifyToken;