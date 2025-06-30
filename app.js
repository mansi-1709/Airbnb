if(process.env.NODE_ENV != "production"){
   require('dotenv').config();
}


const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStratergy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLAS_DB_URL;

app.set("view engine" ,"ejs");
app.set("views" , path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname , "public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

let port = 8080;

main()
.then((res)=>{
    console.log("working sucessfully");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const store =  MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret : process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", ()=>{
   console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expire : Date.now() + 7 * 24 *60 *60 *1000,
        maxAge:  7 * 24 *60 *60 *1000,
        httpOnly :true,
    },
};

// app.get("/" , (req,res) =>{
//     res.send("request working");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser" , async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username:"delta-student"
//     });

//     let registeredUser = await User.register(fakeUser , "helloworld");
//     res.send(registeredUser);
// })

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);

app.use((err, req, res, next) => {
    let { status = 500, message = "something went wrong" } = err;
    res.status(status).render("error", { message });
    //  res.status(status).send(message);
});


// Catch-all route
// app.all("*", (req, res, next) => {
//     console.log("⚠️ Route not matched:", req.originalUrl);
//     next(new ExpressErrors(404, "Page Not Found"));
// });

app.listen(port , ()=>{
    console.log(`listening to port ${port}`);
});
