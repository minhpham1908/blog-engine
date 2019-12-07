var fs = require("fs")
var express = require("express");
var app = express();
var bodyParser = require("body-parser")
var mysql = require("mysql")
var marked = require("marked")
var favicon = require('serve-favicon')
var path = require("path")
var sqlUtil = require("./sql")

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(favicon(path.join(__dirname, "public", "favicon", "favicon.ico")))

var info = {
    host: "localhost",
    user: "root",
    password: "minh1998",
    database: "blogdb"
}


//setup marked
var renderer = new marked.Renderer()

//overriding

renderer.link = (href) => {
    var id = href.substring(1)
    return `<a href="${href}" id="${id}"></a>`
}
marked.setOptions({
    renderer: renderer,
    headerIds: true
})


sqlUtil.connect2db()

app.get("/", async function (req, res) {
    var posts = await sqlUtil.getPosts();
    res.render("home", { posts: posts })
})

app.get("/about", (req, res) => {
    res.render("notfound")
})



app.get("/post", (req, res) => {
    res.redirect("/")
})

app.get("/post/:postLink", async (req, res) => {
    console.log("PARAM:", req.params)
    var link = req.params.postLink;
    var path = __dirname + "/posts/" + link + ".md"
    var postInfo = await sqlUtil.getThePost(link)
    var data = fs.readFileSync(path, "utf-8")
    data = data.toString();
    data = marked(data, (err, result) => {
        if (err) throw err
        postInfo.content = result;
        res.render("post-page", { postInfo: postInfo })
    })
})

app.get("/tags/", function (req, res) {
    res.render("notfound")
})

app.get("/tags/:tag", async function (req, res) {
    console.log("Param:", req.params)
    var tag = req.params.tag;
    var posts = await sqlUtil.getPostsByTag(tag)
    var tags = await sqlUtil.getNumberofTag()
    console.log(tag)
    console.log(posts)
    console.log(tags)
    res.render("tags", { tag: tag, posts: posts, tags: tags });
})

app.get("*", function (req, res) {
    res.redirect("/")
})

app.listen(3000, "localhost", function () {
    console.log("Listening on port 3000");
})

// connection.end(function(err) {
//     if (err) {
//       return console.log('error:' + err.message);
//     }
//     console.log('Close the database connection.');
//   });
