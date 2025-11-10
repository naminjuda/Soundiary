
export function notFound(_req, res) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: 'internal_error',
    message: err.message || 'Something went wrong',
  });
}
