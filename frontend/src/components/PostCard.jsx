import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const CURRENT_USER_ID = 1;

function getUserRating(ratings) {
  return ratings.find((r) => r.userId === CURRENT_USER_ID)?.score ?? 0;
}

function PostCard({ post, onDelete, onUpdate }) {
  const [likes, setLikes] = useState(post.likes);
  const [ratings, setRatings] = useState(post.ratings);
  const [liked, setLiked] = useState(() => post.likes.includes(CURRENT_USER_ID));
  const [userRating, setUserRating] = useState(() => getUserRating(post.ratings));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLikes(post.likes);
    setRatings(post.ratings);
    setLiked(post.likes.includes(CURRENT_USER_ID));
    setUserRating(getUserRating(post.ratings));
  }, [post.id, post.likes, post.ratings]);

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
      if (!res.ok) {
        setLikes(prevLikes);
        setLiked(prevLiked);
        setError(data.error || "Failed to update like.");
        return;
      }
      setLikes(data.likes);
      setLiked(data.likes.includes(CURRENT_USER_ID));
    } catch {
      setLikes(prevLikes);
      setLiked(prevLiked);
      setError("Could not connect to the server.");
    }
  };

  const handleRating = async (star) => {
    const prevRatings = ratings;
    const prevUserRating = userRating;

    setUserRating(star);
    setRatings((prev) => {
      const index = prev.findIndex((r) => r.userId === CURRENT_USER_ID);
      if (index >= 0) {
        return prev.map((r, i) => (i === index ? { ...r, score: star } : r));
      }
      return [...prev, { userId: CURRENT_USER_ID, score: star }];
    });
    setError("");

    try {
      const res = await fetch(`/api/posts/${post.id}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: star }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRatings(prevRatings);
        setUserRating(prevUserRating);
        setError(data.error || "Failed to save rating.");
        return;
      }
      setRatings(data.ratings);
      setUserRating(getUserRating(data.ratings));
    } catch {
      setRatings(prevRatings);
      setUserRating(prevUserRating);
      setError("Could not connect to the server.");
    }
  };

  const handleSave = async () => {
    const wasSaved = saved;
    setSaved(!wasSaved);
    setError("");
    try {
      const res = await fetch(`/api/recipe-book/saved/${post.id}`, {
        method: wasSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: wasSaved ? undefined : JSON.stringify({}),
      });
      if (!res.ok) {
        setSaved(wasSaved);
        const data = await res.json();
        setError(data.error || "Failed to save recipe.");
      }
    } catch {
      setSaved(wasSaved);
      setError("Could not connect to the server.");
    }
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
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add comment.");
        return;
      }
      setComments((prev) => [...prev, data]);
      setCommentCount((prev) => prev + 1);
      setCommentText("");
    } catch {
      setError("Could not connect to the server.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentCount((prev) => prev - 1);
      }
    } catch {
      setError("Failed to delete comment.");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: "PUT" });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => prev.map((c) => (c.id === commentId ? data : c)));
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const res = await fetch(`/api/recipes/${post.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete.");
        return;
      }
      onDelete(post.id);
    } catch {
      setError("Could not connect to the server.");
    }
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

      const payload = {
        ...form,
        image: imageUrl,
        ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch(`/api/recipes/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update.");
        return;
      }
      removeEditFile();
      setEditImageMode("url");
      onUpdate(data);
      setEditing(false);
    } catch (err) {
      setEditUploading(false);
      setError(err.message || "Could not connect to the server.");
    }
  };

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";

  if (editing) {
    return (
      <form onSubmit={handleEdit} className="bg-white rounded-xl shadow-md overflow-hidden p-5 space-y-3">
        <h3 className="text-lg font-bold text-gray-800">Edit Recipe</h3>
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
        )}
        <input type="text" value={form.title} onChange={update("title")} placeholder="Title" className={inputClass} />
        <input type="text" value={form.ingredients} onChange={update("ingredients")} placeholder="Ingredients (comma separated)" className={inputClass} />
        <textarea value={form.instructions} onChange={update("instructions")} rows={3} placeholder="Instructions" className={inputClass + " resize-y"} />

        {/* Image section */}
        <div>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setEditImageMode("file")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                editImageMode === "file"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setEditImageMode("url")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                editImageMode === "url"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Paste URL
            </button>
          </div>

          {editImageMode === "file" ? (
            editImagePreview ? (
              <div className="relative">
                <img src={editImagePreview} alt="Preview" className="w-full h-36 object-cover rounded-lg border border-gray-200" />
                <button
                  type="button"
                  onClick={removeEditFile}
                  className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 rounded-full p-1 shadow transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-gray-400 mb-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <span className="text-xs text-gray-500">Click to browse</span>
                <span className="text-xs text-gray-400">JPG, PNG, GIF, WebP</span>
                <input
                  ref={editFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleEditFileChange}
                  className="hidden"
                />
              </label>
            )
          ) : (
            <input type="text" value={form.image} onChange={update("image")} placeholder="Image URL (optional)" className={inputClass} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select value={form.difficulty} onChange={update("difficulty")} className={inputClass}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select value={form.category} onChange={update("category")} className={inputClass}>
            {["Italian", "Vegan", "Dessert", "Mexican", "Asian", "American", "Mediterranean"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={editUploading} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition">
            {editUploading ? "Uploading..." : "Save"}
          </button>
          <button type="button" onClick={() => { setEditing(false); setError(""); removeEditFile(); setEditImageMode("url"); }} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-3">
          <img src={post.author.avatar} alt={post.author.displayName} className="w-9 h-9 rounded-full" />
          <Link to={`/users/${post.author.id}`} className="text-sm font-semibold text-orange-600 hover:underline">
            {post.author.displayName}
          </Link>
          <span className="ml-auto text-xs text-gray-400">{post.difficulty}</span>

          {isOwner && (
            <div className="flex gap-1">
              {/* Edit button */}
              <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-orange-500 transition" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
              </button>
              {/* Delete button */}
              <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6a.75.75 0 01-1.49.12l-.5-6a.75.75 0 01.71-.84zm2.84 0a.75.75 0 01.71.84l-.5 6a.75.75 0 11-1.49-.12l.5-6a.75.75 0 01.78-.72z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-3 py-2 mb-3">{error}</div>
        )}

        {/* Title & category */}
        <Link to={`/posts/${post.id}`} className="text-lg font-bold text-gray-800 hover:text-orange-600 transition">
          {post.title}
        </Link>
        <span className="inline-block mt-1 mb-3 text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
          {post.category}
        </span>

        {/* Ingredients */}
        <details className="mb-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-600">
            Ingredients ({post.ingredients.length})
          </summary>
          <ul className="mt-2 ml-4 list-disc text-sm text-gray-500 space-y-0.5">
            {post.ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </details>

        {/* Instructions */}
        <details className="mb-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-600">
            Instructions
          </summary>
          <p className="mt-2 text-sm text-gray-500 whitespace-pre-line">
            {post.instructions}
          </p>
        </details>

        {/* Actions row */}
        <div className="flex items-center gap-4 border-t pt-3">
          <button
            onClick={handleLike}
            className={`text-sm font-medium ${liked ? "text-red-500" : "text-gray-400"} hover:text-red-500 transition`}
          >
            {liked ? "♥" : "♡"} {likes.length}
          </button>

          {/* Star rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRating(star)}
                className={`text-lg leading-none ${star <= userRating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 transition`}
              >
                ★
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-1">({avgRating})</span>
          </div>

          <button
            onClick={handleToggleComments}
            className="text-sm font-medium text-gray-400 hover:text-orange-500 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 inline mr-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            {commentCount}
          </button>

          <button
            onClick={handleSave}
            className={`ml-auto text-sm font-medium ${saved ? "text-orange-500" : "text-gray-400"} hover:text-orange-500 transition`}
            title={saved ? "Unsave" : "Save to Recipe Book"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="border-t mt-3 pt-3">
            <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
              >
                Post
              </button>
            </form>

            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Link to={`/users/${c.author.id}`}>
                    <img src={c.author.avatar} alt={c.author.displayName} className="w-7 h-7 rounded-full mt-0.5" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <Link to={`/users/${c.author.id}`} className="text-xs font-semibold text-gray-800 hover:text-orange-600">
                        {c.author.displayName}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{c.text}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => handleLikeComment(c.id)}
                        className={`text-xs ${c.likes.includes(CURRENT_USER_ID) ? "text-red-500" : "text-gray-400"} hover:text-red-500 transition`}
                      >
                        {c.likes.includes(CURRENT_USER_ID) ? "♥" : "♡"} {c.likes.length}
                      </button>
                      {(c.author.id === CURRENT_USER_ID || isOwner) && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be the first!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostCard;
