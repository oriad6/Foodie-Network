import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PostCard from "./PostCard";

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((res) => res.json())
      .then(setUser);
  }, [id]);

  if (!user) return <p className="text-center text-gray-400 py-12">Loading...</p>;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex items-center gap-6">
        <img
          src={user.avatar}
          alt={user.displayName}
          className="w-20 h-20 rounded-full"
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">{user.displayName}</h2>
          <p className="text-sm text-gray-500">@{user.username}</p>
          <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
          <div className="flex gap-6 mt-3 text-sm">
            <span className="text-gray-600">
              <strong className="text-gray-800">{user.followers.length}</strong> Followers
            </span>
            <span className="text-gray-600">
              <strong className="text-gray-800">{user.following.length}</strong> Following
            </span>
            <span className="text-gray-600">
              <strong className="text-yellow-500">★ {user.rating}</strong> Rating
            </span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Posts ({user.posts.length})
      </h3>
      {user.posts.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user.posts.map((post) => {
            const enrichedPost = {
              ...post,
              author: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar,
              },
            };
            return (
              <PostCard
                key={post.id}
                post={enrichedPost}
                onDelete={(postId) =>
                  setUser((prev) => ({
                    ...prev,
                    posts: prev.posts.filter((p) => p.id !== postId),
                  }))
                }
                onUpdate={(updated) =>
                  setUser((prev) => ({
                    ...prev,
                    posts: prev.posts.map((p) => (p.id === updated.id ? updated : p)),
                  }))
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Profile;
