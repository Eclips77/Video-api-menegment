import createHttpError from 'http-errors';

const validate = (schema) => (req, res, next) => {
  try {
    const { body, query, params } = req;
    const toValidate = {
      ...(Object.keys(body).length > 0 && { body }),
      ...(Object.keys(query).length > 0 && { query }),
      ...(Object.keys(params).length > 0 && { params }),
    };

    const parsed = schema.parse(toValidate);

    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    return next();
  } catch (error) {
    const validationErrors = error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    return next(createHttpError(400, 'Validation failed', { errors: validationErrors }));
  }
};

export default validate;
