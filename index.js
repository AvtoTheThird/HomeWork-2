const http = require("http");
const fs = require("fs").promises;
const { articleHandlers } = require("./Handlers/articles");
const { commentHandlers } = require("./Handlers/comments");
const { validateData, log } = require("./utils");
let articles = [];

const handlers = {
  "/sum": sum,
};
async function loadArticles() {
  try {
    const data = await fs.readFile("articles.json", "utf8");
    articles = JSON.parse(data);
  } catch (error) {
    articles = [];
    await fs.writeFile("articles.json", JSON.stringify(articles, null, 2));
  }
}

async function saveArticles() {
  await fs.writeFile("articles.json", JSON.stringify(articles, null, 2));
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));

  await new Promise((resolve) => req.on("end", resolve));
  const body = chunks.length > 0 ? JSON.parse(Buffer.concat(chunks)) : {};

  log(req.url, body).catch(console.error);

  try {
    switch (req.url) {
      case "/api/articles/readall":
        await articleHandlers.readAll(req, res, articles);
        break;
      case "/api/articles/read":
        await articleHandlers.read(req, res, articles, body, validateData);
        break;
      case "/api/articles/create":
        const newArticle = await articleHandlers.create(
          req,
          res,
          articles,
          body,
          validateData
        );
        if (newArticle) {
          saveArticles().catch(console.error);
        }
        break;
      case "/api/articles/update":
        const updated = await articleHandlers.update(
          req,
          res,
          articles,
          body,
          validateData
        );
        if (updated) {
          saveArticles().catch(console.error);
        }
        break;
      case "/api/articles/delete":
        const deleted = await articleHandlers.delete(
          req,
          res,
          articles,
          body,
          validateData
        );
        if (deleted) {
          saveArticles().catch(console.error);
        }
        break;
      case "/api/comments/create":
        const newComment = await commentHandlers.create(
          req,
          res,
          articles,
          body,
          validateData
        );
        if (newComment) {
          saveArticles().catch(console.error);
        }
        break;
      case "/api/comments/delete":
        const commentDeleted = await commentHandlers.delete(
          req,
          res,
          articles,
          body,
          validateData
        );
        if (commentDeleted) {
          saveArticles().catch(console.error);
        }
        break;
      default:
        res.writeHead(404);
        res.end(JSON.stringify({ code: 404, message: "Not found" }));
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(JSON.stringify({ code: 500, message: "Internal server error" }));
  }
  parseBodyJson(req, (err, payload) => {
    const handler = getHandler(req.url);

    handler(req, res, payload, (err, result) => {
      if (err) {
        res.statusCode = err.code;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(err));

        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result));
    });
  });
});

function getHandler(url) {
  return handlers[url] || notFound;
}

function sum(req, res, payload, cb) {
  const result = { c: payload.a + payload.b };

  cb(null, result);
}

function notFound(req, res, payload, cb) {
  cb({ code: 404, message: "Not found" });
}

function parseBodyJson(req, cb) {
  let body = [];
  if (!body) return;
  req
    .on("data", function (chunk) {
      body.push(chunk);
    })
    .on("end", function () {
      body = Buffer.concat(body).toString();

      let params = JSON.parse(body);

      cb(null, params);
    });
}
loadArticles()
  .then(() => {
    const PORT = 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
