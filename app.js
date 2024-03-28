
if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

 const MONGO_URL = "mongodb://127.0.0.1:27017/wonder";



main().then(() => {
    console.log("connected to database");
}).catch(err => {
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));





// const store = MongoStore.create({
//     mongourl: dburl,
//     crypto:{
//         secret:"mysupersecretcode"
//     },
//     touchAfter: 24 * 3600,
//     })
    
// store.on("error",() => {
//     console.log("error in mongo session store",err)
// })


const sessionOptions = {
    secret:"mysupersecretcode",
    resave: false,
    saveUninitialized : true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
    },
};


// app.get("/",(req,res) => {
//     res.send("I am Root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
     next();
})

// app.get("/demousers", async (req,res) => {
//     let fakeUser = new User({
//        email:"rohithandage2002@gmail.com",
//        username:"delta-student",
//     })

// let registerUser = await User.register(fakeUser,"helloWorld")
// res.send(registerUser);
// })


app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter)


app.all("*",(req,res,next) => {
    next(new ExpressError(404,"page Not Found!"));
})
app.use((err,req,res,next)=>{
    let {statusCode = 600 ,message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
})
app.listen(8080,() =>{
    console.log("server is listening to port 8080");
})