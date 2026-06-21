import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { UserContext } from "../App";

function PostCard({ post, onDelete, onUpdate }) {
  const CURRENT_USER_ID = useContext(UserContext);
  const findUserRating = (r) => r.find((x) => x.userId === CURRENT_USER_ID)?.score ?? 0;
  const isLiked = (l) => l.includes(CURRENT_USER_ID);

  const [likes, setLikes] = useState(post.likes);
  const [ratings, setRatings] = useState(post.ratings);
  const [liked, setLiked] = useState(() => isLiked(post.likes));
  const [userRating, setUserRating] = useState(() => findUserRating(post.ratings));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLikes(post.likes);
    setRatings(post.ratings);
    setLiked(isLiked(post.likes));
    setUserRating(findUserRating(post.ratings));
  }, [post.id, post.likes, post.ratings, CURRENT_USER_ID]);

  useEffect(() => {
    fetch(`/api/recipe-book/saved/${post.id}/check`)
      .then((res) => res.json())
      .then((data) => setSaved(data.saved))
      .catch(() => {});
    fetch(`/api/posts/${post.id}/comments`)
      .then((res) => res.json())
      .then((data) => setCommentCount(data.length))
      .catch(() => {});
  }, [post.id]);

  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(0);

  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const editFileRef = useRef(null);
  const [editImageMode, setEditImageMode] = useState("url");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editUploading, setEditUploading] = useState(false);
  const [form, setForm] = useState({
    title: post.title,
    ingredients: post.ingredients.join(", "),
    instructions: post.instructions,
    image: post.image,
    difficulty: post.difficulty,
    category: post.category,
  });

  const isOwner = post.author.id === CURRENT_USER_ID;

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
      : "N/A";

  const handleLike = async () => {
    const prevLikes = likes;
    const prevLiked = liked;
    if (liked) {
      setLikes((prev) => prev.filter((id) => id !== CURRENT_USER_ID));
    } else {
      setLikes((prev) => [...prev, CURRENT_USER_ID]);
    }
    setLiked((prev) => !prev);
    setError("");
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) { setLikes(prevLikes); setLiked(prevLiked); setError(data.error || "Failed to update like."); return; }
      setLikes(data.likes);
      setLiked(data.likes.includes(CURRENT_USER_ID));
    } catch { setLikes(prevLikes); setLiked(prevLiked); setError("Could not connect to the server."); }
  };

  const handleRating = async (star) => {
    const prevRatings = ratings;
    const prevUserRating = userRating;
    setUserRating(star);
    setRatings((prev) => {
      const index = prev.findIndex((r) => r.userId === CURRENT_USER_ID);
      if (index >= 0) return prev.map((r, i) => (i === index ? { ...r, score: star } : r));
      return [...prev, { userId: CURRENT_USER_ID, score: star }];
    });
    setError("");
    try {
      const res = await fetch(`/api/posts/${post.id}/rating`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: star }) });
      const data = await res.json();
      if (!res.ok) { setRatings(prevRatings); setUserRating(prevUserRating); setError(data.error || "Failed to save rating."); return; }
      setRatings(data.ratings);
      setUserRating(findUserRating(data.ratings));
    } catch { setRatings(prevRatings); setUserRating(prevUserRating); setError("Could not connect to the server."); }
  };

  const handleSave = async () => {
    const wasSaved = saved;
    setSaved(!wasSaved);
    setError("");
    try {
      const res = await fetch(`/api/recipe-book/saved/${post.id}`, { method: wasSaved ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: wasSaved ? undefined : JSON.stringify({}) });
      if (!res.ok) { setSaved(wasSaved); const data = await res.json(); setError(data.error || "Failed to save recipe."); }
    } catch { setSaved(wasSaved); setError("Could not connect to the server."); }
  };

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      const data = await res.json();
      setComments(data);
      setCommentCount(data.length);
    } catch {}
  };

  const handleToggleComments = () => {
    if (!showComments) loadComments();
    setShowComments((prev) => !prev);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setError("");
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: commentText }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to add comment."); return; }
      setComments((prev) => [...prev, data]);
      setCommentCount((prev) => prev + 1);
      setCommentText("");
    } catch { setError("Could not connect to the server."); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) { setComments((prev) => prev.filter((c) => c.id !== commentId)); setCommentCount((prev) => prev - 1); }
    } catch { setError("Failed to delete comment."); }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: "PUT" });
      const data = await res.json();
      if (res.ok) setComments((prev) => prev.map((c) => (c.id === commentId ? data : c)));
    } catch {}
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const res = await fetch(`/api/recipes/${post.id}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); setError(data.error || "Failed to delete."); return; }
      onDelete(post.id);
    } catch { setError("Could not connect to the server."); }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, image: "" }));
  };

  const removeEditFile = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editFileRef.current) editFileRef.current.value = "";
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let imageUrl = form.image;
      if (editImageMode === "file" && editImageFile) {
        setEditUploading(true);
        const formData = new FormData();
        formData.append("image", editImageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed.");
        imageUrl = uploadData.url;
        setEditUploading(false);
      }
      const payload = { ...form, image: imageUrl, ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean) };
      const res = await fetch(`/api/recipes/${post.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update."); return; }
      removeEditFile();
      setEditImageMode("url");
      onUpdate(data);
      setEditing(false);
    } catch (err) { setEditUploading(false); setError(err.message || "Could not connect to the server."); }
  };

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const modeBtn = (active) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
      active
        ? "bg-accent text-white"
        : "bg-surface-raised border border-border text-text-secondary hover:text-text-primary"
    }`;

  // ── Edit form ──
  if (editing) {
    return (
      <form onSubmit={handleEdit} className="card p-6 space-y-4">
        <h3 className="text-base font-semibold text-text-primary">Edit Recipe</h3>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">{error}</div>}
        <input type="text" value={form.title} onChange={update("title")} placeholder="Title" className="input" />
        <input type="text" value={form.ingredients} onChange={update("ingredients")} placeholder="Ingredients (comma separated)" className="input" />
        <textarea value={form.instructions} onChange={update("instructions")} rows={3} placeholder="Instructions" className="input resize-y" />

        <div>
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={() => setEditImageMode("file")} className={modeBtn(editImageMode === "file")}>Upload File</button>
            <button type="button" onClick={() => setEditImageMode("url")} className={modeBtn(editImageMode === "url")}>Paste URL</button>
          </div>
          {editImageMode === "file" ? (
            editImagePreview ? (
              <div className="relative">
                <img src={editImagePreview} alt="Preview" className="w-full h-36 object-cover rounded-xl border border-border" />
                <button type="button" onClick={removeEditFile} className="absolute top-2 right-2 glass rounded-full p-1.5 text-text-secondary hover:text-red-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border-strong rounded-xl hover:border-accent hover:bg-accent-subtle/30 transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-text-tertiary mb-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <span className="text-xs text-text-secondary">Click to browse</span>
                <span className="text-xs text-text-tertiary">JPG, PNG, GIF, WebP</span>
                <input ref={editFileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleEditFileChange} className="hidden" />
              </label>
            )
          ) : (
            <input type="text" value={form.image} onChange={update("image")} placeholder="Image URL (optional)" className="input" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select value={form.difficulty} onChange={update("difficulty")} className="input">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select value={form.category} onChange={update("category")} className="input">
            {["Italian", "Vegan", "Dessert", "Mexican", "Asian", "American", "Mediterranean"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={editUploading} className="btn-primary flex-1 py-2.5">
            {editUploading ? "Uploading..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => { setEditing(false); setError(""); removeEditFile(); setEditImageMode("url"); }} className="btn-secondary flex-1 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // ── Main card ──
  return (
    <div className="card overflow-hidden">
      {/* Image */}
      <Link to={`/posts/${post.id}`} className="block overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-52 object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="p-5 space-y-3">
        {/* Author row */}
        <div className="flex items-center gap-3">
          <Link to={`/users/${post.author.id}`}>
            <img src={post.author.avatar} alt={post.author.displayName} className="w-8 h-8 rounded-full ring-1 ring-border" />
          </Link>
          <Link to={`/users/${post.author.id}`} className="text-sm font-medium text-text-primary hover:text-accent transition">
            {post.author.displayName}
          </Link>
          <span className="ml-auto text-xs text-text-tertiary font-medium">{post.difficulty}</span>
          {isOwner && (
            <div className="flex gap-0.5">
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent-subtle transition" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
              </button>
              <button onClick={handleDelete} className="p-1.5 rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-50 transition" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6a.75.75 0 01-1.49.12l-.5-6a.75.75 0 01.71-.84zm2.84 0a.75.75 0 01.71.84l-.5 6a.75.75 0 11-1.49-.12l.5-6a.75.75 0 01.78-.72z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">{error}</div>}

        {/* Title & category */}
        <div>
          <Link to={`/posts/${post.id}`} className="text-base font-semibold text-text-primary hover:text-accent transition leading-snug">
            {post.title}
          </Link>
          <div className="mt-1.5">
            <span className="badge">{post.category}</span>
          </div>
        </div>

        {/* Ingredients */}
        <details className="group">
          <summary className="text-sm font-medium text-text-secondary hover:text-text-primary transition">
            Ingredients ({post.ingredients.length})
          </summary>
          <ul className="mt-2 ml-4 list-disc text-sm text-text-secondary space-y-0.5">
            {post.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
        </details>

        {/* Instructions */}
        <details className="group">
          <summary className="text-sm font-medium text-text-secondary hover:text-text-primary transition">
            Instructions
          </summary>
          <p className="mt-2 text-sm text-text-secondary whitespace-pre-line leading-relaxed">{post.instructions}</p>
        </details>

        {/* Actions row */}
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <button onClick={handleLike} className={`text-sm font-medium transition ${liked ? "text-red-500" : "text-text-tertiary hover:text-red-500"}`}>
            {liked ? "♥" : "♡"} {likes.length}
          </button>

          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => handleRating(star)} className={`text-base leading-none transition ${star <= userRating ? "text-amber-400" : "text-gray-200 hover:text-amber-400"}`}>
                {"\u2605"}
              </button>
            ))}
            <span className="text-xs text-text-tertiary ml-1">({avgRating})</span>
          </div>

          <button onClick={handleToggleComments} className="text-sm font-medium text-text-tertiary hover:text-accent transition flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            {commentCount}
          </button>

          <button onClick={handleSave} className={`ml-auto transition ${saved ? "text-accent" : "text-text-tertiary hover:text-accent"}`} title={saved ? "Unsave" : "Save to Recipe Book"}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </button>
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-border space-y-3">
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="input flex-1 !py-2"
                  />
                  <button type="submit" className="btn-primary !py-2 !px-4">Post</button>
                </form>

                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <Link to={`/users/${c.author.id}`}>
                        <img src={c.author.avatar} alt={c.author.displayName} className="w-7 h-7 rounded-full ring-1 ring-border mt-0.5" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <Link to={`/users/${c.author.id}`} className="text-xs font-semibold text-text-primary hover:text-accent transition">
                            {c.author.displayName}
                          </Link>
                          <span className="text-xs text-text-tertiary">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">{c.text}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <button onClick={() => handleLikeComment(c.id)} className={`text-xs font-medium transition ${c.likes.includes(CURRENT_USER_ID) ? "text-red-500" : "text-text-tertiary hover:text-red-500"}`}>
                            {c.likes.includes(CURRENT_USER_ID) ? "♥" : "♡"} {c.likes.length}
                          </button>
                          {(c.author.id === CURRENT_USER_ID || isOwner) && (
                            <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-text-tertiary hover:text-red-500 transition">
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-xs text-text-tertiary text-center py-3">No comments yet. Be the first!</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PostCard;
