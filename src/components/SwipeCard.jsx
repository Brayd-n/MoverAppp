import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function SwipeCard({ item, onSwipe, isTop }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-250, 250], [-28, 28]);
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  // Overlay opacities
  const sellOverlayOpacity = useTransform(x, [-200, -60, 0], [0.85, 0.3, 0]);
  const keepOverlayOpacity = useTransform(x, [0, 60, 200], [0, 0.3, 0.85]);

  const constraintsRef = useRef(null);

  function handleDragEnd(_, info) {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('keep');
    } else if (info.offset.x < -threshold) {
      onSwipe('sell');
    }
    // Snap back is handled by spring animation automatically
  }

  return (
    <motion.div
      className="swipe-card absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate, opacity: cardOpacity }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: isTop ? 1 : 0.97, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Card */}
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-white relative">
        {/* Item image */}
        <img
          src={item.imageUrl}
          alt={item.name || 'Item'}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Gradient overlay for label */}
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Item name label */}
        {item.name && (
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white text-xl font-semibold drop-shadow">{item.name}</p>
          </div>
        )}

        {/* SELL overlay (swipe left) */}
        <motion.div
          className="absolute inset-0 bg-red-500 flex items-center justify-center rounded-3xl"
          style={{ opacity: sellOverlayOpacity }}
        >
          <div className="border-4 border-white rounded-2xl px-8 py-4 rotate-12">
            <span className="text-white text-5xl font-black tracking-widest">SELL</span>
          </div>
        </motion.div>

        {/* KEEP overlay (swipe right) */}
        <motion.div
          className="absolute inset-0 bg-green-500 flex items-center justify-center rounded-3xl"
          style={{ opacity: keepOverlayOpacity }}
        >
          <div className="border-4 border-white rounded-2xl px-8 py-4 -rotate-12">
            <span className="text-white text-5xl font-black tracking-widest">KEEP</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
