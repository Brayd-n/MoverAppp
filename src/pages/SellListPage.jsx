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
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function SellItem({ item }) {
  const [price, setPrice] = useState(item.suggestedPrice ?? '');
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  async function savePrice() {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) return;
    await updateDoc(doc(db, 'items', item.id), {
      suggestedPrice: numPrice,
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  async function moveBack() {
    await updateDoc(doc(db, 'items', item.id), { status: 'pending' });
  }

  function handlePriceKey(e) {
    if (e.key === 'Enter') savePrice();
    if (e.key === 'Escape') {
      setPrice(item.suggestedPrice ?? '');
      setEditing(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, height: 0 }}
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
          <p className="text-xs text-gray-400 mt-0.5">Marked for sale</p>
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1 flex-1">
              <span className="text-gray-500 text-sm font-medium">$</span>
              <input
                autoFocus
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={handlePriceKey}
                className="flex-1 border-b-2 border-purple-400 outline-none text-sm font-semibold py-0.5 bg-transparent"
                placeholder="0.00"
              />
              <button
                onClick={savePrice}
                className="text-xs bg-purple-600 text-white px-2 py-1 rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl"
            >
              {item.suggestedPrice != null ? (
                <>💰 ${Number(item.suggestedPrice).toFixed(2)}</>
              ) : (
                <>+ Set price</>
              )}
            </button>
          )}

          {saved && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-green-500 text-xs font-medium"
            >
              ✓ Saved
            </motion.span>
          )}

          {/* Move back to queue */}
          <button
            onClick={moveBack}
            className="ml-auto text-gray-300 hover:text-gray-500 active:scale-90 transition-all text-lg"
            title="Put back in queue"
          >
            ↩
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SellListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'items'),
      where('status', '==', 'sell'),
      orderBy('uploadedAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const priced = items.filter((i) => i.suggestedPrice != null);
  const totalValue = priced.reduce((sum, i) => sum + i.suggestedPrice, 0);

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
            <h1 className="text-xl font-bold text-gray-800">Sell List 🏷️</h1>
            <p className="text-xs text-gray-500">
              {items.length} item{items.length !== 1 ? 's' : ''}
              {priced.length > 0 && (
                <> · Est. total: <span className="font-semibold text-green-600">${totalValue.toFixed(2)}</span></>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Nothing here yet</h2>
            <p className="text-gray-400 text-sm mb-6">
              Swipe left on items you want to sell and they'll appear here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-semibold shadow active:scale-95 transition-transform"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <SellItem key={item.id} item={item} />
              ))}
            </AnimatePresence>

            <div className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
