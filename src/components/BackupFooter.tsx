import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from '@/components/ui/button';
import { Download, Upload, ShieldCheck } from 'lucide-react';
import { exportData, importData } from '../lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function BackupFooter() {
  const { refreshData, isAboutOpen, children } = useStore();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (isAboutOpen || children.length === 0) return null;

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      await exportData();
      setAlertMessage("Резервная копия успешно создана и скачивается!");
    } catch(e) {
      setAlertMessage("Ошибка при создании резервной копии. Попробуйте еще раз.");
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
      setAlertMessage("Ура! Данные успешно восстановлены!");
    } catch(err) {
      setAlertMessage("Упс, ошибка при восстановлении данных. Возможно, не тот файл?");
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[100] px-3 pb-3 sm:px-6 sm:pb-6 pointer-events-none print:hidden">
        <div className="max-w-4xl mx-auto w-full flex justify-center">
          <div className="bg-white/95 backdrop-blur-md border border-stone-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl sm:rounded-[2rem] px-4 py-2.5 sm:px-6 sm:py-3 flex flex-col xs:flex-row items-center gap-2 sm:gap-6 pointer-events-auto transition-transform hover:scale-[1.01]">
            <div className="flex items-center gap-2 text-stone-500 whitespace-nowrap">
              <ShieldCheck className="w-4 h-4 sm:w-5 h-5 text-emerald-500" />
              <span className="text-[11px] sm:text-[13px] font-bold tracking-tight uppercase">Резервная копия</span>
            </div>
            
            <div className="flex items-center gap-2 w-full xs:w-auto">
              <Button 
                onClick={handleExport} 
                disabled={isProcessing}
                size="sm"
                className="flex-1 xs:flex-none bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold h-9 sm:h-10 px-3 sm:px-4 flex items-center gap-2 shadow-sm transition-all active:scale-95 text-xs sm:text-sm"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 h-4" />
                <span>Сохранить</span>
              </Button>
              
              <div className="relative">
                <Button 
                  disabled={isProcessing}
                  variant="outline"
                  size="sm"
                  className="flex-1 xs:flex-none border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl font-bold h-9 sm:h-10 px-3 sm:px-4 flex items-center gap-2 transition-all active:scale-95 text-xs sm:text-sm"
                >
                  <Upload className="w-3.5 h-3.5 sm:w-4 h-4" />
                  <span>Восстановить</span>
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
        </div>
      </div>

      <Dialog open={!!alertMessage} onOpenChange={(open) => !open && setAlertMessage(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl pointer-events-auto z-[10001]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">Внимание</DialogTitle>
          </DialogHeader>
          <div className="text-center text-stone-600 mb-6 font-medium">
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
