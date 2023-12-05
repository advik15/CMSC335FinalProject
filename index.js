

process.stdin.setEncoding("utf8");


const bodyParser = require("body-parser"); /* To handle post parameters */


const http = require('http');
const path = require("path");

const portNumber = 5000;
const httpSuccessStatus = 200;
const express = require("express");
const app = express();


app.set("views",path.resolve(__dirname,"templates"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.render("homepage");
});

app.use(bodyParser.urlencoded({extended:true}));


app.get("/bookreq", async (req, res) =>{
  const title = req.query.title
  const fetch = (await import('node-fetch')).default; // Dynamic import for node-fetch


    const url = `https://hapi-books.p.rapidapi.com/search/${req.query.searchtext}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '27ccfcebc1mshbf82c155fb8a73cp17f859jsnc6674eff6755',
        'X-RapidAPI-Host': 'hapi-books.p.rapidapi.com'
      }
    };
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(result);

        let output = "<form action='/add-to-library' method='post'>";
        
        result.forEach((prop, index) => {
            const bookIdentifier = encodeURIComponent(`${prop.name}-${prop.authors[0]}-${prop.cover}`);

            output += `
                <div>
                    <h2>${prop.name}</h2><br>
                    <p>${prop.authors[0]}</p><br>
                    <img src='${prop.cover}'><br>
                    Add to Library <input type='checkbox' name='selectedBook' value='${bodyIdentifier}'>
                </div>
            `;
        });
        output += "<button type='submit'>Submit</button></form>";
        res.render("searchoutput", {output:output});
    } catch (error) {
        console.error(error);
    }

});
app.listen(portNumber); 
console.log(`Web server is running at http://localhost:${portNumber}`);
console.log("Type stop to shutdown the server: ");


