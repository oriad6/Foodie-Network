import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

function CreateRecipe() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageMode, setImageMode] = useState("file");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    ingredients: "",
    instructions: "",
    image: "",
    difficulty: "",
    category: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, image: "" }));
  };

  const removeFile = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async () => {
    if (!imageFile) return null;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      return data.url;
    } catch (err) {
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let imageUrl = form.image;

      if (imageMode === "file" && imageFile) {
        imageUrl = await uploadFile();
      }

      const payload = {
        ...form,
        image: imageUrl,
        ingredients: form.ingredients
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      setForm({
        title: "",
        ingredients: "",
        instructions: "",
        image: "",
        difficulty: "",
        category: "",
      });
      removeFile();
      navigate("/feed");
    } catch (err) {
      setError(err.message || "Could not connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const modeButtonClass = (active) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
      active
        ? "bg-accent text-white"
        : "bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-border-strong"
    }`;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="card p-6 max-w-2xl mx-auto space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h2 className="text-xl font-bold text-text-primary tracking-tight">Create a New Recipe</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={update("title")}
          placeholder="e.g. Spicy Ramen Bowl"
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Ingredients <span className="text-text-tertiary font-normal">(comma separated)</span>
        </label>
        <input
          type="text"
          value={form.ingredients}
          onChange={update("ingredients")}
          placeholder="e.g. 200g noodles, 1 egg, soy sauce, chili oil"
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Instructions</label>
        <textarea
          value={form.instructions}
          onChange={update("instructions")}
          rows={4}
          placeholder="Step-by-step instructions..."
          className="input resize-y"
        />
      </div>

      {/* Image section */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Photo <span className="text-text-tertiary font-normal">(optional)</span>
        </label>

        <div className="flex gap-2 mb-2.5">
          <button type="button" onClick={() => setImageMode("file")} className={modeButtonClass(imageMode === "file")}>
            Upload File
          </button>
          <button type="button" onClick={() => setImageMode("url")} className={modeButtonClass(imageMode === "url")}>
            Paste URL
          </button>
        </div>

        {imageMode === "file" ? (
          <div>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2.5 right-2.5 glass text-text-secondary hover:text-red-500 rounded-lg p-1.5 transition-colors"
                  title="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border-strong rounded-xl hover:border-accent hover:bg-accent-subtle/50 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-text-tertiary mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <span className="text-sm text-text-secondary">Click to browse or drag & drop</span>
                <span className="text-xs text-text-tertiary mt-1">JPG, PNG, GIF, WebP (max 10 MB)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          <input
            type="text"
            value={form.image}
            onChange={update("image")}
            placeholder="https://example.com/photo.jpg"
            className="input"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Difficulty</label>
          <select value={form.difficulty} onChange={update("difficulty")} className="input">
            <option value="">Select...</option>
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Category</label>
          <select value={form.category} onChange={update("category")} className="input">
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="btn-primary w-full py-2.5"
      >
        {uploading ? "Uploading image..." : submitting ? "Publishing..." : "Publish Recipe"}
      </button>
    </motion.form>
  );
}

export default CreateRecipe;
