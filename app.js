//Requirements
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var Comment= require("./models/comment");
var Campground = require("./models/campground");
var User= require("./models/user");
var seedDB=require("./seeds");
var passport=require("passport");
var LocalSrategy=require("passport-local");
var methodOverride = require("method-override");
var flash = require('connect-flash');




var campgroundsRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes"); //or index for all purpose routes
var commentRoutes = require("./routes/comments");

var url =process.env.DATABASEURL|| "mongodb://localhost:27017/yelp_camp";
mongoose.connect(url,
    {
        useNewUrlParser: true,
        useCreateIndex: true
    }).then(() => {
    console.log("Connected to db: "+url);
}).catch(err => {
    console.log("error: ", err.message);
});
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

//Passport configuration
app.use(require("express-session")({
    secret: "Onion style",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalSrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//IMPORTANT adds currentUser,error and success vars in every template
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


// POSITIONS OF COMPONENTS IS SUPER IMPORTANT
app.use("/campgrounds", campgroundsRoutes);
app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);



// seedDB();



//====================
//SERVER LISTENING
//====================


let port = process.env.PORT;
app.set('port',3000||process.env.PORT);

app.listen(port,function () {
    console.log("Server is listening");
});
