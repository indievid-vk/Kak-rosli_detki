import { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Проверка, что приложение уже установлено и запущено автономно
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomeDialog(true);
        localStorage.setItem('hasSeenWelcome', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (hasSeenWelcome) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsStandalone(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowWelcomeDialog(false);
      setShowPrompt(false);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setShowWelcomeDialog(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowWelcomeDialog(false);
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Приветственный диалог */}
      {showWelcomeDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={handleDismiss} className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-600 cursor-pointer">
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mb-6">
                <Smartphone className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-3 leading-tight">
                Установите приложение в одно касание
              </h2>
              <p className="text-stone-500 mb-6">
                Добавьте «Как росли детки» на главный экран для быстрого доступа
              </p>
              <div className="space-y-4 w-full">
                {deferredPrompt ? (
                  <button 
                    onClick={handleInstall}
                    className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 cursor-pointer hover:bg-orange-600 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Установить сейчас
                  </button>
                ) : (
                  <div className="bg-stone-50 p-4 rounded-2xl text-sm text-stone-600 space-y-2 border border-stone-100">
                    <p className="font-medium text-stone-800">Для установки вручную:</p>
                    <p><strong>Android:</strong> Меню → «Установить»</p>
                    <p><strong>iOS:</strong> Поделиться → «На экран Домой»</p>
                  </div>
                )}
                <button onClick={handleDismiss} className="w-full py-2 text-stone-400 font-medium hover:text-stone-600 cursor-pointer transition-colors">
                  Продолжить в браузере
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Постоянная висящая кнопка установки поверх интерфейса (вверху справа) */}
      {!showWelcomeDialog && !isStandalone && deferredPrompt && (
        <button
          onClick={() => setShowWelcomeDialog(true)}
          className="fixed top-4 right-4 z-[9000] bg-white text-orange-500 px-4 py-2.5 rounded-2xl font-bold shadow-lg border border-stone-100 flex items-center gap-2 hover:bg-orange-50 transition-colors animate-in fade-in cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Установить
        </button>
      )}

      {/* Небольшой попап внизу */}
      {showPrompt && !showWelcomeDialog && (
        <div className="fixed bottom-6 left-4 right-4 z-[9999] p-5 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-stone-100 flex items-center justify-between animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-orange-500" />
            </div>
            <p className="font-bold text-stone-800 tracking-tight">Установить на экран?</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDismiss} className="px-4 py-2.5 text-stone-400 font-bold hover:text-stone-600 cursor-pointer transition-colors">
              Позже
            </button>
            <button onClick={handleInstall} className="bg-orange-500 hover:bg-orange-600 transition-colors cursor-pointer text-white px-6 py-2.5 rounded-2xl font-bold shadow-md">
              Да
            </button>
          </div>
        </div>
      )}
    </>
  );
};