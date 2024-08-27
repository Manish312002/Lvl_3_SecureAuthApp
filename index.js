import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import googleStrategy from "passport-google-oauth2"
import session from "express-session";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}))

app.get("/auth/google/secrets", passport.authenticate("google",{
  successRedirect: "/secrets",
  failureRedirect: "/login",
}))

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/secrets",async (req, res) => {
  console.log(req.user);
  if (req.isAuthenticated()) {
    const user = (req.user)
    const secret = "You have many secrets add one secret here anonymously."
    const result = await db.query("select * from userauth where email=$1",[user.email])
    const data = result.rows[0].secret
    console.log(data)
    if(data){
      res.render("secrets.ejs",{secrets:data})
    }else{  
      res.render("secrets.ejs",{secrets:secret});
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/submit", (req,res) =>{
  if(req.isAuthenticated()){
    res.render("submit.ejs")
  }else{
    res.redirect("/login")
  }
} )

app.post("/submit", async(req,res) => {
  try{
    const secret = req.body.secret;
    const result = await db.query("update userauth set secret=$1 where email=$2",[secret,req.user.email])
    res.redirect("/secrets")
  }catch(err){
    console.log(err)
  }
})

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM userauth WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      req.redirect("/login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO userauth (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log("success");
            res.redirect("/secrets");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// local OAuth 
passport.use("local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM userauth WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              //Passed password check
              return cb(null, user);
            } else {
              //Did not pass password check
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

// google OAuth2 
passport.use("google", new googleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "http://www.googleleapis.com/oauth2/v3/userinfo"
},async (accessToken, refreshToken, profile, cb) => {
  console.log(profile.email , profile.id)
  try{
    const result = await db.query("select * from userauth where email=$1",[profile.email])
    const data = result.rows

    if(data.length === 0){
      bcrypt.hash(profile.id, saltRounds,async (err,hash)=> {
        if(err){
          cb("Error hashing password:", err)
        }else{
          const newUser = await db.query("insert into userauth (email,password) values ($1,$2)",[profile.email,hash])
          cb(null, newUser.rows[0])
        }
      })
    }else{
      cb(null, data[0])
    }
  }catch(err){
    cb(err)
  }
})
)

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
