require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");
const User = require("../schemas/User");
const Post = require("../schemas/Post");
const Comment = require("../schemas/Comment");
const Collection = require("../schemas/Collection");
const SavedRecipe = require("../schemas/SavedRecipe");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Collection.deleteMany({}),
    SavedRecipe.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  // Create users
  const [maria, dan, sarah] = await User.create([
    {
      username: "chef_maria",
      displayName: "Maria Rossi",
      avatar: "https://placehold.co/150x150?text=Maria",
      bio: "Italian cuisine lover. Nonna's recipes with a modern twist.",
      rating: 4.8,
    },
    {
      username: "vegan_dan",
      displayName: "Dan Green",
      avatar: "https://placehold.co/150x150?text=Dan",
      bio: "Plant-based chef. Making vegan food exciting!",
      rating: 4.5,
    },
    {
      username: "baker_sarah",
      displayName: "Sarah Baker",
      avatar: "https://placehold.co/150x150?text=Sarah",
      bio: "Pastry chef & dessert enthusiast. Life is sweet!",
      rating: 4.9,
    },
  ]);
  console.log("Created users");

  // Set up followers/following
  maria.followers = [dan._id, sarah._id];
  maria.following = [dan._id];
  dan.followers = [maria._id];
  dan.following = [maria._id, sarah._id];
  sarah.followers = [dan._id];
  sarah.following = [maria._id];
  await Promise.all([maria.save(), dan.save(), sarah.save()]);
  console.log("Set up followers");

  // Create posts
  const [pizza, buddha, lava, carbonara, padthai] = await Post.create([
    {
      authorId: maria._id,
      title: "Classic Margherita Pizza",
      image: "https://placehold.co/600x400?text=Margherita+Pizza",
      instructions: "1. Prepare the dough and let it rise for 2 hours.\n2. Spread tomato sauce evenly.\n3. Add fresh mozzarella and basil leaves.\n4. Bake at 250°C for 10-12 minutes.",
      ingredients: ["500g flour", "300ml water", "10g yeast", "200g tomato sauce", "200g fresh mozzarella", "Fresh basil", "Olive oil", "Salt"],
      difficulty: "Medium",
      category: "Italian",
      likes: [dan._id, sarah._id],
      ratings: [{ userId: dan._id, score: 5 }, { userId: sarah._id, score: 4 }],
    },
    {
      authorId: dan._id,
      title: "Vegan Buddha Bowl",
      image: "https://placehold.co/600x400?text=Buddha+Bowl",
      instructions: "1. Cook quinoa according to package.\n2. Roast chickpeas with spices at 200°C for 20 min.\n3. Slice avocado, shred carrots and red cabbage.\n4. Assemble bowl and drizzle with tahini dressing.",
      ingredients: ["1 cup quinoa", "1 can chickpeas", "1 avocado", "2 carrots", "1/4 red cabbage", "2 tbsp tahini", "Lemon juice", "Cumin", "Paprika"],
      difficulty: "Easy",
      category: "Vegan",
      likes: [maria._id],
      ratings: [{ userId: maria._id, score: 4 }],
    },
    {
      authorId: sarah._id,
      title: "Chocolate Lava Cake",
      image: "https://placehold.co/600x400?text=Lava+Cake",
      instructions: "1. Melt chocolate and butter together.\n2. Whisk eggs and sugar until fluffy.\n3. Fold in flour and chocolate mixture.\n4. Pour into greased ramekins.\n5. Bake at 220°C for 12 minutes.",
      ingredients: ["200g dark chocolate", "100g butter", "3 eggs", "100g sugar", "50g flour", "Cocoa powder"],
      difficulty: "Hard",
      category: "Dessert",
      likes: [maria._id, dan._id],
      ratings: [{ userId: maria._id, score: 5 }, { userId: dan._id, score: 5 }],
    },
    {
      authorId: maria._id,
      title: "Creamy Carbonara",
      image: "https://placehold.co/600x400?text=Carbonara",
      instructions: "1. Cook spaghetti al dente.\n2. Fry guanciale until crispy.\n3. Mix eggs, pecorino, and black pepper.\n4. Toss hot pasta with guanciale, then stir in egg mixture off heat.",
      ingredients: ["400g spaghetti", "150g guanciale", "4 egg yolks", "100g pecorino romano", "Black pepper"],
      difficulty: "Medium",
      category: "Italian",
      likes: [dan._id, sarah._id],
      ratings: [{ userId: dan._id, score: 5 }, { userId: sarah._id, score: 5 }],
    },
    {
      authorId: dan._id,
      title: "Vegan Pad Thai",
      image: "https://placehold.co/600x400?text=Pad+Thai",
      instructions: "1. Soak rice noodles in warm water.\n2. Stir-fry tofu until golden.\n3. Add vegetables and noodles.\n4. Pour pad thai sauce and toss.\n5. Garnish with peanuts and lime.",
      ingredients: ["200g rice noodles", "200g firm tofu", "Bean sprouts", "Green onions", "Crushed peanuts", "3 tbsp soy sauce", "2 tbsp tamarind paste", "1 tbsp maple syrup", "Lime"],
      difficulty: "Medium",
      category: "Vegan",
      likes: [maria._id, sarah._id],
      ratings: [{ userId: maria._id, score: 4 }, { userId: sarah._id, score: 5 }],
    },
  ]);
  console.log("Created posts");

  // Create comments
  await Comment.create([
    {
      postId: pizza._id,
      authorId: dan._id,
      text: "This pizza recipe is incredible! My family loved it.",
      likes: [maria._id, sarah._id],
    },
    {
      postId: pizza._id,
      authorId: sarah._id,
      text: "I added some cherry tomatoes on top, turned out amazing!",
      likes: [maria._id],
    },
    {
      postId: lava._id,
      authorId: maria._id,
      text: "The lava center was perfect. Best dessert I've made!",
      likes: [dan._id, sarah._id],
    },
  ]);
  console.log("Created comments");

  // Create a collection
  const italianFavs = await Collection.create({
    userId: maria._id,
    name: "Italian Favorites",
    description: "My best Italian recipes",
  });
  console.log("Created collections");

  // Create saved recipes
  await SavedRecipe.create([
    { userId: maria._id, postId: lava._id, collectionId: null },
    { userId: maria._id, postId: pizza._id, collectionId: italianFavs._id },
  ]);
  console.log("Created saved recipes");

  console.log("\nSeed complete!");
  console.log(`  Users: ${await User.countDocuments()}`);
  console.log(`  Posts: ${await Post.countDocuments()}`);
  console.log(`  Comments: ${await Comment.countDocuments()}`);
  console.log(`  Collections: ${await Collection.countDocuments()}`);
  console.log(`  Saved Recipes: ${await SavedRecipe.countDocuments()}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
