const { v4: uuidv4 } = require("uuid");

const articleHandlers = {
  async readAll(req, res, articles) {
    res.writeHead(200);
    res.end(JSON.stringify(articles));
  },

  async read(req, res, articles, body, validateData) {
    if (!validateData(body, ["id"])) {
      res.writeHead(400);
      res.end(JSON.stringify({ code: 400, message: "Request invalid" }));
      return;
    }

    const article = articles.find((a) => a.id === body.id);
    if (!article) {
      res.writeHead(404);
      res.end(JSON.stringify({ code: 404, message: "Article not found" }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify(article));
  },

  async create(req, res, articles, body, validateData) {
    if (!validateData(body, ["title", "text", "author"])) {
      res.writeHead(400);
      res.end(JSON.stringify({ code: 400, message: "Request invalid" }));
      return null;
    }

    const newArticle = {
      id: uuidv4(),
      title: body.title,
      text: body.text,
      author: body.author,
      date: Date.now(),
      comments: [],
    };

    articles.push(newArticle);
    res.writeHead(201);
    res.end(JSON.stringify(newArticle));
    return newArticle;
  },

  async update(req, res, articles, body, validateData) {
    if (!validateData(body, ["id", "title", "text", "author"])) {
      res.writeHead(400);
      res.end(JSON.stringify({ code: 400, message: "Request invalid" }));
      return false;
    }

    const index = articles.findIndex((a) => a.id === body.id);
    if (index === -1) {
      res.writeHead(404);
      res.end(JSON.stringify({ code: 404, message: "Article not found" }));
      return false;
    }

    articles[index] = {
      ...articles[index],
      title: body.title,
      text: body.text,
      author: body.author,
    };

    res.writeHead(200);
    res.end(JSON.stringify(articles[index]));
    return true;
  },

  async delete(req, res, articles, body, validateData) {
    if (!validateData(body, ["id"])) {
      res.writeHead(400);
      res.end(JSON.stringify({ code: 400, message: "Request invalid" }));
      return false;
    }

    const index = articles.findIndex((a) => a.id === body.id);
    if (index === -1) {
      res.writeHead(404);
      res.end(JSON.stringify({ code: 404, message: "Article not found" }));
      return false;
    }

    articles.splice(index, 1);
    res.writeHead(200);
    res.end(JSON.stringify({ message: "Article deleted" }));
    return true;
  },
};

module.exports = { articleHandlers };
