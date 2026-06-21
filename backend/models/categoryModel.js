const CATEGORIES = ["Italian", "Vegan", "Dessert", "Mexican", "Asian", "American", "Mediterranean"];

function getAll() {
  return CATEGORIES;
}

function search(query) {
  const q = query.toLowerCase();
  return CATEGORIES.filter((c) => c.toLowerCase().includes(q));
}

module.exports = { getAll, search };
