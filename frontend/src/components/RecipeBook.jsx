import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

function CollectionPopover({ postId, currentCollectionId, collections, onMove, onCreateAndMove, onClose }) {
  const ref = useRef(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNameError, setNewNameError] = useState("");

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setNewNameError("");
    try {
      await onCreateAndMove(postId, newName.trim());
      onClose();
    } catch {
      setNewNameError("Failed to create collection.");
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-0 mb-2 w-56 card p-2 shadow-lg z-10"
    >
      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-2 py-1.5">
        Add to collection
      </p>

      <button
        onClick={() => { onMove(postId, null); onClose(); }}
        className={`w-full text-left px-2.5 py-2 rounded-lg text-sm transition-all ${
          currentCollectionId === null
            ? "bg-accent-subtle text-accent font-medium"
            : "text-text-secondary hover:bg-black/[0.03]"
        }`}
      >
        Unsorted
      </button>

      {collections.map((c) => (
        <button
          key={c.id}
          onClick={() => { onMove(postId, c.id); onClose(); }}
          className={`w-full text-left px-2.5 py-2 rounded-lg text-sm transition-all ${
            currentCollectionId === c.id
              ? "bg-accent-subtle text-accent font-medium"
              : "text-text-secondary hover:bg-black/[0.03]"
          }`}
        >
          {c.name}
        </button>
      ))}

      <hr className="my-1.5 border-border" />

      {creating ? (
        <form onSubmit={handleCreate} className="px-1 space-y-1.5">
          {newNameError && <p className="text-xs text-red-500">{newNameError}</p>}
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Collection name"
            className="input text-sm py-1.5"
            autoFocus
          />
          <div className="flex gap-1.5">
            <button type="submit" className="btn-primary flex-1 py-1.5 text-xs">Create</button>
            <button type="button" onClick={() => setCreating(false)} className="btn-secondary flex-1 py-1.5 text-xs">Cancel</button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full text-left px-2.5 py-2 rounded-lg text-sm text-accent hover:bg-accent-subtle transition-all font-medium"
        >
          + New Collection
        </button>
      )}
    </motion.div>
  );
}

