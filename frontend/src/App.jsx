import { Routes, Route, Navigate, NavLink, Outlet } from "react-router-dom";
import Feed from "./components/Feed";
import Search from "./components/Search";
import Profile from "./components/Profile";
import CreateRecipe from "./components/CreateRecipe";
import RecipeDetail from "./components/RecipeDetail";
import RecipeBook from "./components/RecipeBook";

const CURRENT_USER_ID = 1;

const navLinkClass = ({ isActive }) =>
  `transition ${
    isActive
      ? "underline underline-offset-4"
      : "hover:underline hover:underline-offset-4 opacity-80"
  }`;

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-orange-500 text-white py-4 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <NavLink to="/feed" className="text-2xl font-bold">
            Foodie Network
          </NavLink>
          <nav className="flex gap-6 text-sm font-medium">
            <NavLink to="/feed" className={navLinkClass}>
              Feed
            </NavLink>
            <NavLink to="/create" className={navLinkClass}>
              + Create
            </NavLink>
            <NavLink to="/recipe-book" className={navLinkClass}>
              Recipe Book
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              Search
            </NavLink>
            <NavLink to={`/users/${CURRENT_USER_ID}`} className={navLinkClass}>
              Profile
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/feed" replace />} />
        <Route path="feed" element={<Feed />} />
        <Route path="posts/:id" element={<RecipeDetail />} />
        <Route path="users/:id" element={<Profile />} />
        <Route path="recipe-book" element={<RecipeBook />} />
        <Route path="search" element={<Search />} />
        <Route path="create" element={<CreateRecipe />} />
      </Route>
    </Routes>
  );
}

export default App;
