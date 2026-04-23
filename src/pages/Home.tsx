import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useStore, Child } from '../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Camera, Baby, Trash2, X } from 'lucide-react';
import { ImageCropperDialog } from '../components/ImageCropperDialog';

export default function Home() {
  const { children, addChild, updateChild, deleteChild } = useStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [childToDelete, setChildToDelete] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Show hint if there is at least one child and hint hasn't been dismissed
    if (children.length > 0 && !localStorage.getItem('onboarding_hint_seen')) {
      setShowHint(true);
    }
  }, [children.length]);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem('onboarding_hint_seen', 'true');
  };

  const handleSave = async (childData: Omit<Child, 'id'>) => {
    try {
      if (editingChild) {
        await updateChild(editingChild.id, childData);
        setEditingChild(null);
      } else {
        await addChild(childData);
        setIsAddOpen(false);
      }
    } catch (error) {
      setAlertMessage("Ошибка при сохранении. Возможно, фото слишком большое.");
    }
  };

  const handleDeleteChild = async (e: React.MouseEvent, childId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setChildToDelete(childId);
  };

  const confirmDelete = async () => {
    if (childToDelete) {
      try {
        await deleteChild(childToDelete);
        setChildToDelete(null);
      } catch (error) {
        console.error("Failed to delete child", error);
        setAlertMessage("Ошибка при удалении карточки ребенка.");
      }
    }
  };

  return (
    <div className="p-6 flex flex-col h-full bg-transparent">
      <header className="mb-10 mt-6 text-center relative">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Как росли детки</h1>
        <p className="text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
          Сохраняйте интересные и важные моменты жизни деток, ведите их Тарабарский словарь ;)
        </p>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="absolute -bottom-16 right-0 md:static md:mt-6 inline-flex items-center justify-center rounded-full bg-orange-400 hover:bg-orange-500 text-white w-14 h-14 shadow-md transition-transform hover:scale-105 active:scale-95 z-10">
            <Plus className="h-7 w-7" />
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-64px)] max-w-none h-[calc(100svh-64px)] max-h-none rounded-[1.5rem] sm:rounded-[2rem] border-0 shadow-xl bg-white/95 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-2 text-slate-800">Добавить ребенка</DialogTitle>
            </DialogHeader>
            <ChildForm onSave={handleSave} onCancel={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {children.length === 0 ? (
          <div className="text-center text-slate-400 mt-20 flex flex-col items-center">
            <div className="w-28 h-28 bg-orange-100/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Baby className="h-14 w-14 text-orange-300" />
            </div>
            <p className="text-xl font-bold text-slate-600">Пока нет добавленных детей</p>
            <p className="text-md mt-2 text-slate-500">Нажмите на кнопку + чтобы добавить</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl lg:max-w-none mx-auto">
            {children.map((child, index) => {
              // Alternate pastel background colors for cards
              const bgColors = ['bg-blue-50/80', 'bg-pink-50/80', 'bg-yellow-50/80', 'bg-orange-50/80'];
              const cardBg = bgColors[index % bgColors.length];
              const isFirst = index === 0;
              
              return (
              <div key={child.id} className="relative">
                <Card className={`overflow-hidden border-2 sm:border-4 border-white shadow-sm hover:shadow-md transition-all rounded-[1.5rem] sm:rounded-[2.5rem] ${cardBg} group`}>
                  <CardContent className="p-0 flex items-center min-w-0">
                    <Link to={`/child/${child.id}`} className="flex-1 min-w-0 flex items-center py-2 px-3 sm:py-4 sm:px-5">
                      <div className="w-14 h-20 sm:w-20 sm:h-28 rounded-2xl sm:rounded-[2rem] overflow-hidden bg-white mr-3 sm:mr-5 flex-shrink-0 border-2 sm:border-4 border-white shadow-sm transition-transform group-hover:scale-105">
                        {child.photoUrl ? (
                          <img src={child.photoUrl} alt={child.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Camera className="h-6 w-6 sm:h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pr-2 py-1">
                        <div className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight break-words hyphens-auto flex flex-col gap-0.5 sm:gap-1" style={{ wordBreak: 'break-word' }}>
                          {child.firstName && <span className="leading-none">{child.firstName}</span>}
                          {child.lastName && <span className="leading-none">{child.lastName}</span>}
                          {child.middleName && <span className="leading-none">{child.middleName}</span>}
                        </div>
                        <p className="text-slate-500 text-sm sm:text-base font-medium mt-1.5">{new Date(child.birthDate).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </Link>
                    
                    <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 mr-2 sm:mr-4 my-2 flex-shrink-0">
                      <Dialog open={editingChild?.id === child.id} onOpenChange={(open) => !open && setEditingChild(null)}>
                        <DialogTrigger className="text-slate-400 hover:text-orange-500 hover:bg-white/60 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors" onClick={() => setEditingChild(child)}>
                          <Edit2 className="h-4 w-4 sm:h-5 w-5" />
                        </DialogTrigger>
                        <DialogContent className="max-w-[calc(100%-24px)] sm:max-w-[425px] rounded-[1.5rem] sm:rounded-[2rem] border-0 shadow-xl bg-white/95 backdrop-blur-md">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center mb-2 text-slate-800">Редактировать</DialogTitle>
                          </DialogHeader>
                          <ChildForm initialData={child} onSave={handleSave} onCancel={() => setEditingChild(null)} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-white/60 rounded-full transition-colors w-8 h-8 sm:w-10 sm:h-10" onClick={(e) => handleDeleteChild(e, child.id)}>
                        <Trash2 className="h-4 w-4 sm:h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {showHint && isFirst && (
                  <AnimatePresence>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-24 left-0 right-0 z-50 flex flex-col items-center pointer-events-none"
                    >
                      <div className="relative w-full flex flex-col items-center">
                        {/* Stylish Curved Arrow */}
                        <svg 
                          width="100" 
                          height="120" 
                          viewBox="0 0 100 120" 
                          fill="none" 
                          className="text-orange-400 drop-shadow-md mb-[-10px] sm:mb-[-5px]"
                        >
                          <motion.path 
                            d="M 50 115 C 80 90 50 40 50 10" 
                            stroke="currentColor" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ 
                              pathLength: { duration: 1, ease: "easeInOut" },
                              opacity: { duration: 0.3 }
                            }}
                          />
                          <motion.path 
                            d="M 36 24 L 50 10 L 64 24" 
                            stroke="currentColor" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                            strokeJoin="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ 
                              pathLength: { duration: 0.3, ease: "easeOut" },
                              opacity: { duration: 0.3 },
                              delay: 0.9
                            }}
                          />
                        </svg>

                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                          className="bg-white border-2 border-orange-200 text-orange-600 text-[11px] sm:text-xs font-bold py-2 px-4 rounded-2xl shadow-xl whitespace-nowrap pointer-events-auto cursor-pointer flex items-center gap-2 group hover:bg-orange-50 transition-colors"
                          onClick={dismissHint}
                        >
                          <span className="sm:hidden">Нажмите на карточку ребенка</span>
                          <span className="hidden sm:inline">Нажмите на карточку для создания ленты</span>
                          <div className="bg-orange-100 p-1 rounded-full group-hover:bg-orange-200 transition-colors">
                            <X className="h-3 w-3" />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!childToDelete} onOpenChange={(open) => !open && setChildToDelete(null)}>
        <DialogContent className="max-w-[calc(100%-24px)] sm:max-w-[425px] rounded-[1.5rem] sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">Удаление</DialogTitle>
          </DialogHeader>
          <div className="text-center text-stone-600 mb-6 px-2">
            Вы уверены, что хотите удалить карточку ребенка? Все записи также будут удалены.
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setChildToDelete(null)} className="rounded-xl h-12 px-6 font-bold text-stone-600 border-stone-200 hover:bg-stone-100">
              Отмена
            </Button>
            <Button onClick={confirmDelete} className="rounded-xl h-12 px-8 font-bold bg-red-500 hover:bg-red-600 text-white shadow-sm">
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!alertMessage} onOpenChange={(open) => !open && setAlertMessage(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
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
    </div>
  );
}

function ChildForm({ initialData, onSave, onCancel }: { initialData?: Child, onSave: (data: Omit<Child, 'id'>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    middleName: initialData?.middleName || '',
    birthDate: initialData?.birthDate || '',
    birthTime: initialData?.birthTime || '',
    photoUrl: initialData?.photoUrl || '',
  });

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value so the same file can be selected again if needed
    e.target.value = '';
  };

  const handleCropComplete = (croppedImage: string) => {
    setFormData(prev => ({ ...prev, photoUrl: croppedImage }));
    setCropImageSrc(null);
  };

  const handleDeletePhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({ ...prev, photoUrl: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-2">
      {cropImageSrc && (
        <ImageCropperDialog
          isOpen={!!cropImageSrc}
          imageSrc={cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          onCropComplete={handleCropComplete}
          aspectRatio={3/4}
        />
      )}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <label className="cursor-pointer relative group block">
            <div className="w-24 h-32 rounded-2xl overflow-hidden bg-orange-50 border-2 border-dashed border-orange-200 flex items-center justify-center transition-all group-hover:border-orange-400 group-hover:bg-orange-100">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="h-10 w-10 text-orange-300" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
          {formData.photoUrl && (
            <button
              type="button"
              onClick={handleDeletePhoto}
              className="absolute -top-2 -right-2 bg-white text-red-500 hover:bg-red-50 border border-stone-200 rounded-full p-1.5 shadow-sm transition-colors z-10"
              title="Удалить фото"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <span className="text-sm font-medium text-stone-500 mt-3">Фото малыша</span>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="firstName" className="text-stone-600 font-bold ml-1">Имя</Label>
        <Input id="firstName" required value={formData.firstName} onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="rounded-xl bg-stone-50 border-stone-200 h-12 px-4" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lastName" className="text-stone-600 font-bold ml-1">Фамилия</Label>
        <Input id="lastName" required value={formData.lastName} onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="rounded-xl bg-stone-50 border-stone-200 h-12 px-4" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="middleName" className="text-stone-600 font-bold ml-1">Отчество</Label>
        <Input id="middleName" value={formData.middleName} onChange={e => setFormData(prev => ({ ...prev, middleName: e.target.value }))} className="rounded-xl bg-stone-50 border-stone-200 h-12 px-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="birthDate" className="text-stone-600 font-bold ml-1">Дата рождения</Label>
          <Input 
            id="birthDate" 
            type="date" 
            required 
            value={formData.birthDate} 
            onChange={e => setFormData(prev => ({ ...prev, birthDate: e.target.value }))} 
            className="rounded-xl bg-stone-50 border-stone-200 h-12 px-4 w-full focus:ring-orange-500 focus:border-orange-500 appearance-none min-w-0" 
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="birthTime" className="text-stone-600 font-bold ml-1">Время</Label>
          <Input 
            id="birthTime" 
            type="time" 
            value={formData.birthTime} 
            onChange={e => setFormData(prev => ({ ...prev, birthTime: e.target.value }))} 
            className="rounded-xl bg-stone-50 border-stone-200 h-12 px-4 w-full focus:ring-orange-500 focus:border-orange-500 appearance-none min-w-0" 
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-12 px-6 font-bold text-stone-600 border-stone-200 hover:bg-stone-100">Отмена</Button>
        <Button type="submit" className="rounded-xl h-12 px-8 font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm">Сохранить</Button>
      </div>
    </form>
  );
}