function RecipeBook() {
  const [collections, setCollections] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [activeCollection, setActiveCollection] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [formError, setFormError] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [popoverPostId, setPopoverPostId] = useState(null);

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
    setConfirmDeleteId(null);
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
      }
    } catch {
      setError("Failed to move recipe.");
    }
  };

  const handleCreateAndMove = async (postId, name) => {
    const res = await fetch("/api/recipe-book/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: "" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setCollections((prev) => [...prev, data]);
    await handleMoveToCollection(postId, data.id);
  };

  const filteredRecipes =
    activeCollection === "all"
      ? savedRecipes
      : activeCollection === "unsorted"
      ? savedRecipes.filter((sr) => sr.collectionId === null)
      : savedRecipes.filter((sr) => sr.collectionId === activeCollection);

  const getCollectionCount = (colId) =>
    savedRecipes.filter((sr) => sr.collectionId === colId).length;

  const sidebarItemClass = (active) =>
    `w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
      active
        ? "bg-accent-subtle text-accent font-medium"
        : "text-text-secondary hover:text-text-primary hover:bg-black/[0.03]"
    }`;

  if (loading) return <p className="text-center text-text-tertiary py-16 text-sm">Loading...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-6">Recipe Book</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
          {error}
        </div>
      )}

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Collections panel */}
        <div className="md:w-64 shrink-0">
          <div className="card p-4">
            <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Collections</h2>

            <button
              onClick={() => setActiveCollection("all")}
              className={sidebarItemClass(activeCollection === "all")}
            >
              All Saved ({savedRecipes.length})
            </button>

            <button
              onClick={() => setActiveCollection("unsorted")}
              className={sidebarItemClass(activeCollection === "unsorted") + " mt-1"}
            >
              Unsorted ({savedRecipes.filter((sr) => sr.collectionId === null).length})
            </button>

            <hr className="my-3 border-border" />

            {collections.map((col) => (
              <div key={col.id} className="mb-1">
                {editingId === col.id ? (
                  <div className="space-y-2 p-2.5 bg-surface-raised rounded-xl border border-border">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input text-sm py-1.5"
                    />
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Description"
                      className="input text-sm py-1.5"
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleUpdateCollection(col.id)}
                        className="btn-primary flex-1 py-1.5 text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-secondary flex-1 py-1.5 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center group">
                    <button
                      onClick={() => setActiveCollection(col.id)}
                      className={sidebarItemClass(activeCollection === col.id) + " flex-1"}
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
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent-subtle transition-all"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(col.id)}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-all"
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
              <form onSubmit={handleCreateCollection} className="mt-2 space-y-2 p-2.5 bg-surface-raised rounded-xl border border-border">
                {formError && <p className="text-xs text-red-500">{formError}</p>}
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Collection name"
                  className="input text-sm py-1.5"
                  autoFocus
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="input text-sm py-1.5"
                />
                <div className="flex gap-1.5">
                  <button type="submit" className="btn-primary flex-1 py-1.5 text-xs">
                    Create
                  </button>
                  <button type="button" onClick={() => { setShowNewForm(false); setFormError(""); }} className="btn-secondary flex-1 py-1.5 text-xs">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowNewForm(true)}
                className="w-full mt-2 px-3 py-2 text-sm text-accent hover:bg-accent-subtle rounded-lg transition-all text-left font-medium"
              >
                + New Collection
              </button>
            )}
          </div>
        </div>

        {/* Recipes grid */}
        <div className="flex-1">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-tertiary text-sm mb-2">No saved recipes here yet.</p>
              <Link to="/feed" className="text-sm text-accent hover:text-accent-hover font-medium transition-colors">
                Browse recipes to save
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map((sr) => (
                <div key={sr.postId} className="card overflow-hidden">
                  <Link to={`/posts/${sr.post.id}`} className="block overflow-hidden">
                    <img
                      src={sr.post.image}
                      alt={sr.post.title}
                      className="w-full h-36 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/posts/${sr.post.id}`} className="text-sm font-semibold text-text-primary hover:text-accent transition-colors">
                      {sr.post.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 mb-3">
                      <span className="badge text-[0.6875rem]">{sr.post.category}</span>
                      <span className="text-xs text-text-tertiary">{sr.post.difficulty}</span>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      <button
                        onClick={() => setPopoverPostId(popoverPostId === sr.postId ? null : sr.postId)}
                        className="text-xs text-text-tertiary hover:text-accent transition-colors flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M3.75 3A1.75 1.75 0 002 4.75v3.26a3.235 3.235 0 011.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0016.25 5h-4.836a.25.25 0 01-.177-.073L9.823 3.513A1.75 1.75 0 008.586 3H3.75zM3.75 9A1.75 1.75 0 002 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0018 15.25v-4.5A1.75 1.75 0 0016.25 9H3.75z" />
                        </svg>
                        {sr.collectionId
                          ? collections.find((c) => c.id === sr.collectionId)?.name || "Collection"
                          : "Add to collection"}
                      </button>

                      <AnimatePresence>
                        {popoverPostId === sr.postId && (
                          <CollectionPopover
                            postId={sr.postId}
                            currentCollectionId={sr.collectionId}
                            collections={collections}
                            onMove={handleMoveToCollection}
                            onCreateAndMove={handleCreateAndMove}
                            onClose={() => setPopoverPostId(null)}
                          />
                        )}
                      </AnimatePresence>

                      <button
                        onClick={() => handleUnsave(sr.postId)}
                        className="ml-auto p-1.5 rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Remove from saved"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
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
      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="card p-6 w-full max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-text-primary mb-2">Delete collection?</h3>
              <p className="text-sm text-text-secondary mb-5">
                Saved recipes in this collection will be moved to Unsorted. This action cannot be undone.
              </p>
              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCollection(confirmDeleteId)}
                  className="px-4 py-2 rounded-[0.625rem] text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RecipeBook;
