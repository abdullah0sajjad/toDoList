//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const lodash = require('lodash');
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const day = date.getDate();

mongoose.connect("mongodb+srv://admin-abdullah:admin123@cluster0.p9b8ofw.mongodb.net/todolistDB", (err) => {
  if (err) {
    console.log("Error is "+err);
  }else {
    console.log("Successful");
  }
});
mongoose.set('strictQuery', true);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your TO-Do List!",
});

const item2 = new Item({
  name: "Hit the + button to add new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {


Item.find({}, (err,result) => {

  if (result.length === 0) {
    Item.insertMany(defaultItems, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully inserted items.");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: day, newListItems: result});
  }
});



});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const list = req.body.listName;
  const newitem = new Item({
    name: item
  });
  if (list === day) {
    newitem.save();
    res.redirect("/")
  }else{
    List.findOne({name: list}, (err, result)=>{
      result.items.push(newitem);
      result.save();
      res.redirect("/"+list);
    });
  }

});

app.post("/delete", (req, res) => {
  const itemId = req.body.checkItem;
  const list = req.body.listName;
  if (list === day) {
    Item.findByIdAndDelete(itemId, (err, docs)=>{
      if (err) {
        console.log(err);
      }else{
        res.redirect("/");
      }
    });
  }else {
    List.findOneAndUpdate({name: list}, {$pull: {items: {_id: itemId}}}, (err, result)=>{
      if (err) {
        console.log(err);
      }else {
        res.redirect("/"+list);
      }
    });
  }
});

app.get("/:newListParameter", (req, res) =>{
  const newListName = lodash.capitalize(req.params.newListParameter);

  List.findOne({name:newListName}, (err, result)=>{
    if (err) {
      console.log(err);
    }else {
      if (result) {
          res.render("list", {listTitle: newListName, newListItems: result.items});
      }else{
        const list = new List({
          name: newListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+newListName)
      }
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
