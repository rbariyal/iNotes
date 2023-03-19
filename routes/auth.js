const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
// const dotenv = require("dotenv")
// dotenv.config()
// const secret=process.env.JWT_SECRET


const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const JWT_SECRET = "helloworld$oy";

//Create a user using:POST "/api/auth/createuse" .No login required
//Route1
router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("password", "Password must be alleast 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    //if there are error return bad request and error
    const errors = validationResult(req);
    let success=false;
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    //Check whether user with same email exits already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({success, error: "User already exits" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
success=true
      res.json({success, authtoken });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server Error ");
    }
  }
);

//authenticate a userusing:POST "/api/auth/login"
//Route2
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success=false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({success, error: "Try to login with correct credentials" });
      }
      const passwordcompare = await bcrypt.compare(password, user.password);
      if (!passwordcompare) {
        return res
          .status(400)
          .json({success, error: "Try to login with correct credentials" });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(payload, JWT_SECRET);
      success=true;
      res.json({success, authtoken });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server Error ");
    }
  }
);

//Route 3;get LoggedIn User Details using Post '/api/auth/getuser' Login require
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userid = req.user.id;
    const user = await User.findById(userid).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server Error ");
  }
});
module.exports = router;
