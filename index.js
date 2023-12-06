process.stdin.setEncoding("utf8");

const bodyParser = require("body-parser"); /* To handle post parameters */

const http = require("http");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const portNumber = 5000;
const httpSuccessStatus = 200;
const express = require("express");
const app = express();

const { MongoClient, ServerApiVersion } = require("mongodb");
const user = process.env.MONGO_DB_USERNAME;
const pass = process.env.MONGO_DB_PASSWORD;
console.log(pass);
const databaseAndCollection = {
    db: process.env.MONGO_DB_NAME,
    collection: process.env.MONGO_COLLECTION,
  };
const uri = `mongodb+srv://adviks15:${pass}@cluster0.8pwhehu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
//console.log(database);
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

async function main() {

    await client.connect()
  app.get("/", (req, res) => {
    res.render("homepage");
  });

  app.use(bodyParser.urlencoded({ extended: true }));

  app.get("/bookreq", async (req, res) => {
    const title = req.query.title;
    const fetch = (await import("node-fetch")).default; // Dynamic import for node-fetch

    const url = `https://hapi-books.p.rapidapi.com/search/${req.query.searchtext}`;
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "27ccfcebc1mshbf82c155fb8a73cp17f859jsnc6674eff6755",
        "X-RapidAPI-Host": "hapi-books.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      //console.log(result);

      let output = "<form action='/add-to-library' method='post'>";

      result.forEach((prop, index) => {
        const bookIdentifier = encodeURIComponent(
          `${prop.name}|||${prop.authors[0]}|||${prop.cover}`
        );

        output += `
            <div class="result-item">
                <h2>${prop.name}</h2><br>
                <p>${prop.authors[0]}</p><br>
                <img src='${prop.cover}'><br>
                Add to Library <input type='checkbox' name='selectedBook' value='${bookIdentifier}'>
            </div>
        `;
      });
      output +=
        "<button type='submit' class='submit-button'>Add Selected To Library</button></form>";
      res.render("searchoutput", { output: output });
    } catch (error) {
      console.error(error);
    }
  });

  app.post("/add-to-library", async (req, res) => {
    let data = req.body.selectedBook;

    if (data) {
      const books = Array.isArray(data) ? data : [data];
      for (const bookIdentifier of books) {
        const [name, author, cover] =
          decodeURIComponent(bookIdentifier).split("|||");
        console.log(`Book name: ${name}, Author: ${author}, Cover: ${cover}`);
        try {
            await client
              .db(databaseAndCollection.db)
              .collection(databaseAndCollection.collection)
              .insertOne({
                title: name,
                author: author,
                cover: cover,
                
              });
          } catch (e) {
            console.error(e);
            client.close();
          }
        }
    }
  });

  app.get("/mybooks", async (req, res) =>{
    const books = await client
    .db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find({})
    .toArray()

    res.render("mybooks", {books: books})

    
  });

  app.listen(portNumber);
  console.log(`Web server is running at http://localhost:${portNumber}`);
  console.log("Type stop to shutdown the server: ");
}


main().catch(console.error);
