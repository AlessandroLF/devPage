const http = require("http");
const path = require("path");
const fs = require("fs");
const db = require("./dbconnect");

const server = http.createServer((req, res) => {
  console.log("Request: " + req.url);
  let contentType = "text/html";
//Router, decide wich code to run for the requested url
  switch (req.url){
    case "/": //Home page
      res.writeHead(200, { "Content-Type": contentType });
      fs.readFile(path.join("public", "build", "index.html"), (err, content) => {
        if(err){
            console.log(err);
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
        }else
            res.end(content);
      });
      break;
    
    case "/signUp":{
      if(req.method === 'POST'){
        let body = '';
        req.on('data', chunck =>{
          body += chunck.toString();
        });
        req.on('end', async()=>{
            const data = JSON.parse(body);
            const ret = await db.SignUp(data);
            console.log(JSON.stringify(ret.rows));
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(ret.rows));
        });
      }
      break;
    }
    
    case "/logIn":{
        let body = '';
        req.on('data', chunck =>{
          body += chunck.toString();
        });
        req.on('end', ()=>{
            const data = JSON.parse(body);
            db.LogIn(data, (ret)=>{
              console.log(JSON.stringify(ret));
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(ret));
            });
        });
      break;
    }
    
    case "/get":{
      const data = { cols, cond, val } = req.body;
      const ret = db.Get(data);
      console.log(ret);
      break;
    }

      //REST API here

    default:{ //If the request is not a reserved word return the requested asset if it's public

      //Correctly set the response's content type
      let extname = path.extname(req.url);
      switch (extname) {
        case ".js":
          contentType = "text/javascript";
          break;
        case ".css":
          contentType = "text/css";
          break;
        case ".json":
          contentType = "application/json";
          break;
        case ".pdf":
          contentType = "application/pdf";
          break;
        case ".png":
          contentType = "image/png";
          break;
        case ".jpg":
          contentType = "image/jpg";
          break;
      }
      if (contentType == "text/html" && extname == "") req.url += ".html";
      fs.readFile(path.join("public", req.url), (err, content) => {
        if (err) {
          if (err.code == "ENOENT") {
            console.log("404");
            fs.readFile(path.join("public", "404.html"), (err, content) => {
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end(content, "utf8");
              }
            );
          }
          else{
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
          }
        } else {
          res.writeHead(200, { "Content-Type": contentType });
          res.end(content, "utf8");
        }
      });
    }
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));