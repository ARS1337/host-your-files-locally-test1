const express = require("express");
const checker = require("./fileChecker");
const lister = require("./fileLister");
const fs = require("fs");
const { dirname } = require("path");
const app = express();
const port = 3000;

app.get("/*", (req, res) => {
  console.log("requested");
  res.sendFile(__dirname + "/data.html", (err) => {
    if (err) {
      console.log("An error occured!",err);
    } else {
      console.log("request sent without error");
      res.end();
    }
  });
});

app.get("/widget/*", (req, res) => {
  console.log("floorplan");
  res.sendFile(__dirname + "/floorplan.html", (err) => {
    if (err) {
      console.log("An error occured!",err);
    } else {
      console.log("request sent without error" );
      res.end();
    }
  });
});

app.get("/handler", (req, res) => {
  let value = req.query.value;
  console.log("value is " + value);

  let path = value;
  checker(path)
    .then((r) => {
      if (r === true) {
        //ie its a file
        let tt = `\"${value.split("/").pop()}\"`;
        res.writeHead(200, {
          "Content-Disposition": `attachment;filename=${tt}`,
        });
        fs.createReadStream(path).pipe(res);
      } else {
        let newPath = path + "/";
        console.log(newPath);
        res.cookie("currPath", path + "/");
        lister(path)
          .then((r1) => {
            r1.forEach((x) => {
              let tempString = `<a href="/handler?value=${
                newPath + x
              }">${x}</a>`;
              res.write(tempString + "<br/>");
            });
            res.end();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log("Path doesn't exist" + err);
      res.write("Path doesn't exist");
      res.end();
    });
});

app.listen(port, () => {
  console.log("server started");
});
