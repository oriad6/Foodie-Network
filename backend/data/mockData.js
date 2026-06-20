const users = [
  {
    id: 1,
    username: "chef_maria",
    displayName: "Maria Rossi",
    avatar: "https://placehold.co/150x150?text=Maria",
    bio: "Italian cuisine lover. Nonna's recipes with a modern twist.",
    followers: [2, 3],
    following: [2],
    rating: 4.8,
  },
  {
    id: 2,
    username: "vegan_dan",
    displayName: "Dan Green",
    avatar: "https://placehold.co/150x150?text=Dan",
    bio: "Plant-based chef. Making vegan food exciting!",
    followers: [1],
    following: [1, 3],
    rating: 4.5,
  },
  {
    id: 3,
    username: "baker_sarah",
    displayName: "Sarah Baker",
    avatar: "https://placehold.co/150x150?text=Sarah",
    bio: "Pastry chef & dessert enthusiast. Life is sweet!",
    followers: [2],
    following: [1],
    rating: 4.9,
  },
];

const posts = [
  {
    id: 1,
    authorId: 1,
    title: "Classic Margherita Pizza",
    image: "https://placehold.co/600x400?text=Margherita+Pizza",
    instructions:
      "1. Prepare the dough and let it rise for 2 hours.\n2. Spread tomato sauce evenly.\n3. Add fresh mozzarella and basil leaves.\n4. Bake at 250°C for 10-12 minutes.",
    ingredients: [
      "500g flour",
      "300ml water",
      "10g yeast",
      "200g tomato sauce",
      "200g fresh mozzarella",
      "Fresh basil",
      "Olive oil",
      "Salt",
    ],
    difficulty: "Medium",
    category: "Italian",
    likes: [2, 3],
    ratings: [
      { userId: 2, score: 5 },
      { userId: 3, score: 4 },
    ],
    createdAt: "2025-12-01T10:00:00Z",
  },
  {
    id: 2,
    authorId: 2,
    title: "Vegan Buddha Bowl",
    image: "https://placehold.co/600x400?text=Buddha+Bowl",
    instructions:
      "1. Cook quinoa according to package.\n2. Roast chickpeas with spices at 200°C for 20 min.\n3. Slice avocado, shred carrots and red cabbage.\n4. Assemble bowl and drizzle with tahini dressing.",
    ingredients: [
      "1 cup quinoa",
      "1 can chickpeas",
      "1 avocado",
      "2 carrots",
      "1/4 red cabbage",
      "2 tbsp tahini",
      "Lemon juice",
      "Cumin",
      "Paprika",
    ],
    difficulty: "Easy",
    category: "Vegan",
    likes: [1],
    ratings: [{ userId: 1, score: 4 }],
    createdAt: "2025-12-05T14:30:00Z",
  },
  {
    id: 3,
    authorId: 3,
    title: "Chocolate Lava Cake",
    image: "https://placehold.co/600x400?text=Lava+Cake",
    instructions:
      "1. Melt chocolate and butter together.\n2. Whisk eggs and sugar until fluffy.\n3. Fold in flour and chocolate mixture.\n4. Pour into greased ramekins.\n5. Bake at 220°C for 12 minutes.",
    ingredients: [
      "200g dark chocolate",
      "100g butter",
      "3 eggs",
      "100g sugar",
      "50g flour",
      "Cocoa powder",
    ],
    difficulty: "Hard",
    category: "Dessert",
    likes: [1, 2],
    ratings: [
      { userId: 1, score: 5 },
      { userId: 2, score: 5 },
    ],
    createdAt: "2025-12-10T09:15:00Z",
  },
  {
    id: 4,
    authorId: 1,
    title: "Creamy Carbonara",
    image: "https://placehold.co/600x400?text=Carbonara",
    instructions:
      "1. Cook spaghetti al dente.\n2. Fry guanciale until crispy.\n3. Mix eggs, pecorino, and black pepper.\n4. Toss hot pasta with guanciale, then stir in egg mixture off heat.",
    ingredients: [
      "400g spaghetti",
      "150g guanciale",
      "4 egg yolks",
      "100g pecorino romano",
      "Black pepper",
    ],
    difficulty: "Medium",
    category: "Italian",
    likes: [2, 3],
    ratings: [
      { userId: 2, score: 5 },
      { userId: 3, score: 5 },
    ],
    createdAt: "2025-12-15T18:00:00Z",
  },
  {
    id: 5,
    authorId: 2,
    title: "Vegan Pad Thai",
    image: "https://placehold.co/600x400?text=Pad+Thai",
    instructions:
      "1. Soak rice noodles in warm water.\n2. Stir-fry tofu until golden.\n3. Add vegetables and noodles.\n4. Pour pad thai sauce and toss.\n5. Garnish with peanuts and lime.",
    ingredients: [
      "200g rice noodles",
      "200g firm tofu",
      "Bean sprouts",
      "Green onions",
      "Crushed peanuts",
      "3 tbsp soy sauce",
      "2 tbsp tamarind paste",
      "1 tbsp maple syrup",
      "Lime",
    ],
    difficulty: "Medium",
    category: "Vegan",
    likes: [1, 3],
    ratings: [
      { userId: 1, score: 4 },
      { userId: 3, score: 5 },
    ],
    createdAt: "2025-12-20T12:00:00Z",
  },
];

const categories = ["Italian", "Vegan", "Dessert", "Mexican", "Asian", "American", "Mediterranean"];

const collections = [
  {
    id: 1,
    userId: 1,
    name: "Italian Favorites",
    description: "My best Italian recipes",
    createdAt: "2025-12-01T12:00:00Z",
  },
];

const savedRecipes = [
  { userId: 1, postId: 3, collectionId: null, savedAt: "2025-12-12T10:00:00Z" },
  { userId: 1, postId: 1, collectionId: 1, savedAt: "2025-12-15T10:00:00Z" },
];

const comments = [
  {
    id: 1,
    postId: 1,
    authorId: 2,
    text: "This pizza recipe is incredible! My family loved it.",
    likes: [1, 3],
    createdAt: "2025-12-02T11:00:00Z",
  },
  {
    id: 2,
    postId: 1,
    authorId: 3,
    text: "I added some cherry tomatoes on top, turned out amazing!",
    likes: [1],
    createdAt: "2025-12-03T09:30:00Z",
  },
  {
    id: 3,
    postId: 3,
    authorId: 1,
    text: "The lava center was perfect. Best dessert I've made!",
    likes: [2, 3],
    createdAt: "2025-12-11T15:00:00Z",
  },
];

module.exports = { users, posts, categories, collections, savedRecipes, comments };
