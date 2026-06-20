const { categories } = require("../data/mockData");

function getAll() {
  return categories;
}

function search(query) {
  const q = query.toLowerCase();
  return categories.filter((c) => c.toLowerCase().includes(q));
}

module.exports = { getAll, search };
