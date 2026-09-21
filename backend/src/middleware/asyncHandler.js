// Envuelve un controlador async para que cualquier error caiga en el
// middleware de errores de Express en lugar de repetir try/catch en cada uno.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
