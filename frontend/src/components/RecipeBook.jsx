import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function RecipeBook() {
  const [collections, setCollections] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [activeCollection, setActiveCollection] = useState("all"); // "all" | "unsorted" | collection id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Collection form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [formError, setFormError] = useState("");

  // Edit collection
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Move recipe modal
  const [movingPostId, setMovingPostId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [colRes, savedRes] = await Promise.all([
        fetch("/api/recipe-book/collections"),
        fetch("/api/recipe-book/saved"),
      ]);
      setCollections(await colRes.json());
      setSavedRecipes(await savedRes.json());
    } catch {
      setError("Could not load recipe book.");
    }
    setLoading(false);
  };

  const handleUnsave = async (postId) => {
    try {
      const res = await fetch(`/api/recipe-book/saved/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setSavedRecipes((prev) => prev.filter((sr) => sr.postId !== postId));
      }
    } catch {
      setError("Failed to remove recipe.");
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const res = await fetch("/api/recipe-book/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create collection.");
        return;
      }
      setCollections((prev) => [...prev, data]);
      setNewName("");
      setNewDesc("");
      setShowNewForm(false);
    } catch {
      setFormError("Could not connect to the server.");
    }
  };

  const handleUpdateCollection = async (id) => {
    try {
      const res = await fetch(`/api/recipe-book/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        setCollections((prev) => prev.map((c) => (c.id === id ? data : c)));
        setEditingId(null);
      }
    } catch {
      setError("Failed to update collection.");
    }
  };

  const handleDeleteCollection = async (id) => {
    if (!window.confirm("Delete this collection? Recipes will be moved to unsorted.")) return;
    try {
      const res = await fetch(`/api/recipe-book/collections/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
        setSavedRecipes((prev) =>
          prev.map((sr) => (sr.collectionId === id ? { ...sr, collectionId: null } : sr))
        );
        if (activeCollection === id) setActiveCollection("all");
      }
    } catch {
      setError("Failed to delete collection.");
    }
  };

  const handleMoveToCollection = async (postId, collectionId) => {
    try {
      const res = await fetch(`/api/recipe-book/saved/${postId}/collection`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId }),
      });
      if (res.ok) {
        setSavedRecipes((prev) =>
          prev.map((sr) => (sr.postId === postId ? { ...sr, collectionId } : sr))
        );
        setMovingPostId(null);
      }
    } catch {
      setError("Failed to move recipe.");
    }
  };

  const filteredRecipes =
    activeCollection === "all"
      ? savedRecipes
      : activeCollection === "unsorted"
      ? savedRecipes.filter((sr) => sr.collectionId === null)
      : savedRecipes.filter((sr) => sr.collectionId === activeCollection);

  const getCollectionCount = (colId) =>
    savedRecipes.filter((sr) => sr.collectionId === colId).length;

  if (loading) return <p className="text-center text-gray-400 py-12">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Recipe Book</h1>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {/* Collections sidebar + recipes */}
      <div className="flex gap-6 flex-col md:flex-row">
        {/* Collections panel */}
        <div className="md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Collections</h2>

            <button
              onClick={() => setActiveCollection("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition ${
                activeCollection === "all"
                  ? "bg-orange-100 text-orange-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Saved ({savedRecipes.length})
            </button>

            <button
              onClick={() => setActiveCollection("unsorted")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition ${
                activeCollection === "unsorted"
                  ? "bg-orange-100 text-orange-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Unsorted ({savedRecipes.filter((sr) => sr.collectionId === null).length})
            </button>

            <hr className="my-2" />

            {collections.map((col) => (
              <div key={col.id} className="mb-1">
                {editingId === col.id ? (
                  <div className="space-y-2 p-2 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Description"
                      className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdateCollection(col.id)}
                        className="flex-1 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center group">
                    <button
                      onClick={() => setActiveCollection(col.id)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition ${
                        activeCollection === col.id
                          ? "bg-orange-100 text-orange-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {col.name} ({getCollectionCount(col.id)})
                    </button>
                    <div className="hidden group-hover:flex gap-0.5 pr-1">
                      <button
                        onClick={() => {
                          setEditingId(col.id);
                          setEditName(col.name);
                          setEditDesc(col.description);
                        }}
                        className="p-1 text-gray-400 hover:text-orange-500 transition"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(col.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6a.75.75 0 01-1.49.12l-.5-6a.75.75 0 01.71-.84zm2.84 0a.75.75 0 01.71.84l-.5 6a.75.75 0 11-1.49-.12l.5-6a.75.75 0 01.78-.72z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* New collection form */}
            {showNewForm ? (
              <form onSubmit={handleCreateCollection} className="mt-2 space-y-2 p-2 bg-gray-50 rounded-lg">
                {formError && <p className="text-xs text-red-500">{formError}</p>}
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Collection name"
                  className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  autoFocus
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                <div className="flex gap-1">
                  <button type="submit" className="flex-1 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition">
                    Create
                  </button>
                  <button type="button" onClick={() => { setShowNewForm(false); setFormError(""); }} className="flex-1 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300 transition">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowNewForm(true)}
                className="w-full mt-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition text-left font-medium"
              >
                + New Collection
              </button>
            )}
          </div>
        </div>

        {/* Recipes grid */}
        <div className="flex-1">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-2">No saved recipes here yet.</p>
              <Link to="/feed" className="text-sm text-orange-600 hover:underline font-medium">
                Browse recipes to save
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map((sr) => (
                <div key={sr.postId} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <Link to={`/posts/${sr.post.id}`}>
                    <img src={sr.post.image} alt={sr.post.title} className="w-full h-36 object-cover" />
                  </Link>
                  <div className="p-4">
                    <Link to={`/posts/${sr.post.id}`} className="text-sm font-bold text-gray-800 hover:text-orange-600 transition">
                      {sr.post.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 mb-3">
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        {sr.post.category}
                      </span>
                      <span className="text-xs text-gray-400">{sr.post.difficulty}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Move to collection */}
                      {movingPostId === sr.postId ? (
                        <select
                          autoFocus
                          className="flex-1 text-xs px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
                          value={sr.collectionId ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleMoveToCollection(sr.postId, val === "" ? null : parseInt(val));
                          }}
                          onBlur={() => setMovingPostId(null)}
                        >
                          <option value="">Unsorted</option>
                          {collections.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setMovingPostId(sr.postId)}
                          className="text-xs text-gray-400 hover:text-orange-500 transition"
                          title="Move to collection"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline mr-1">
                            <path d="M3.75 3A1.75 1.75 0 002 4.75v3.26a3.235 3.235 0 011.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0016.25 5h-4.836a.25.25 0 01-.177-.073L9.823 3.513A1.75 1.75 0 008.586 3H3.75zM3.75 9A1.75 1.75 0 002 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0018 15.25v-4.5A1.75 1.75 0 0016.25 9H3.75z" />
                          </svg>
                          {sr.collectionId
                            ? collections.find((c) => c.id === sr.collectionId)?.name || "Move"
                            : "Move to..."}
                        </button>
                      )}

                      <button
                        onClick={() => handleUnsave(sr.postId)}
                        className="ml-auto text-xs text-gray-400 hover:text-red-500 transition"
                        title="Remove from saved"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6a.75.75 0 01-1.49.12l-.5-6a.75.75 0 01.71-.84zm2.84 0a.75.75 0 01.71.84l-.5 6a.75.75 0 11-1.49-.12l.5-6a.75.75 0 01.78-.72z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeBook;
