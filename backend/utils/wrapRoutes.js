const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

function wrapRoutes(router) {
    router.stack.forEach((layer) => {
        if (layer.route) {
            layer.route.stack.forEach((h) => {
                h.handle = asyncHandler(h.handle);
            });
        }
    });
    return router;
}

export default wrapRoutes;