export function errorMiddleware(error, req, res, next) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        statusCode,
        message: error.message || 'Error interno en el servidor',
        error: statusCode >= 500 ? 'Internal Server Error' : 'Bad Request'
    });
}