/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Shield, Smartphone, Zap } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col h-full bg-white relative overflow-hidden"
    >
      {/* Background Dimmed Logo */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] flex items-center justify-center overflow-hidden"
      >
        <img 
          src="/icon-512.png" 
          alt="" 
          className="w-[120%] h-auto grayscale filter blur-[2px] transform rotate-[-15deg]" 
        />
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-stone-100 bg-white/60 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-stone-100 transition-colors"
          id="back-button"
        >
          <ArrowLeft className="w-6 h-6 text-stone-600" />
        </button>
        <h1 className="text-xl font-bold text-stone-800">О приложении</h1>
        <div className="w-10" /> {/* Spacer to center title */}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto z-10 px-6 py-10 relative">
        <div className="max-w-xl mx-auto space-y-12">
          {/* Main Message */}
          <section className="text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-orange-100 to-pink-100 mb-2 shadow-sm"
            >
              <img src="/icon-512.png" alt="Logo" className="w-16 h-16 object-contain" />
            </motion.div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
                История одного папы
              </h2>
              <p className="text-lg text-stone-700 leading-relaxed font-medium">
                Это приложение создано папой для всех мамочек и папочек, которые хотят сохранить для истории самые интересные и трогательные события в жизни своих деток.
              </p>
            </div>
          </section>

          {/* Core Info */}
          <section className="space-y-8 bg-white/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white shadow-sm">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-stone-800 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                Локально и приватно
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Наше приложение — само еще ребенок. Оно максимально простое и полностью <strong>локальное</strong>. Все данные сохраняются только на вашем телефоне без передачи в Интернет. Никакой облачной работы, никакой регистрации — ваши воспоминания принадлежат только вам.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-stone-800 flex items-center gap-3">
                <Heart className="w-6 h-6 text-pink-500" />
                Всегда бесплатно
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Я создал этот дневник как полезный инструмент для своей семьи и решил поделиться им со всеми. Приложение совершенно бесплатно, без рекламы и подписок.
              </p>
            </div>
          </section>

          {/* Tech Status */}
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex items-center gap-2 text-stone-400 text-sm font-medium">
              <Smartphone className="w-4 h-4" />
              <span>Версия 1.1.0 • Offline First</span>
            </div>
            <p className="text-stone-400 text-center text-xs max-w-xs uppercase tracking-widest leading-loose">
              Сохраняйте моменты, <br /> пока они еще здесь
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
