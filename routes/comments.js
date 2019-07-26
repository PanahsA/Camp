var express=require("express");
var router= express.Router({mergeParams:true});
var Campground=require("../models/campground");
var Comment=require("../models/comment");
var middleware=require("../middleware");



//NEW ROUTE
router.get("/new",middleware.isLoggedIn,function (req,res) {
    var id = req.params.id;
    Campground.findById(id,function (err,foundCampground) {
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{foundCampground:foundCampground});

        }
    })
});

//CREATE ROUTE
router.post("/",middleware.isLoggedIn,function(req,res){
    var id=req.params.id;
    Campground.findById(id,function (err,foundCampground) {
        if(err){
            console.log(err);
            redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment, function (err,newComment) {
                if(err){
                    console.log(err);
                }else{
                    //add username and id to comment and then save it
                    newComment.author.id=req.user._id;
                    newComment.author.username=req.user.username;
                    console.log(req.user);
                    newComment.save();
                    foundCampground.comments.push(newComment); //IMPORTANT HERE TAKES PLACE THA ASSOCIATION BETWEEN COMMENT AND CAMPGROUND
                    foundCampground.save();
                    // res.render("campgrounds/show",{foundCampground:foundCampground});
                    req.flash("success","Succesfully added comment!")
                    res.redirect("/campgrounds/"+foundCampground._id);
                }
            });
        }
    })
});

//EDIT ROUTE
router.get("/:comment_id/edit",middleware.checkCommentsOwnership,function (req,res) {
    Campground.findById(req.params.id,function (err,foundCampground) {
        if(err){
            res.redirect("/campgrounds/"+req.params.id);
        }else{
            Comment.findById(req.params.comment_id,function(err,foundComment){
                if(err){
                    console.log("error: "+err);
                }else{
                    res.render("comments/edit",{foundComment:foundComment,foundCampground:foundCampground});
                }
            })
        }
    })
});

//UPDATE ROUTE
router.put("/:comment_id",middleware.checkCommentsOwnership,function (req,res) {
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function (err,updatedComment) {
        if(err){
            res.redirect("/back");
        }else{
            res.redirect("/campgrounds/"+req.params.id)
        }
    })
});

//DELETE ROUTE
router.delete("/:comment_id",middleware.checkCommentsOwnership,function (req,res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("/campgrounds/" + req.params.id);
            console.log(err);
        } else {

            req.flash("success","Succesfully deleted comment!")

            res.redirect("/campgrounds/"+ req.params.id);
        }
    })
})



module.exports=router;