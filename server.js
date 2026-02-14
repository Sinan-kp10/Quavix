import express from "express"
import path from "path"
import expressLayouts from "express-ejs-layouts"
import { fileURLToPath } from "url"
import userRoutes from "./src/routes/usersRoutes.js"
import session from "express-session"
import adminRoutes from "./src/routes/adminRoutes.js"
import dotenv from "dotenv"
import connectDB from "./src/config/db.js"
import nocache from "nocache";
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app=express()
dotenv.config();
import passport from "./src/config/passport.js";



app.use(nocache());


app.use(expressLayouts);
app.set("layout", "layout/layout"); 

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine","ejs")
app.set("views", path.join(__dirname, "src/views"));

app.use(session({
  secret:process.env.SESSION_SECRET,  
  resave: false,
  saveUninitialized: true,
  
}));
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.user =  req.session.user ||req.user || null;
  next();
});


app.use("/",userRoutes)
app.use("/",adminRoutes)

connectDB();
const PORT = process.env.PORT
app.listen(PORT,console.log("http://localhost:3000/"))