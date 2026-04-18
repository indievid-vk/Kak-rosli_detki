import { useEffect, useState } from 'react';
import { Download, Smartphone, X, Share } from 'lucide-react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other' | null>(null);

  useEffect(() => {
    // 1. Определение платформы
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('other');
    }

    // 2. Проверка, что приложение уже установлено
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
      return;
    }

    const checkDeferredPrompt = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
        // Как только событие поймано, показываем баннер, если приветствие уже было когда-то просмотрено
        if (localStorage.getItem('hasSeenWelcome')) {
          setShowPrompt(true);
        }
      }
    };
    
    checkDeferredPrompt();

    // 3. Логика первого входа (приветственный диалог)
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomeDialog(true);
        localStorage.setItem('hasSeenWelcome', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 4. Слушатели событий
    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('app-install-ready', checkDeferredPrompt);
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setShowWelcomeDialog(false);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('app-install-ready', checkDeferredPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
        setShowWelcomeDialog(false);
      }
    } else if (platform === 'ios') {
      // На iOS просто показываем инструкцию (автоматически вызвать системный промпт нельзя)
      setShowWelcomeDialog(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowWelcomeDialog(false);
  };

  // Если уже установлено - ничего не показываем
  if (isStandalone) return null;

  return (
    <>
      {/* 1. ПРИВЕТСТВЕННЫЙ ДИАЛОГ (МОДАЛЬНОЕ ОКНО) */}
      {showWelcomeDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={handleDismiss} 
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-600 cursor-pointer rounded-full hover:bg-stone-50 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                <Smartphone className="w-10 h-10 text-orange-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-stone-800 mb-3 leading-tight tracking-tight">
                Быстрый доступ
              </h2>
              <p className="text-stone-500 mb-6 text-sm leading-relaxed">
                Установите «Как росли детки» на рабочий стол, чтобы записи всегда были под рукой и приложение работало быстрее.
              </p>

              <div className="space-y-4 w-full">
                {/* Кнопка установки для Android/Chrome */}
                {(deferredPrompt || platform !== 'ios') && (
                  <button 
                    onClick={handleInstall}
                    disabled={!deferredPrompt && platform !== 'ios'}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                      deferredPrompt 
                      ? 'bg-orange-500 text-white shadow-orange-200 hover:bg-orange-600 cursor-pointer' 
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed invisible'
                    }`}
                  >
                    <Download className="w-5 h-5" />
                    Установить сейчас
                  </button>
                )}
                
                {/* Инструкции для iOS */}
                {platform === 'ios' && (
                  <div className="bg-orange-50/50 p-5 rounded-2xl text-stone-700 text-left border border-orange-100 animate-in slide-in-from-top-2 duration-300">
                    <p className="font-bold text-orange-600 text-xs uppercase tracking-wider mb-3">Инструкция для iPhone:</p>
                    <ol className="space-y-3 text-[13px] font-medium">
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                        <span>Нажмите кнопку <Share className="w-4 h-4 inline mx-0.5 text-blue-500" /> («Поделиться») в меню снизу</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                        <span>Выберите «На экран "Домой"»</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                        <span>Нажмите «Добавить» в углу</span>
                      </li>
                    </ol>
                  </div>
                )}

                <button 
                  onClick={handleDismiss} 
                  className="w-full py-2 text-stone-400 text-sm font-semibold hover:text-stone-600 cursor-pointer transition-colors"
                >
                  Продолжать в браузере
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ПЛАВАЮЩИЙ ИНДИКАТОР (КАК В "СЛАДКОМ КАЛЬКУЛЯТОРЕ") */}
      {!showWelcomeDialog && (deferredPrompt || platform === 'ios') && (
        <button
          onClick={() => setShowWelcomeDialog(true)}
          className="fixed top-6 right-6 z-[9000] bg-white text-orange-500 h-10 px-4 rounded-full font-bold shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-stone-100 flex items-center gap-2 hover:bg-orange-50 active:scale-95 transition-all animate-in fade-in slide-in-from-right-4 duration-500 cursor-pointer group"
        >
          <div className="relative">
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
          <span className="text-xs uppercase tracking-widest hidden xs:inline">Установить</span>
        </button>
      )}

      {/* 3. НИЖНЯЯ ПЛАШКА (ДЛЯ ТЕХ КТО ПРОПУСТИЛ ВСЁ) */}
      {showPrompt && !showWelcomeDialog && deferredPrompt && (
        <div className="fixed bottom-6 left-4 right-4 z-[9999] p-5 bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-stone-200 flex items-center justify-between animate-in slide-in-from-bottom duration-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shadow-inner">
              <Download className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-stone-800 text-sm tracking-tight leading-none mb-1">Добавить на экран?</p>
              <p className="text-[11px] text-stone-500 font-medium">Будет работать как приложение</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDismiss} className="px-3 py-2 text-stone-400 text-xs font-bold hover:text-stone-600 cursor-pointer">
              Позже
            </button>
            <button 
              onClick={handleInstall} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-orange-100 transition-all active:scale-95 cursor-pointer"
            >
              Да, установить
            </button>
          </div>
        </div>
      )}
    </>
  );
};