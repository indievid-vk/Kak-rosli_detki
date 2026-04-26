import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    // Listen for update from pwa-setup.js
    const handleUpdate = () => {
      setIsUpdateAvailable(true);
      setIsOpen(true); // Re-open if update found
    };

    window.addEventListener('pwa-update-available', handleUpdate);

    // Show initial welcome with a small delay
    const timer = setTimeout(() => {
      // If no update found yet, show normal welcome
      if (!isUpdateAvailable) {
        setIsOpen(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdate);
      clearTimeout(timer);
    };
  }, [isUpdateAvailable]);

  const handleAction = () => {
    if (isUpdateAvailable) {
      // Force reload to apply update
      window.location.reload();
    } else {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[320px] p-0 overflow-hidden bg-white border-0 rounded-[2rem] shadow-2xl">
        <div className="relative p-8 flex flex-col items-center text-center bg-gradient-to-b from-pink-50 to-white">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            className="mb-6 relative"
          >
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
            </div>
            {isUpdateAvailable && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center border-2 border-white"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent mb-2">
              {isUpdateAvailable ? 'Обновление!' : 'Привет!'}
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-6 px-2">
              {isUpdateAvailable 
                ? 'Мы улучшили приложение! Нажмите кнопку ниже, чтобы применить изменения.'
                : 'Рады видеть вас снова. Пусть каждый момент с вашими детьми будет особенным ❤️'}
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAction}
            className={`w-full py-4 ${isUpdateAvailable ? 'bg-orange-500' : 'bg-orange-400'} hover:opacity-90 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2`}
          >
            {isUpdateAvailable ? 'Обновить сейчас' : 'Начать'}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
