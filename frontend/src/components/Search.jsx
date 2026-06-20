import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

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
    <div>
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, recipes, or categories..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
        >
          Search
        </button>
      </form>

      {results === null && (
        <p className="text-gray-400 text-center py-12">
          Search for users, recipes, or food categories.
        </p>
      )}

      {results && (
        <div className="space-y-6">
          {results.users.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Users
              </h3>
              <div className="space-y-2">
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/users/${user.id}`}
                    className="w-full flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                    <span className="ml-auto text-xs text-yellow-500 font-medium">
                      ★ {user.rating}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.posts.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Recipes
              </h3>
              <div className="space-y-2">
                {results.posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
                    className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {post.category} &middot; {post.difficulty}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.categories.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
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
                    className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition"
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
              <p className="text-gray-400 text-center py-8">
                No results found for "{searchParams.get("q")}".
              </p>
            )}
        </div>
      )}
    </div>
  );
}

export default Search;
