const http = require("http");
const path = require("path");
const fs = require("fs");
const Db = require("./dbconnect");

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
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200, { "Content-Type": "application/json" });
        let body = '';
        req.on('data', chunck =>{
          body += chunck.toString();
        });
        req.on('end', async()=>{
            const data = JSON.parse(body);
            const ret = await Db.SignUp(data);
            res.write(JSON.stringify(ret));
            res.end();
        });
      }
      break;
    }
    
    case "/logIn":{
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, { "Content-Type": "application/json" });
      let body = '';
      req.on('data', chunck =>{
        body += chunck.toString();
      });
      req.on('end', async()=>{
          const data = JSON.parse(body);
          console.log('Data: ', data);
          const ret = await Db.LogIn(data);
          if(ret.err){
            console.log('Error on querry: ', ret.err);
          }else{
            console.log('Delivered: ', ret);
          }
          res.write(JSON.stringify(ret));
          res.end();
      });
      break;
    }
    
    case "/get":{
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, { "Content-Type": "application/json" });
      let body = '';
      req.on('data', chunck =>{
        body += chunck.toString();
      });
      req.on('end', async()=>{
          const data = JSON.parse(body);
          console.log('Data: ', data);
          const ret = await Db.Get(data);
          if(ret.err){
            console.log('Error on querry: ', ret.err);
          }else{
            console.log('Delivered: ', ret);
          }
          res.write(JSON.stringify(ret));
          res.end();
      });
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