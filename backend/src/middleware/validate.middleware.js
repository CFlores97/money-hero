export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
    });

    if (!result.success) {
        return res.status(400).json({
            statusCode: 400,
            message: result.error.issues.map((issue)=> issue.message),
        });
    }

    req.validated = result.data;
    next();
}