const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))

mongoose.connect("mongodb+srv://admin-naazleen:Test123@naazleen.0x6kl.mongodb.net/todolistDB", { useNewUrlParser: true})

const itemsSchema = {
    name: String
}

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema)

const item1 = new Item({
    name: "Add Todo using + icon"
})

const item2 = new Item({
    name: "Strike the todo by clicking the checkbox"
})

const item3 = new Item({
    name: "Hit trash to delete the todo"
})

const defaultItems = [item1, item2, item3]


app.get("/", (req, res) => {
    Item.find({}, (err, foundItems) => {

        if(foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if(err) {
                    console.log(err)
                } else {
                    console.log("All the items are inserted")
                }
            })
            res.redirect("/")
        } else {
            res.render("list.ejs", {listTitle: "Today", newItems: foundItems})
        }
    })
})

app.get("/about", (req, res) => {
    res.render("about.ejs")
})

app.post("/", (req, res) => {
    let itemName = req.body.newItem
    let listName = req.body.list

    console.log(listName)

    // Create new Item document
    const newItem = new Item({
        name: itemName
    })

    if(listName === "Today") {
        newItem.save();
        res.redirect("/")
    } else {
        List.findOne({name: listName}, (err, foundList) => {
            console.log(foundList)
            foundList.items.push(newItem)
            foundList.save()
            res.redirect("/" + listName)
        })
    }

})

app.post("/delete", (req, res) => {
    const deletedItemId = req.body.deleteItem
    const listName = req.body.listName
    
    if(listName === "Today") {
        Item.findByIdAndDelete(deletedItemId, (err) => {
            if(!err) {
                console.log("Successfully deleted item with id: " + deletedItemId)
            }
        })

        res.redirect("/")
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deletedItemId}}}, (err, foundList) => {
            if(!(err)) {
                res.redirect("/" + listName)
            }
        })
    }
})

app.get("/:customListName", (req, res) => {
    const listName  = _.capitalize(req.params.customListName)

    List.findOne({name: listName}, (err, foundList) => {
        if(!err) {
            if(!foundList) {
                const list = new List({
                    name: listName,
                    items: defaultItems
                })
            
                list.save()
                res.redirect("/" + listName)
            } else {
                res.render("list", {listTitle: listName, newItems: foundList.items})
            }
        } 
    })
})


app.listen(3000, () => {
    console.log("Server is up & running on Port: 3000")
})