var jwt = require('express-jwt');
const message = require('../../config/message.json')
// const { secret } = require('config.json');

module.exports = authorize;
function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User') 
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        // jwt({ , algorithms: ['HS256'] }),
            jwt({secret:process.env.JWTSECRET,algorithms: ['HS256']}),
        // authorize based on user role
        (req, res, next) => {
            if (roles.length && !roles.includes(req.user.role)) {
                // user's role is not authorized
                res = message.unauthorized_user
                return res;
            }
            // authentication and authorization successful
            next();
        }
    ];
}