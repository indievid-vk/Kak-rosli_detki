import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import confetti from 'canvas-confetti';

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'welcome' | 'updated'>('welcome');

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('welcome_seen');
    const justUpdated = localStorage.getItem('pwa_just_updated');

    // Handle post-update message
    if (justUpdated) {
      setMode('updated');
      setIsOpen(true);
      localStorage.removeItem('pwa_just_updated');
      
      // Trigger confetti after a short delay to allow dialog to animate in
      setTimeout(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: ReturnType<typeof setInterval> = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          // since particles fall down, start a bit higher than random
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      }, 500);
      
      return;
    }

    // Handle first-time welcome
    if (!hasSeenWelcome) {
      setMode('welcome');
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAction = () => {
    if (mode === 'welcome') {
      localStorage.setItem('welcome_seen', 'true');
    }
    setIsOpen(false);
  };

  const getContent = () => {
    switch (mode) {
      case 'updated':
        return {
          title: 'Приложение обновилось',
          text: 'Стало ещё удобнее!',
          button: 'Понятно'
        };
      default:
        return {
          title: 'Привет!',
          text: 'Надеемся, наше приложение поможет сохранить интересные моменты жизни маленьких шкод',
          button: 'Начать'
        };
    }
  };

  const content = getContent();

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
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="mb-6 relative"
          >
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent mb-2">
              {content.title}
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-6 px-2">
              {content.text}
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAction}
            className="w-full py-4 bg-orange-400 hover:opacity-90 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
          >
            {content.button}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
