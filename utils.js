const fs = require("fs").promises;
async function log(url, body) {
  const timestamp = new Date().toISOString();
  const logEntry = `
[${timestamp}]
URL: ${url}
Body: ${JSON.stringify(body, null, 2)}
----------------------------------------
`;

  await fs.appendFile("server.log", logEntry);
}

function validateData(data, requiredFields) {
  if (!data || typeof data !== "object") return false;
  return requiredFields.every((field) => {
    const value = data[field];
    if (value === undefined || value === null) return false;
    if (typeof value === "string" && !value.trim()) return false;
    return true;
  });
}

module.exports = { validateData, log };
