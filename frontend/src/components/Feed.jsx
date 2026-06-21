import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import PostCard from "./PostCard";

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

function Feed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    const url = activeCategory
      ? `/api/posts?category=${encodeURIComponent(activeCategory)}`
      : "/api/posts";
    fetch(url)
      .then((res) => res.json())
      .then(setPosts);
  }, [activeCategory]);

  const setCategory = (cat) => {
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleUpdate = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const pillClass = (active) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-accent text-white shadow-sm"
        : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-strong"
    }`;

  return (
    <div>
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setCategory("")} className={pillClass(activeCategory === "")}>
          All
        </button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} className={pillClass(activeCategory === cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <p className="text-text-tertiary text-center py-16 text-sm">No recipes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post._id || post.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              style={{ willChange: "opacity, transform" }}
            >
              <PostCard
                post={post}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Feed;
