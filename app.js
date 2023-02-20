const express = require("express")
const bodyParser = require ("body-parser")
const mongoose = require('mongoose')
const _ = require("lodash")
const app =express()

// let items =["food list"];
// let workItems =[];
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}))

app.use(express.static("public"));

// Conexion BDmongoose
const MONGO_URL =
  "mongodb+srv://ssfuentes99:11perritos@cluster0.lzaad5z.mongodb.net/todoList";


  mongoose.set("strictQuery", true);
  mongoose.connect(MONGO_URL)
  .then(()=>{
    console.log('conectado a la bd')
  }).catch(err=>{
    console.error(err)
  })
// Conexion BDmongoose

// Modelo
const todolSSchema= new mongoose.Schema({
    activity:String
});

const Item = mongoose.model("Item",todolSSchema);
const item1 = new Item({
    activity: "Primera"
});

const item2 = new Item({
    activity: "Segunda"
});

const defaultItems=[item1,item2];


const  listSchema ={
    name: String,
    items:[todolSSchema]
}
const List = mongoose.model("List",listSchema);


// Metodos y funciones 
app.get("/",  function(req,res){


     Item.find({},async function(err,foundItems){
        if(foundItems.length===0){

            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log("Succdessfully saved default items to db")
                }
            })
        res.redirect("/");
        }
        else{
            res.render("list", {kindofday: "Today", newlistItem:foundItems})
        }
       
    });
    // const date = new Date()
// let options ={
//     weekday:"long",
//     day:"numeric",
//     month:"long"
// };
// let day = date.toLocaleDateString("en-US", options);
    // res.render("list", {kindofday: "Today", newlistItem:items})   
})
app.post("/",function(req, res){
    const itemName =req.body.newItem;
    const  listName = req.body.list;

    const item = new Item({
        activity:itemName
    }) 

    if(listName==="Today"){
        insertar(item);
        console.log(item);
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
       foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
        });
    }
       
})

app.get("/work", function(req,res){
    todolSSchema.find({},function(err,foundItems){
        res.render("list", {kindofday:"Work List", newlistItem:foundItems})
      })
       
})
app.get("/:customListName",function(req,res){
   
    const customListName = _.capitalize(req.params.customListName);
    
     List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                res.render("List",{kindofday: foundList.name, newlistItem:foundList.items});
            }
        }
     });

    
})

app.post("/work",function(req, res){

    let item =req.body.newItem;
    insertar(item);

    res.redirect("/work");
})





app.post("/delete",function(req,res){
  
    const checkedItemId =req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("succesfully deleted element");
                res.redirect("/");
            }
           
        });
    }
    else{
        Item.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
    
});

async function insertar(respuesta){

      const Activity = mongoose.model("items",todolSSchema)
    
      const activity = new Activity({
        activity:respuesta
      })
    
      activity.save(function(err){
        if(err){
            console.log(err)
        }else{
            console.log("succesfully insert")
        }
      });
}

app.listen(3000, function(){
    console.log("app run port 3000")
})

// let port = process.env.PORT;
// if(port ==null || port==""){
//     port=3000;
// } 
// app.listen(port,function(){
//     console.log("Server has started")
// })