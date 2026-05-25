import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function KeepItem({ item }) {
  async function moveBack() {
    await updateDoc(doc(db, 'items', item.id), { status: 'pending' });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, height: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex gap-0"
    >
      {/* Image */}
      <div className="w-28 h-28 flex-shrink-0">
        <img
          src={item.imageUrl}
          alt={item.name || 'Item'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <p className="font-semibold text-gray-800 truncate text-sm">
            {item.name || 'Unnamed item'}
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full mt-1 font-medium">
            💚 Keeping
          </span>
        </div>

        {/* Undo button */}
        <div className="flex justify-end">
          <button
            onClick={moveBack}
            className="text-gray-300 hover:text-gray-500 active:scale-90 transition-all text-lg"
            title="Put back in queue"
          >
            ↩
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function KeepListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'items'),
      where('status', '==', 'keep')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aTime = a.uploadedAt?.toMillis?.() ?? 0;
            const bTime = b.uploadedAt?.toMillis?.() ?? 0;
            return aTime - bTime;
          });
        setItems(data);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-5 pt-safe pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 active:scale-90 transition-transform text-lg"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Keep List 💚</h1>
            <p className="text-xs text-gray-500">
              {items.length} item{items.length !== 1 ? 's' : ''} to keep
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-6xl mb-4">💚</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Nothing kept yet</h2>
            <p className="text-gray-400 text-sm mb-6">
              Swipe right on items to keep them and they'll appear here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-green-500 text-white px-6 py-3 rounded-2xl font-semibold shadow active:scale-95 transition-transform"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <KeepItem key={item.id} item={item} />
              ))}
            </AnimatePresence>
            <div className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
