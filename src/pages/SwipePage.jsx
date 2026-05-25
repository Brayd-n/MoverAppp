import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import SwipeCard from '../components/SwipeCard';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function SwipePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSwiped, setLastSwiped] = useState(null); // for undo
  const [tapCount, setTapCount] = useState(0); // secret admin tap
  const navigate = useNavigate();

  // Secret: tap the title 5× fast to open admin
  function handleTitleTap() {
    setTapCount((n) => {
      const next = n + 1;
      if (next >= 5) {
        navigate('/admin');
        return 0;
      }
      setTimeout(() => setTapCount(0), 2000);
      return next;
    });
  }

  useEffect(() => {
    // No orderBy here to avoid needing a composite index — we sort client-side
    const q = query(
      collection(db, 'items'),
      where('status', '==', 'pending')
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

  async function handleSwipe(direction, item) {
    setLastSwiped({ item, direction });
    await updateDoc(doc(db, 'items', item.id), { status: direction });
  }

  async function handleUndo() {
    if (!lastSwiped) return;
    await updateDoc(doc(db, 'items', lastSwiped.item.id), { status: 'pending' });
    setLastSwiped(null);
  }

  const topItem = items[0];
  const nextItem = items[1];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-pink-50 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-3">
        <button
          onClick={() => navigate('/sell-list')}
          className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-md text-gray-700 font-medium text-sm active:scale-95 transition-transform"
        >
          <span className="text-lg">🏷️</span>
          <span>Sell List</span>
        </button>

        <button onClick={handleTitleTap} className="text-center">
          <h1 className="text-xl font-bold text-gray-800">Keep or Sell?</h1>
          <p className="text-xs text-gray-500 font-medium">
            {items.length} item{items.length !== 1 ? 's' : ''} left
          </p>
        </button>

        <div className="w-24" /> {/* spacer */}
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Loading items…</p>
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-8"
          >
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">All Done!</h2>
            <p className="text-gray-500 mb-6">
              You've sorted through everything. Check the sell list to add prices!
            </p>
            <button
              onClick={() => navigate('/sell-list')}
              className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform"
            >
              View Sell List 🏷️
            </button>
          </motion.div>
        ) : (
          <div className="relative w-full max-w-sm" style={{ height: '65vh', maxHeight: '520px' }}>
            {/* Back card (next item) */}
            {nextItem && (
              <div className="absolute inset-0" style={{ transform: 'scale(0.95) translateY(12px)', zIndex: 1 }}>
                <div className="w-full h-full rounded-3xl overflow-hidden shadow-xl bg-white">
                  <img
                    src={nextItem.imageUrl}
                    alt={nextItem.name || 'Item'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Top card */}
            <AnimatePresence mode="wait">
              {topItem && (
                <div key={topItem.id} className="absolute inset-0" style={{ zIndex: 2 }}>
                  <SwipeCard
                    item={topItem}
                    isTop={true}
                    onSwipe={(dir) => handleSwipe(dir, topItem)}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!loading && items.length > 0 && (
        <div className="pb-safe pb-6 px-8">
          <div className="flex items-center justify-between gap-4 max-w-sm mx-auto">
            {/* Sell button */}
            <button
              onClick={() => handleSwipe('sell', topItem)}
              className="flex-1 flex flex-col items-center gap-1 bg-white rounded-2xl py-3 shadow-md active:scale-95 transition-transform border-2 border-red-100"
            >
              <span className="text-3xl">👈</span>
              <span className="text-sm font-semibold text-red-500">Sell</span>
            </button>

            {/* Undo button */}
            <button
              onClick={handleUndo}
              disabled={!lastSwiped}
              className="flex flex-col items-center gap-1 bg-white rounded-2xl py-3 px-5 shadow-md active:scale-95 transition-transform border-2 border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="text-2xl">↩️</span>
              <span className="text-xs font-medium text-gray-500">Undo</span>
            </button>

            {/* Keep button */}
            <button
              onClick={() => handleSwipe('keep', topItem)}
              className="flex-1 flex flex-col items-center gap-1 bg-white rounded-2xl py-3 shadow-md active:scale-95 transition-transform border-2 border-green-100"
            >
              <span className="text-3xl">👉</span>
              <span className="text-sm font-semibold text-green-600">Keep</span>
            </button>
          </div>

          {/* Hint text */}
          <p className="text-center text-xs text-gray-400 mt-3">
            Swipe the card or tap a button
          </p>
        </div>
      )}
    </div>
  );
}
