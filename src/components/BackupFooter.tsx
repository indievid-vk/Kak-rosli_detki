import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from '@/components/ui/button';
import { Download, Upload, ShieldCheck, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { exportData, importData } from '../lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';

export function BackupFooter() {
  const { refreshData, isAboutOpen, children, isModalOpen } = useStore();
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (isAboutOpen || isModalOpen || children.length === 0) return null;

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      await exportData();
      setAlert({ message: "Резервная копия успешно создана и скачивается!", type: 'success' });
    } catch(e) {
      setAlert({ message: "Ошибка при создании резервной копии. Попробуйте еще раз.", type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      await importData(file);
      await refreshData();
      setAlert({ message: "Ура! Все ваши моменты успешно восстановлены!", type: 'success' });
    } catch(err) {
      setAlert({ message: "Упс, ошибка при восстановлении данных. Проверьте файл.", type: 'error' });
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-[40] px-3 pointer-events-none print:hidden">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto w-full max-w-lg"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] sm:rounded-[2.5rem] p-1.5 flex items-center gap-1 pointer-events-auto ring-1 ring-black/5 overflow-hidden">
            <div className="flex items-center gap-1.5 pl-2 sm:pl-4 pr-1 text-stone-500 py-1 sm:py-2 flex-shrink-0">
              <div className="relative">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-emerald-400 rounded-full blur-[2px]" 
                />
              </div>
              <span className="hidden xs:inline text-[10px] sm:text-[12px] font-extrabold tracking-tight uppercase text-stone-500">Хранилище</span>
              <button 
                onClick={() => setShowInfo(true)}
                className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors ml-0.5"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex items-center gap-1 ml-auto flex-1 min-w-0">
              <Button 
                onClick={handleExport} 
                disabled={isProcessing}
                size="sm"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold h-10 sm:h-11 px-2 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 text-[11px] sm:text-sm"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 h-4" />
                <span className="truncate">Сохранить</span>
              </Button>
              
              <div className="relative flex-1 min-w-0">
                <Button 
                  disabled={isProcessing}
                  variant="outline"
                  size="sm"
                  className="w-full bg-stone-50/50 border-stone-200 text-stone-600 hover:bg-white hover:border-stone-300 rounded-full font-bold h-10 sm:h-11 px-2 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 text-[11px] sm:text-sm border-dashed"
                >
                  <Upload className="w-3.5 h-3.5 sm:w-4 h-4" />
                  <span className="truncate">Загрузить</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImport}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="sm:max-w-[460px] max-h-[85vh] border-0 bg-white shadow-2xl rounded-[2.5rem] p-0 overflow-hidden pointer-events-auto flex flex-col z-[110]">
          <div className="bg-emerald-50/50 p-6 sm:p-8 pt-8 sm:pt-10 text-center relative shrink-0">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-4 sm:mb-6">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" strokeWidth={2.5} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-center mb-2 text-stone-800">
                Хранилище данных
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-6 sm:px-8 pb-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4 text-stone-600 text-sm sm:text-[15px] leading-relaxed">
                <p>
                  Приложение работает как <span className="font-bold text-slate-800">PWA (Progressive Web App)</span> — современная технология, которая позволяет устанавливать приложение не из магазина приложений, а просто по прямой ссылке. Оно живет прямо в вашем браузере, почти не занимая лишнего места.
                </p>
                <p>
                  Все записи и фото хранятся <span className="font-bold text-slate-800">только внутри памяти браузера</span>. Это обеспечивает полную приватность, но есть нюанс: если вы очистите кэш или данные браузера, воспоминания могут исчезнуть навсегда. Поэтому мы создали инструмент безопасности — <span className="font-bold text-emerald-600">Резервное копирование данных</span>.
                </p>
                <p>
                  Регулярно скачивайте файл дневничка, чтобы обезопасить себя. Эту копию можно передавать между устройствами или даже пересылать друг другу через мессенджеры, чтобы восстановить историю на другом телефоне.
                </p>
              </div>
              
              <div className="pt-2 space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">Сохранение</h4>
                    <p className="text-stone-500 text-xs mt-1">Создает файл-архив всех ваших записей и фото.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5 text-blue-500" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">Загрузка</h4>
                    <p className="text-stone-500 text-xs mt-1">Восстанавливает историю из вашего файла резервной копии.</p>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowInfo(false)} 
              className="w-full mt-6 sm:mt-8 py-5 sm:py-6 rounded-2xl font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-xl shadow-stone-200 transition-all active:scale-95"
            >
              Все понятно
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!alert} onOpenChange={() => setAlert(null)}>
        <DialogContent className="sm:max-w-[400px] border-0 bg-white/95 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-0 overflow-hidden pointer-events-auto z-[110]">
          <div className={`h-2 ${alert?.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <div className="p-8 pt-10 text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${alert?.type === 'success' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              {alert?.type === 'success' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-rose-500" />
              )}
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-4 text-stone-800">
                {alert?.type === 'success' ? 'Все готово!' : 'Ой, ошибка'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-stone-500 leading-relaxed font-medium px-4 mb-8">
              {alert?.message}
            </p>
            <Button 
              onClick={() => setAlert(null)} 
              className={`w-full py-6 rounded-2xl font-bold transition-all shadow-lg text-lg ${
                alert?.type === 'success' 
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' 
                : 'bg-rose-500 hover:bg-rose-600 shadow-rose-100'
              } text-white`}
            >
              Принято
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
