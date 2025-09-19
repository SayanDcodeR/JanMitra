module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        // req.flash("error", "You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}   
module.exports.isAdmin = (req, res, next) => {
 
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    // req.flash('error', 'Access denied. Administrators only.');
    res.redirect('/home');
  }
};