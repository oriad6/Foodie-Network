import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";

function RecipeDetail() {
  const CURRENT_USER_ID = useContext(UserContext);
  const findUserRating = (r) => r.find((x) => x.userId === CURRENT_USER_ID)?.score ?? 0;
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [likes, setLikes] = useState([]);
  const [liked, setLiked] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [actionError, setActionError] = useState("");
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetch(`/api/recipe-book/saved/${id}/check`)
      .then((res) => res.json())
      .then((data) => setSaved(data.saved))
      .catch(() => {});
    fetch(`/api/posts/${id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    setPost(null);
    setError("");
    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLikes(data.likes);
        setLiked(data.likes.includes(CURRENT_USER_ID));
        setRatings(data.ratings);
        setUserRating(findUserRating(data.ratings));
      })
      .catch(() => setError("Recipe not found."));
  }, [id]);

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
      : "N/A";

  const handleLike = async () => {
    const prevLikes = likes;
    const prevLiked = liked;
    setLiked((prev) => !prev);
    setLikes((prev) =>
      prevLiked ? prev.filter((uid) => uid !== CURRENT_USER_ID) : [...prev, CURRENT_USER_ID]
    );
    setActionError("");
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) {
        setLikes(prevLikes);
        setLiked(prevLiked);
        setActionError(data.error || "Failed to update like.");
        return;
      }
      setLikes(data.likes);
      setLiked(data.likes.includes(CURRENT_USER_ID));
    } catch {
      setLikes(prevLikes);
      setLiked(prevLiked);
      setActionError("Could not connect to the server.");
    }
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
    setActionError("");
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
        setActionError(data.error || "Failed to save rating.");
        return;
      }
      setRatings(data.ratings);
      setUserRating(findUserRating(data.ratings));
    } catch {
      setRatings(prevRatings);
      setUserRating(prevUserRating);
      setActionError("Could not connect to the server.");
    }
  };

  const handleSave = async () => {
    const wasSaved = saved;
    setSaved(!wasSaved);
    setActionError("");
    try {
      const res = await fetch(`/api/recipe-book/saved/${post.id}`, {
        method: wasSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: wasSaved ? undefined : JSON.stringify({}),
      });
      if (!res.ok) {
        setSaved(wasSaved);
        const data = await res.json();
        setActionError(data.error || "Failed to save recipe.");
      }
    } catch {
      setSaved(wasSaved);
      setActionError("Could not connect to the server.");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setActionError("");
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to add comment.");
        return;
      }
      setComments((prev) => [...prev, data]);
      setCommentText("");
    } catch {
      setActionError("Could not connect to the server.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {
      setActionError("Failed to delete comment.");
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
        setActionError(data.error || "Failed to delete.");
        return;
      }
      navigate("/feed");
    } catch {
      setActionError("Could not connect to the server.");
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">{error}</p>
        <Link to="/feed" className="text-orange-600 hover:underline text-sm font-medium">
          &larr; Back to feed
        </Link>
      </div>
    );
  }

  if (!post) {
    return <p className="text-center text-gray-400 py-12">Loading...</p>;
  }

  const isOwner = post.author.id === CURRENT_USER_ID;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/feed" className="inline-block text-sm text-orange-600 hover:underline font-medium mb-4">
        &larr; Back to feed
      </Link>

      {/* Hero image */}
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-72 object-cover rounded-xl shadow-md"
      />

      <div className="bg-white rounded-xl shadow-md p-6 mt-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
          {isOwner && (
            <div className="flex gap-1 shrink-0">
              <Link
                to={`/posts/${post.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  // Could open edit modal - for now we'll keep it simple
                }}
                className="hidden"
              />
              <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6a.75.75 0 01-1.49.12l-.5-6a.75.75 0 01.71-.84zm2.84 0a.75.75 0 01.71.84l-.5 6a.75.75 0 11-1.49-.12l.5-6a.75.75 0 01.78-.72z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Meta tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {post.difficulty}
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        {actionError && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
            {actionError}
          </div>
        )}

        {/* Author card */}
        <Link
          to={`/users/${post.author.id}`}
          className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 mb-6 hover:bg-gray-100 transition"
        >
          <img src={post.author.avatar} alt={post.author.displayName} className="w-11 h-11 rounded-full" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{post.author.displayName}</p>
            <p className="text-xs text-gray-500">@{post.author.username}</p>
          </div>
        </Link>

        {/* Ingredients */}
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Ingredients</h2>
        <ul className="mb-6 ml-5 list-disc text-sm text-gray-600 space-y-1">
          {post.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>

        {/* Instructions */}
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Instructions</h2>
        <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed mb-6">
          {post.instructions}
        </p>

        {/* Actions row */}
        <div className="flex items-center gap-5 border-t pt-4">
          <button
            onClick={handleLike}
            className={`text-sm font-medium ${liked ? "text-red-500" : "text-gray-400"} hover:text-red-500 transition`}
          >
            {liked ? "♥" : "♡"} {likes.length} {likes.length === 1 ? "like" : "likes"}
          </button>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRating(star)}
                className={`text-xl leading-none ${star <= userRating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 transition`}
              >
                ★
              </button>
            ))}
            <span className="text-sm text-gray-400 ml-1">({avgRating})</span>
          </div>

          <button
            onClick={handleSave}
            className={`ml-auto text-sm font-medium flex items-center gap-1 ${saved ? "text-orange-500" : "text-gray-400"} hover:text-orange-500 transition`}
            title={saved ? "Unsave" : "Save to Recipe Book"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Comments section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Comments ({comments.length})
        </h2>

        <form onSubmit={handleAddComment} className="flex gap-2 mb-5">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
          >
            Post
          </button>
        </form>

        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Link to={`/users/${c.author.id}`}>
                <img src={c.author.avatar} alt={c.author.displayName} className="w-9 h-9 rounded-full mt-0.5" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link to={`/users/${c.author.id}`} className="text-sm font-semibold text-gray-800 hover:text-orange-600">
                    {c.author.displayName}
                  </Link>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{c.text}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    onClick={() => handleLikeComment(c.id)}
                    className={`text-xs font-medium ${c.likes.includes(CURRENT_USER_ID) ? "text-red-500" : "text-gray-400"} hover:text-red-500 transition`}
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
            <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
