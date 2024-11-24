const { v4: uuidv4 } = require("uuid");

const commentHandlers = {
  async create(req, res, articles, body, validateData) {
    if (!validateData(body, ["articleId", "text", "author"])) {
      res.writeHead(400);
      res.end(JSON.stringify({ code: 400, message: "Request invalid" }));
      return null;
    }

    const article = articles.find((a) => a.id === body.articleId);
    if (!article) {
      res.writeHead(404);
      res.end(JSON.stringify({ code: 404, message: "Article not found" }));
      return null;
    }

    const newComment = {
      id: uuidv4(),
      articleId: body.articleId,
      text: body.text,
      author: body.author,
      date: Date.now(),
    };

    article.comments.push(newComment);
    res.writeHead(201);
    res.end(JSON.stringify(newComment));
    return newComment;
  },

  async delete(req, res, articles, body, validateData) {
    if (!validateData(body, ["id", "articleId"])) {
      res.writeHead(400);
      res.end(JSON.stringify({ code: 400, message: "Request invalid" }));
      return false;
    }

    const article = articles.find((a) => a.id === body.articleId);
    if (!article) {
      res.writeHead(404);
      res.end(JSON.stringify({ code: 404, message: "Article not found" }));
      return false;
    }

    const commentIndex = article.comments.findIndex((c) => c.id === body.id);
    if (commentIndex === -1) {
      res.writeHead(404);
      res.end(JSON.stringify({ code: 404, message: "Comment not found" }));
      return false;
    }

    article.comments.splice(commentIndex, 1);
    res.writeHead(200);
    res.end(JSON.stringify({ message: "Comment deleted" }));
    return true;
  },
};

module.exports = { commentHandlers };
