var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

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

// With Maps!!!!
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price=req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {name: name,price:price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                res.redirect("/campgrounds");
            }
        });
    });
});
// Before Maps
// //CREATE
// router.post("/", middleware.isLoggedIn, function (req, res) {
//     var name = req.body.name;
//     var image = req.body.image;
//     var description = req.body.description;
//     var id = req.user._id;
//     var username = req.user.username;
//     var price= req.body.price
//     var newCampground = {name: name,price:price, image: image, description: description, author: {id: id, username: username}};
//     Campground.create(newCampground, function (err, campground) {
//         if (err) {
//             console.log("ERRROROROROORORO: " + err);
//         } else {
//             res.redirect("/campgrounds");
//         }
//     });
//
// });

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




// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            if(err){
                req.flash("error", err.message);
                res.redirect("/campgrounds");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + updatedCampground._id);
            }
        });
    });
});


//UPDATE ROUTE BEFORE MAPS
// router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
//     Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
//         if (err) {
//             console.log(err);
//             res.redirect("/campgrounds");
//         } else {
//             res.redirect("/campgrounds/" + req.params.id); //Or updatedCamp._id
//         }
//     });
// });

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