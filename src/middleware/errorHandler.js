export const errorHandler = (err, req, res, next) => {
               const statusCode = err.statusCode || 500;
               const message = err.message || 'Internal server error';

               console.error(`Error ${statusCode}: ${message}`);
               console.error(err.stack);

               res.status(statusCode).json({
                              success: false,
                              error: process.env.NODE_ENV === 'production'
                                             ? 'Internal server error'
                                             : message,
                              ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
               });
};
