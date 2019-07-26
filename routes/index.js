var express=require("express");
var router=express.Router();
var passport=require("passport");
var User= require("../models/user");


//Landing Page ROUTE
router.get("/", function (req, res) {
    res.render("landing");
});

//AUTH ROUTES
//Register ROUTES
router.get("/register",function(req,res){
    res.render("register");
});

router.post("/register",function(req,res){
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            req.flash("error",err.message);
            return  res.redirect("/register");
        }
        passport.authenticate("local")(req,res,function () { //Authenticates after the signing-up
            req.flash("success","Welcome to YelpCamp "+user.username);
            res.redirect("/campgrounds");
        })
    })
});

//LOGIN ROUTES

//show login form
router.get("/login",function (req,res) {

    res.render("login");
});


router.post("/login",passport.authenticate("local",{failureRedirect: "/login",failureFlash: true})
,function(req,res){
    req.flash("success","Welcome "+req.user.username);
 res.redirect("/campgrounds");
});

//LOGOUT ROUTES
router.get("/logout",function (req,res) {

    req.logout();
    req.flash("success","You've been logged out!");
    res.redirect("/");
});



module.exports=router;