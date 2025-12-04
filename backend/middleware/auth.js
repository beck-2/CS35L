// Middleware to check if user is authenticated
export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }
  next();
};

// Middleware to attach user info to request
export const attachUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    req.username = req.session.username;
  }
  next();
};
