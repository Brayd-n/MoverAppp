import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-purple-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Upload new items to the queue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm text-center bg-red-50 rounded-xl py-2 px-3"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white rounded-2xl py-3.5 font-semibold text-sm shadow-lg active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function UploadItem({ file, onRemove }) {
  const [name, setName] = useState('');
  const [progress, setProgress] = useState(null); // null = not started, 0–100 = uploading, 'done' = done
  const [error, setError] = useState('');
  const previewUrl = URL.createObjectURL(file);

  async function upload() {
    if (progress !== null) return;
    setProgress(0);
    setError('');

    try {
      const storageRef = ref(storage, `items/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(storageRef, file);

      task.on(
        'state_changed',
        (snap) => {
          setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        },
        (err) => {
          setError('Upload failed. Try again.');
          setProgress(null);
          console.error(err);
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          await addDoc(collection(db, 'items'), {
            imageUrl: url,
            name: name.trim() || null,
            status: 'pending',
            uploadedAt: serverTimestamp(),
          });
          setProgress('done');
        }
      );
    } catch (err) {
      setError('Upload failed.');
      setProgress(null);
    }
  }

  const isDone = progress === 'done';
  const isUploading = typeof progress === 'number';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isDone ? 'border-green-200' : 'border-gray-100'}`}
    >
      {/* Thumbnail */}
      <div className="relative h-36 bg-gray-100">
        <img src={previewUrl} alt="" className="w-full h-full object-cover" />

        {/* Overlay for done */}
        {isDone && (
          <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
            <span className="text-white text-4xl">✓</span>
          </div>
        )}

        {/* Remove button */}
        {!isUploading && !isDone && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full text-white text-xs flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>

      <div className="p-3">
        {!isDone && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name (optional)"
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-purple-400 mb-2"
            disabled={isUploading}
          />
        )}

        {isDone ? (
          <p className="text-green-600 text-xs font-semibold text-center">Added to queue ✓</p>
        ) : isUploading ? (
          <div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-1">{progress}%</p>
          </div>
        ) : (
          <button
            onClick={upload}
            className="w-full bg-purple-600 text-white text-xs font-semibold py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            Upload
          </button>
        )}

        {error && <p className="text-red-500 text-xs text-center mt-1">{error}</p>}
      </div>
    </motion.div>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!user) return <LoginForm />;

  function handleFiles(e) {
    const picked = Array.from(e.target.files).filter((f) =>
      f.type.startsWith('image/')
    );
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = '';
  }

  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadAll() {
    // Trigger all pending uploads
    document.querySelectorAll('[data-upload-trigger]').forEach((btn) => btn.click());
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-5 pt-safe pt-4 pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 active:scale-90 transition-transform text-lg"
          >
            ←
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800">Admin Panel 🛠️</h1>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-red-400 font-medium bg-red-50 px-3 py-2 rounded-xl active:scale-90 transition-transform"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        {/* Upload zone */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-lg mx-auto flex flex-col items-center justify-center gap-2 border-2 border-dashed border-purple-200 rounded-3xl py-8 text-gray-500 bg-purple-50/40 active:bg-purple-50 transition-colors mb-5"
        >
          <span className="text-4xl">📷</span>
          <span className="font-semibold text-purple-700">Tap to add photos</span>
          <span className="text-xs text-gray-400">You can select multiple at once</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />

        {/* Grid of pending uploads */}
        {files.length > 0 && (
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                {files.length} photo{files.length !== 1 ? 's' : ''} ready
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {files.map((file, idx) => (
                  <UploadItem
                    key={`${file.name}-${idx}`}
                    file={file}
                    onRemove={() => removeFile(idx)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-4">
            <p>Photos you upload will appear in the swipe queue for Mom.</p>
          </div>
        )}
      </div>
    </div>
  );
}
