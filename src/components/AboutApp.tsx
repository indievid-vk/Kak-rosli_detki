import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Shield, Heart, Download, Upload, Plus, Info } from 'lucide-react';
import { exportData, importData } from '../lib/db';

export function AboutApp({ className }: { className?: string }) {
  const { refreshData, isAboutOpen, setIsAboutOpen } = useStore();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      await exportData();
      setAlertMessage("Резервная копия успешно создана и скачивается!");
    } catch(e) {
      setAlertMessage("Ошибка при создании резервной копии. Попробуйте еще раз.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      await refreshData();
      setIsAboutOpen(false);
      setAlertMessage("Ура! Данные успешно восстановлены!");
    } catch(err) {
      setAlertMessage("Упс, ошибка при восстановлении данных. Возможно, не тот файл?");
    }
    e.target.value = '';
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className={className || "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-full"} 
        onClick={() => setIsAboutOpen(true)}
      >
        <Info className="h-6 w-6" />
      </Button>

      <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
        <DialogContent className="w-[calc(100vw-10mm)] h-[calc(100dvh-10mm)] max-w-md sm:max-w-[500px] sm:h-[85vh] max-h-[100dvh] p-0 gap-0 rounded-[1.5rem] sm:rounded-[2rem] bg-white border-none shadow-2xl overflow-hidden flex flex-col pointer-events-auto z-50">
          <div className="flex items-center justify-center p-4 relative bg-white shrink-0 shadow-sm z-10">
             <button onClick={() => setIsAboutOpen(false)} className="absolute left-4 p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
               <ArrowLeft className="w-6 h-6" />
             </button>
             <h2 className="text-xl font-semibold text-stone-800">О приложении</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-stone-50 flex flex-col">
            <div className="p-6 bg-white flex-1 flex flex-col space-y-8">
                 <div>
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-7 h-7 rounded-sm overflow-hidden shadow-sm flex-shrink-0">
                         <img src={`${(import.meta as any).env.BASE_URL}icon-512-rounded.png`} alt="Логотип" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `${(import.meta as any).env.BASE_URL}apple-icon.png`; }} />
                       </div>
                       <h3 className="text-[19px] font-bold text-slate-900 leading-tight">История создания приложения</h3>
                     </div>
                     <p className="text-stone-600 leading-relaxed text-[15px]">
                       Идея сохранять важные, интересные, курьёзные моменты деток родилась, когда наши дети были маленькими и мы записывали, снимали их разными доступными способами, например, тараборские слова записывали в табличку. Программировать мы не умели, вот и записывали, где придется. Сейчас в эру нейросетей получилось создать простое приложение для записи событий деток.
                     </p>
                 </div>

                 <div>
                    <div className="flex items-center gap-3 mb-3">
                       <Shield className="w-6 h-6 text-blue-500" strokeWidth={2.5} />
                       <h3 className="text-[19px] font-bold text-slate-900">Локально и приватно</h3>
                     </div>
                     <p className="text-stone-600 leading-relaxed text-[15px] mb-3">
                       Дневник работает как PWA (Progressive Web App) — современная технология, которая позволяет устанавливать приложение не из магазина приложений, а просто по прямой ссылке. Оно живет прямо в вашем браузере, почти не занимая лишнего места.
                     </p>
                     <p className="text-stone-600 leading-relaxed text-[15px]">
                       Все записи и фото хранятся <span className="font-bold text-slate-800">только внутри памяти браузера</span>. Это обеспечивает полную приватность, но есть нюанс: если вы очистите кэш или данные браузера, воспоминания могут исчезнуть навсегда. Поэтому мы создали инструмент безопасности...
                     </p>
                 </div>

                 <div>
                    <div className="flex items-center gap-3 mb-3">
                       <Download className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
                       <h3 className="text-[19px] font-bold text-slate-900">Резервная копия</h3>
                     </div>
                     <p className="text-stone-600 leading-relaxed text-[15px] mb-5">
                       Регулярно скачивайте файл дневничка, чтобы обезопасить себя. Эту копию можно передавать между устройствами или даже пересылать друг другу через мессенджеры, чтобы восстановить историю на другом телефоне.
                     </p>

                      <div className="flex flex-col gap-3">
                        <Button onClick={handleExport} className="w-full bg-emerald-100/50 hover:bg-emerald-100 text-emerald-800 font-bold h-14 rounded-2xl flex items-center justify-center gap-2 shadow-none border border-emerald-200/60 transition-colors">
                          <Download className="w-5 h-5 flex-shrink-0" />
                          <span>Сохранить копию</span>
                        </Button>
                        
                        <div className="relative">
                          <Button variant="outline" className="w-full border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 font-bold h-14 rounded-2xl flex items-center justify-center gap-2 relative overflow-hidden transition-colors">
                            <Upload className="w-5 h-5 flex-shrink-0" />
                            <span>Восстановить из копии</span>
                            <input 
                              type="file" 
                              accept=".json" 
                              onChange={handleImport}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              title="Выберите файл резервной копии"
                            />
                          </Button>
                        </div>
                      </div>
                 </div>

                 <div>
                    <div className="flex items-center gap-3 mb-3">
                       <Heart className="w-6 h-6 text-pink-500" strokeWidth={2.5} />
                       <h3 className="text-[19px] font-bold text-slate-900">Абсолютно бесплатно</h3>
                     </div>
                     <p className="text-stone-600 leading-relaxed text-[15px]">
                       Приложение мы создали как полезный инструмент для своей семьи и решили поделиться им со всеми. Оно совершенно бесплатно и не содержит скрытых платежей или рекламы.
                     </p>
                 </div>

                 <div className="pb-8">
                    <div className="flex items-center gap-3 mb-3">
                       <Plus className="w-6 h-6 text-amber-500" strokeWidth={2.5} />
                       <h3 className="text-[19px] font-bold text-slate-900">Будущее ✨</h3>
                     </div>
                     <p className="text-stone-600 leading-relaxed text-[15px]">
                       Если дневничок будет вам полезен, в будущем мы можем добавить облачную синхронизацию. Тогда оба родителя смогут одновременно дополнять общую историю и видеть записи друг друга в реальном времени.
                     </p>
                 </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!alertMessage} onOpenChange={(open) => !open && setAlertMessage(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl pointer-events-auto z-[60]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">Внимание</DialogTitle>
          </DialogHeader>
          <div className="text-center text-stone-600 mb-6">
            {alertMessage}
          </div>
          <div className="flex justify-center">
            <Button onClick={() => setAlertMessage(null)} className="rounded-xl h-12 px-8 font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm">
              ОК
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

