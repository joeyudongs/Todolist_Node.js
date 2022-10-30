var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const Todo = require("../models/Todo");

const privateKey = process.env.JWT_PRIVATE_KEY;

/*The middle should be declare above routers*/
router.use(function (req, res, next) {
  console.log(req.header("Authorization"));//"Authorization"是key，会输出对应的value；
  if (req.header("Authorization")) {
    try {
      req.payload = jwt.verify(req.header("Authorization"), privateKey, {
        algorithms: ["RS256"],
      });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

function success(res, payload) {
  return res.status(200).json(payload)
}
/* GET home page. */
router.get("/", async function (req, res, next) {
  const todos = await Todo.find().where("author").equals(req.payload.id).exec();
  return res.status(200).json({ todos: todos });
});

router.get("/:todoId", async function (req, res, next) {
  // const todos = await Todo.find().where("author").equals(req.payload.id).exec();
  // mongoose find query to retrive todo where todoId == req.params.todoId
  const todo = await Todo.findOne()
    .where("_id")
    .equals(req.params.todoId)
    .exec();
  return res.status(200).json(todo);
});

router.post("/", async function (req, res, next) {
  const todo = new Todo({
    title: req.body.title,
    content: req.body.content,
    author: req.payload.id,
    complete: req.body.complete,
    completedOn: req.body.completedOn,
  });//object， key-value pair;

  await todo
    .save()
    .then((savedTodo) => {
      return res.status(201).json({
        id: savedTodo._id,
        title: savedTodo.title,
        content: savedTodo.content,
        author: savedTodo.author,
        complete: savedTodo.complete,
        completedOn: savedTodo.completeOn,
      });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
});

router.delete("/:todoId", async (req, res, next) => {
  try {
    await Todo.findByIdAndRemove(req.params.todoId);
    return success(res, "Todo deleted!");
  } catch (error) {
    next({ status: 400, message: "Todo delete failed~!" });
  }
});

router.put('/:todoId', async (req,res) => {
  const { todoId } = req.params;
  const { complete, completedOn } = req.body;

  await Todo.findOneAndUpdate( {_id: todoId}, {complete: complete, completedOn: completedOn} ).exec((error, todo) => {
      if(error)
        return res.status(500).json({code: 500, message: 'Error occured updating todo', error: error})
      res.status(200).json(todo)
    });
})

module.exports = router;
