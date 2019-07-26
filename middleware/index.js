var middlewareObj = {};
var Campground=require("../models/campground");
var Comment=require("../models/comment");

middlewareObj.checkCampgroundOwnership = function (req, res, next) { //In another ide you must require the models

    if (req.isAuthenticated()) {//If you are logged in proceed to (IF you are authorized) edit
        console.log("Found campground before the isAuthenticated() process: "+req.params.id);

        Campground.findById(req.params.id, function (err, campground) {
            console.log("Found campground during the isAuthenticated() process: "+req.params.id);
            if (campground.author.id.equals(req.user._id)) {//IF YOU ARE AUTHORIZED
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    next();
                }

            } else {
                req.flash("error","Permission denied!")
                res.redirect("back");
            }
        });

    } else {
        req.flash("error","Please Login first!")

        res.redirect("back");
    }
};

middlewareObj.checkCommentsOwnership = function (req, res, next) {

    if (req.isAuthenticated()) {//If you are logged in proceed to (IF you are authorized) edit
        Comment.findById(req.params.comment_id, function (err, comment) {
            if (comment.author.id.equals(req.user._id)) {//IF YOU ARE AUTHORIZED
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    next();
                }

            } else {

                res.redirect("back");
            }
        });

    } else {
        req.flash("error","Please Login fireest!")
        res.redirect("back");
    }

};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error","Please Login first!");
    res.redirect("/login");
};



module.exports =middlewareObj;