function errorHandler(err, req, res, next) {
  console.error('[EmergencyConnect Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    safeFallbackNote: 'Emergency coordination safety active. In immediate danger, call 112.'
  });
}

module.exports = errorHandler;
