import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PostCard from "./PostCard";

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

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategory("")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            activeCategory === ""
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === cat
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No posts found for this category.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Feed;
