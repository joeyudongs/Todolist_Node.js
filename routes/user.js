var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Todo = require("../models/Todo");


router.use('/', function (req, res, next) {
    console.log('Request URL:', req.originalUrl)
    next()
  }, function (req, res, next) {
    console.log('Request Type:', req.method)
    next()
})

router.get("/", async function (req, res, next) {
  const users = await User.find().exec();
  return res.status(200).json({ users: users });
});

router.get("/:userId", async function (req, res, next) {
    const todos = await Todo.find().where("author").equals(req.payload.id).exec();
    return res.status(200).json({ todos: todos });
})

module.exports = router;