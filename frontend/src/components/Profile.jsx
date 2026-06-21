import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((res) => res.json())
      .then(setUser);
  }, [id]);

  if (!user) return <p className="text-center text-text-tertiary py-16 text-sm">Loading...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Profile card */}
      <div className="card p-6 mb-8 flex items-center gap-6">
        <img
          src={user.avatar}
          alt={user.displayName}
          className="w-20 h-20 rounded-full ring-2 ring-border"
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">{user.displayName}</h2>
          <p className="text-sm text-text-tertiary">@{user.username}</p>
          <p className="text-sm text-text-secondary mt-1.5">{user.bio}</p>
          <div className="flex gap-6 mt-3 text-sm">
            <span className="text-text-secondary">
              <strong className="text-text-primary">{user.followers.length}</strong> Followers
            </span>
            <span className="text-text-secondary">
              <strong className="text-text-primary">{user.following.length}</strong> Following
            </span>
            <span className="text-text-secondary">
              {user.rating !== null ? (
                <><strong className="text-amber-500">★ {user.rating}</strong> Rating</>
              ) : (
                <span className="text-text-tertiary">No rating yet</span>
              )}
            </span>
          </div>
        </div>
      </div>

      <h3 className="text-base font-semibold text-text-primary mb-4">
        Posts ({user.posts.length})
      </h3>
      {user.posts.length === 0 ? (
        <p className="text-text-tertiary text-center py-12 text-sm">No posts yet.</p>
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
              <motion.div
                key={post.id}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                style={{ willChange: "opacity, transform" }}
              >
                <PostCard
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
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default Profile;
