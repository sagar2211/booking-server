module.exports = (err, req, res, next) => {
    err.statusCode = statusCode || 500;
    err.status = status || 'error';
    err.status(err.statusCode).json({
        message: err.message,
        status: err.status
    })
}