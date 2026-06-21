import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (!q) return;

    setQuery(q);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then(setResults);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query.trim() });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <form onSubmit={handleSearch} className="flex gap-2.5 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, recipes, or categories..."
          className="input flex-1"
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {results === null && (
        <p className="text-text-tertiary text-center py-16 text-sm">
          Search for users, recipes, or food categories.
        </p>
      )}

      {results && (
        <div className="space-y-8">
          {results.users.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                Users
              </h3>
              <div className="space-y-2">
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/users/${user.id}`}
                    className="card flex items-center gap-3 p-3.5 hover:border-border-strong transition-all"
                  >
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full ring-1 ring-border"
                    />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-text-tertiary">@{user.username}</p>
                    </div>
                    <span className="ml-auto text-xs text-amber-500 font-medium">
                      {user.rating !== null ? `★ ${user.rating}` : "No rating"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.posts.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                Recipes
              </h3>
              <div className="space-y-2">
                {results.posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
                    className="card flex items-center gap-3.5 p-3.5 hover:border-border-strong transition-all"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {post.title}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {post.category} · {post.difficulty}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.categories.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      navigate(`/feed?category=${encodeURIComponent(cat)}`)
                    }
                    className="badge hover:bg-accent hover:text-white transition-all"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>
          )}

          {results.users.length === 0 &&
            results.posts.length === 0 &&
            results.categories.length === 0 && (
              <p className="text-text-tertiary text-center py-12 text-sm">
                No results found for "{searchParams.get("q")}".
              </p>
            )}
        </div>
      )}
    </motion.div>
  );
}

export default Search;
