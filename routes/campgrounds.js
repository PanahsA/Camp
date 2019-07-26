var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware")

//INDEX - show all campgrounds
router.get("/", function (req, res) {
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds}); //Passport adds user to req
        }
    })
});

//NEW, submits to CREATE route
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");

});

//CREATE
router.post("/", middleware.isLoggedIn, function (req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var id = req.user._id;
    var username = req.user.username;
    var price= req.body.price
    var newCampground = {name: name,price:price, image: image, description: description, author: {id: id, username: username}};
    Campground.create(newCampground, function (err, campground) {
        if (err) {
            console.log("ERRROROROROORORO: " + err);
        } else {
            res.redirect("/campgrounds");
        }
    });

});

//SHOW, if this was above NEW /new would not work
router.get("/:id", function (req, res) { //:id means anything
    //find camp with provided id
    var id = req.params.id;
    Campground.findById(id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {foundCampground: foundCampground});
        }
    });

    // show template with that campground
});

//EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        res.render("campgrounds/edit", {campground: campground});
    });
});


//UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id); //Or updatedCamp._id
        }
    });
});

//DELETE ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/campgrounds/" + req.params.id)
        } else {
            res.redirect("/campgrounds");
        }
    })
});


module.exports = router;