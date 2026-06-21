import { useState, useEffect, createContext } from "react";
import { Routes, Route, Navigate, NavLink, Outlet } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Feed from "./components/Feed";
import Search from "./components/Search";
import Profile from "./components/Profile";
import CreateRecipe from "./components/CreateRecipe";
import RecipeDetail from "./components/RecipeDetail";
import RecipeBook from "./components/RecipeBook";

export const UserContext = createContext(null);

const navLinkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
    isActive
      ? "bg-accent-subtle text-accent"
      : "text-text-secondary hover:text-text-primary hover:bg-black/[0.03]"
  }`;

function Layout({ currentUserId }) {
  const { scrollY } = useScroll();

  const headerHeight = useTransform(scrollY, [0, 80], [64, 52]);
  const logoScale = useTransform(scrollY, [0, 80], [1, 0.9]);
  const bgOpacity = useTransform(scrollY, [0, 80], [0.72, 0.92]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const shadow = useTransform(scrollY, [0, 80], [
    "0 0 0 0 rgba(0,0,0,0)",
    "0 1px 12px rgba(0,0,0,0.06)",
  ]);

  return (
    <div className="min-h-screen font-sans">
      <motion.header
        className="glass sticky top-0 z-50"
        style={{
          height: headerHeight,
          boxShadow: shadow,
        }}
      >
        <motion.div
          className="absolute inset-0 border-b border-border"
          style={{ opacity: borderOpacity }}
        />
        <div className="relative max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <motion.div style={{ scale: logoScale, originX: 0 }}>
            <NavLink to="/feed" className="text-lg font-bold tracking-tight text-text-primary">
              Foodie Network
            </NavLink>
          </motion.div>
          <nav className="flex items-center gap-1">
            <NavLink to="/feed" className={navLinkClass}>
              Feed
            </NavLink>
            <NavLink to="/create" className={navLinkClass}>
              Create
            </NavLink>
            <NavLink to="/recipe-book" className={navLinkClass}>
              Recipe Book
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              Search
            </NavLink>
            {currentUserId && (
              <NavLink to={`/users/${currentUserId}`} className={navLinkClass}>
                Profile
              </NavLink>
            )}
          </nav>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.userId))
      .catch(() => {});
  }, []);

  return (
    <UserContext.Provider value={currentUserId}>
      <Routes>
        <Route element={<Layout currentUserId={currentUserId} />}>
          <Route index element={<Navigate to="/feed" replace />} />
          <Route path="feed" element={<Feed />} />
          <Route path="posts/:id" element={<RecipeDetail />} />
          <Route path="users/:id" element={<Profile />} />
          <Route path="recipe-book" element={<RecipeBook />} />
          <Route path="search" element={<Search />} />
          <Route path="create" element={<CreateRecipe />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
}

export default App;
