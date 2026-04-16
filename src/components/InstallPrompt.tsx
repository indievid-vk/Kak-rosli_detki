import { useEffect, useState } from 'react';

// Типизация события для Chrome
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      // Предотвращаем автоматический показ мини-бара Chrome
      e.preventDefault();
      // Сохраняем событие, чтобы вызвать его позже
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Показываем системный диалог установки
    deferredPrompt.prompt();

    // Ждем выбора пользователя
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Пользователь выбрал: ${outcome}`);

    // Очищаем переменную
    setDeferredPrompt(null);
  };

  // Если окно не "созрело" — ничего не показываем
  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 p-5 bg-white rounded-[2rem] shadow-2xl border border-stone-100 flex items-center justify-between z-[9999]">
      <p className="font-bold text-stone-800">Установить приложение?</p>
      <button 
        onClick={handleInstallClick}
        className="bg-orange-500 text-white px-5 py-3 rounded-full font-bold shadow-sm hover:bg-orange-600 transition-colors"
      >
        Установить
      </button>
    </div>
  );
};