import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, EventRecord } from '../store';
import { calculateAge } from '../lib/dateUtils';
import { getMediaLocally } from '../lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Mic, Video, Camera, Plus, Trash2, Calendar, Clock, Loader2, BookOpen, Download, Search, ArrowUpDown, Filter, Maximize2, Minimize2, Printer, Edit2, X } from 'lucide-react';
import { PrintableFeed } from '../components/PrintableFeed';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ImageCropperDialog } from '../components/ImageCropperDialog';
import * as XLSX from 'xlsx';

function MediaViewer({ url, type }: { url: string, type: 'media' | 'audio' }) {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    if (url.startsWith('local:')) {
      getMediaLocally(url.split(':')[1]).then(data => {
        if (data) setSrc(data);
      });
    } else {
      setSrc(url);
    }
  }, [url]);

  if (!src) return <div className="animate-pulse bg-slate-100 h-32 w-full rounded-[1.5rem] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;

  if (type === 'audio') return <audio controls src={src} className="w-full" />;
  if (type === 'media') {
    if (src.startsWith('data:image')) {
      return <img src={src} className="w-full rounded-[1.5rem] max-h-[400px] object-contain shadow-sm" />;
    } else {
      return <video controls src={src} className="w-full rounded-[1.5rem] max-h-[400px] object-contain bg-black/5 shadow-sm" />;
    }
  }
  return null;
}

interface RecordFormProps {
  editingRecordId: string | null;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  word: string;
  setWord: (val: string) => void;
  translation: string;
  setTranslation: (val: string) => void;
  eventDate: string;
  setEventDate: (val: string) => void;
  audioUrl: string;
  setAudioUrl: (val: string) => void;
  videoUrl: string;
  setVideoUrl: (val: string) => void;
  isSaving: boolean;
  onCancel: () => void;
  handleAddEvent: (e: React.FormEvent) => void;
  cropImageSrc: string | null;
  setCropImageSrc: (val: string | null) => void;
  handleCropComplete: (src: string) => void;
  handleMediaUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'video') => void;
}

function RecordForm({
  editingRecordId, title, setTitle, description, setDescription,
  word, setWord, translation, setTranslation, eventDate, setEventDate,
  audioUrl, setAudioUrl, videoUrl, setVideoUrl, isSaving, onCancel, handleAddEvent,
  cropImageSrc, setCropImageSrc, handleCropComplete, handleMediaUpload
}: RecordFormProps) {
  return (
    <form onSubmit={handleAddEvent} className="space-y-5 mt-2 overflow-y-auto max-h-[70vh] px-1">
      {cropImageSrc && (
        <ImageCropperDialog
          isOpen={!!cropImageSrc}
          imageSrc={cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          onCropComplete={handleCropComplete}
          aspectRatio={4/3}
        />
      )}
      <div className="grid gap-2">
        <Label htmlFor="eventDate" className="text-slate-600 font-bold ml-1">Дата события</Label>
        <Input id="eventDate" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="rounded-full bg-slate-50 border-slate-200 h-10 px-4 shadow-inner" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title" className="text-slate-600 font-bold ml-1">Событие</Label>
        <Input id="title" placeholder="Например: Первые шаги" value={title} onChange={e => setTitle(e.target.value)} className="rounded-full bg-slate-50 border-slate-200 h-10 px-4 shadow-inner" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description" className="text-slate-600 font-bold ml-1">Подробности</Label>
        <Input id="description" placeholder="Например: Пошёл, когда мы гостили у бабушки" value={description} onChange={e => setDescription(e.target.value)} className="rounded-full bg-slate-50 border-slate-200 h-10 px-4 shadow-inner" />
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-red-500 font-bold">Тарабарский словарь</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="word" className="text-slate-600 font-bold ml-1">Тарабарское слово</Label>
        <Input id="word" placeholder="Например: Гобалы" value={word} onChange={e => setWord(e.target.value)} className="rounded-full bg-slate-50 border-slate-200 h-10 px-4 shadow-inner" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="translation" className="text-slate-600 font-bold ml-1">Смысл/Перевод</Label>
        <Input id="translation" placeholder="Например: Голуби" value={translation} onChange={e => setTranslation(e.target.value)} className="rounded-full bg-slate-50 border-slate-200 h-10 px-4 shadow-inner" />
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <label className="flex flex-col items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-[1.2rem] cursor-pointer hover:bg-blue-100 transition-colors border-2 border-white shadow-sm group min-h-[80px]">
            <Mic className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-center leading-tight">{audioUrl ? 'Аудио добавлено' : 'Добавить аудио'}</span>
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'audio')} />
          </label>
          {audioUrl && (
            <button
              type="button"
              onClick={() => setAudioUrl('')}
              className="absolute -top-1 -right-1 bg-white text-red-500 hover:bg-red-50 border border-slate-200 rounded-full p-1 shadow-sm transition-colors z-10"
              title="Удалить аудио"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        
        <div className="flex-1 relative">
          <label className="flex flex-col items-center justify-center p-3 bg-orange-50 text-orange-600 rounded-[1.2rem] cursor-pointer hover:bg-orange-100 transition-colors border-2 border-white shadow-sm group min-h-[80px]">
            <Camera className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-center leading-tight">{videoUrl ? 'Медиа добавлено' : 'Фото/видео'}</span>
            <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'video')} />
          </label>
          {videoUrl && (
            <button
              type="button"
              onClick={() => setVideoUrl('')}
              className="absolute -top-1 -right-1 bg-white text-red-500 hover:bg-red-50 border border-slate-200 rounded-full p-1 shadow-sm transition-colors z-10"
              title="Удалить медиа"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur-sm -mx-1 px-1">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSaving} 
          className="rounded-full h-10 px-5 font-bold text-slate-600 border-slate-200 hover:bg-slate-100 shadow-sm"
        >
          Отмена
        </Button>
        <Button type="submit" disabled={isSaving} className="rounded-full h-10 px-8 font-bold bg-orange-400 hover:bg-orange-500 text-white shadow-sm transition-all active:scale-95">
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingRecordId ? 'Обновить' : 'Сохранить')}
        </Button>
      </div>
    </form>
  );
}

export default function ChildProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { children, records, addRecord, updateRecord, deleteRecord } = useStore();
  const child = children.find(c => c.id === id);

  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EventRecord | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  
  // Search, Sort, Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'event' | 'word'>('all');
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [tableLayout, setTableLayout] = useState<'fit' | 'scroll'>('fit');

  const handlePrint = async () => {
    const element = document.getElementById('printable-feed-container');
    if (!element) {
      setAlertMessage('Контейнер для печати не найден');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const canvas = await toCanvas(element, {
        pixelRatio: 1,
        backgroundColor: '#ffffff',
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Не удалось сгенерировать изображение (нулевой размер)');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate how many pixels of the canvas fit on one PDF page
      const pageHeightInPixels = (canvas.width * pdfHeight) / pdfWidth;
      
      let heightLeft = canvas.height;
      let page = 0;

      while (heightLeft >= 1) {
        // Create a temporary canvas for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = Math.max(1, Math.floor(canvas.width));
        pageCanvas.height = Math.max(1, Math.floor(Math.min(pageHeightInPixels, heightLeft)));
        const ctx = pageCanvas.getContext('2d');
        
        if (ctx) {
          // Draw the relevant part of the original canvas onto the page canvas
          ctx.drawImage(
            canvas, 
            0, page * pageHeightInPixels, canvas.width, pageCanvas.height, // source
            0, 0, pageCanvas.width, pageCanvas.height // destination
          );
          
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 1.0);
          
          if (page > 0) {
            pdf.addPage();
          }
          
          const currentPdfHeight = (pageCanvas.height * pdfWidth) / pageCanvas.width;
          pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, currentPdfHeight);
        }
        
        heightLeft -= pageHeightInPixels;
        page++;
      }

      pdf.save(`${child.firstName}_история.pdf`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setAlertMessage(`Произошла ошибка при создании PDF: ${error.message || error}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!child) {
    return <div className="p-4">Ребенок не найден <Button onClick={() => navigate('/')}>На главную</Button></div>;
  }

  let childRecords = records.filter(r => r.childId === child.id);

  // Apply search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    childRecords = childRecords.filter(r => 
      (r.title && r.title.toLowerCase().includes(query)) ||
      (r.description && r.description.toLowerCase().includes(query)) ||
      (r.word && r.word.toLowerCase().includes(query)) ||
      (r.translation && r.translation.toLowerCase().includes(query))
    );
  }

  // Apply filter
  if (filterType === 'event') {
    childRecords = childRecords.filter(r => r.title);
  } else if (filterType === 'word') {
    childRecords = childRecords.filter(r => r.word);
  }

  // Apply sort
  if (sortConfig !== null) {
    childRecords.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortConfig.key) {
        case 'title':
          aValue = a.title || a.word || '';
          bValue = b.title || b.word || '';
          break;
        case 'description':
          aValue = a.description || a.translation || '';
          bValue = b.description || b.translation || '';
          break;
        case 'age':
          aValue = new Date(a.date).getTime(); // Sort by date for age
          bValue = new Date(b.date).getTime();
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        default:
          break;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  } else {
    // Default sort by date descending
    childRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title || word) {
      setIsSaving(true);
      try {
        if (editingRecordId) {
          if (title && word) {
            await updateRecord(editingRecordId, {
              title,
              description,
              word: '',
              translation: '',
              audioUrl,
              videoUrl,
              date: new Date(eventDate).toISOString()
            });
            await addRecord({
              childId: child.id,
              word,
              translation,
              audioUrl,
              videoUrl,
              date: new Date(eventDate).toISOString()
            });
          } else {
            await updateRecord(editingRecordId, {
              title,
              description,
              word,
              translation,
              audioUrl,
              videoUrl,
              date: new Date(eventDate).toISOString()
            });
          }
        } else {
          if (title && word) {
            // Add event record
            await addRecord({
              childId: child.id,
              title,
              description,
              audioUrl,
              videoUrl,
              date: new Date(eventDate).toISOString()
            });
            // Add word record
            await addRecord({
              childId: child.id,
              word,
              translation,
              audioUrl,
              videoUrl,
              date: new Date(eventDate).toISOString()
            });
          } else {
            await addRecord({
              childId: child.id,
              title,
              description,
              word,
              translation,
              audioUrl,
              videoUrl,
              date: new Date(eventDate).toISOString()
            });
          }
        }
        setTitle('');
        setDescription('');
        setWord('');
        setTranslation('');
        setAudioUrl('');
        setVideoUrl('');
        setEventDate(new Date().toISOString().split('T')[0]);
        setIsEventOpen(false);
        setEditingRecordId(null);
      } catch (error) {
        console.error("Failed to save record", error);
        setAlertMessage("Ошибка при сохранении. Возможно, файл слишком большой.");
      } finally {
        setIsSaving(false);
      }
    } else {
      setAlertMessage("Заполните хотя бы Событие или Тарабарское слово");
    }
  };

  const openAddDialog = () => {
    setEditingRecordId(null);
    setTitle('');
    setDescription('');
    setWord('');
    setTranslation('');
    setAudioUrl('');
    setVideoUrl('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setIsEventOpen(true);
  };

  const openEditDialog = (record: EventRecord) => {
    setEditingRecordId(record.id);
    setTitle(record.title || '');
    setDescription(record.description || '');
    setWord(record.word || '');
    setTranslation(record.translation || '');
    setAudioUrl(record.audioUrl || '');
    setVideoUrl(record.videoUrl || '');
    setEventDate(record.date.split('T')[0]);
    setIsEventOpen(true);
    setSelectedRecord(null);
  };

  const dictionaryRecords = childRecords.filter(r => r.word);

  const exportToCSV = () => {
    const childFullName = [child.firstName, child.lastName, child.middleName].filter(Boolean).join(' ');
    const childBirthInfo = `${new Date(child.birthDate).toLocaleDateString('ru-RU')} ${child.birthTime || ''}`.trim();
    
    // Create data for the workbook
    const data = [
      ['Ребенок', childFullName],
      ['Дата рождения', childBirthInfo],
      [],
      ['Слово', 'Смысл', 'Дата', 'Возраст']
    ];

    dictionaryRecords.forEach(r => {
      data.push([
        r.word || '',
        r.translation || '',
        new Date(r.date).toLocaleDateString('ru-RU'),
        calculateAge(child.birthDate, r.date)
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Словарь");

    // Write file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Словарь_${child.firstName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportFeedToCSV = () => {
    const childFullName = [child.lastName, child.firstName, child.middleName].filter(Boolean).join(' ');
    const childBirthInfo = `${new Date(child.birthDate).toLocaleDateString('ru-RU')} ${child.birthTime || ''}`.trim();
    
    // Create data for the workbook
    const data = [
      ['Ребенок', childFullName],
      ['Дата рождения', childBirthInfo],
      [],
      ['Событие', 'Подробности', 'Тарабарское слово', 'Смысл', 'Дата', 'Возраст']
    ];

    childRecords.forEach(r => {
      data.push([
        r.title || '',
        r.description || '',
        r.word || '',
        r.translation || '',
        new Date(r.date).toLocaleDateString('ru-RU'),
        calculateAge(child.birthDate, r.date)
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Лента событий");

    // Write file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Лента_событий_${child.firstName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'audio') {
          setAudioUrl(reader.result as string);
        }
        if (type === 'video') {
          if (file.type.startsWith('image/')) {
            setCropImageSrc(reader.result as string);
          } else {
            setVideoUrl(reader.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = (croppedImage: string) => {
    setVideoUrl(croppedImage);
    setCropImageSrc(null);
  };

  const handleDelete = async (recordId: string) => {
    setRecordToDelete(recordId);
  };

  const confirmDelete = async () => {
    if (recordToDelete) {
      try {
        await deleteRecord(recordToDelete);
        setRecordToDelete(null);
      } catch (error) {
        console.error("Failed to delete record", error);
        setAlertMessage("Ошибка при удалении записи.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] print:bg-white">
      <header className="bg-white/80 backdrop-blur-md p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 sticky top-0 z-10 border-b border-slate-100 print:hidden">
        <div className="flex items-center w-full sm:w-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center min-w-0 py-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-orange-50 mr-3 flex-shrink-0 border-2 border-white shadow-sm self-start mt-1">
              {child.photoUrl ? (
                <img src={child.photoUrl} alt={child.firstName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-orange-300">
                  <Camera className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-800 break-words hyphens-auto flex flex-col gap-0.5" style={{ wordBreak: 'break-word' }}>
              {child.firstName && <span>{child.firstName}</span>}
              {child.lastName && <span>{child.lastName}</span>}
              {child.middleName && <span>{child.middleName}</span>}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsDictOpen(true)} className="sm:ml-auto w-full sm:w-auto rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 flex-shrink-0 shadow-sm">
          <BookOpen className="h-4 w-4 mr-2" />
          Тарабарский словарь
        </Button>
      </header>

      <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 pb-24 print:overflow-visible print:p-0 print:space-y-0">
        <div className="print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Лента событий
              </h2>
              <Dialog open={isEventOpen} onOpenChange={(open) => {
                setIsEventOpen(open);
                if (!open) setEditingRecordId(null);
              }}>
                <DialogTrigger 
                  render={
                    <Button 
                      onClick={openAddDialog} 
                      className="rounded-full bg-orange-400 hover:bg-orange-500 text-white size-8 sm:size-10 shadow-md transition-transform hover:scale-110 active:scale-95 print:hidden p-0 flex items-center justify-center translate-y-0.5"
                    />
                  }
                >
                  <Plus className="h-5 w-5" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-0 shadow-xl bg-white/95 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-2 text-slate-800">
                      {editingRecordId ? 'Редактирование записи' : 'Новая запись'}
                    </DialogTitle>
                  </DialogHeader>
                  <RecordForm 
                    editingRecordId={editingRecordId}
                    title={title} setTitle={setTitle}
                    description={description} setDescription={setDescription}
                    word={word} setWord={setWord}
                    translation={translation} setTranslation={setTranslation}
                    eventDate={eventDate} setEventDate={setEventDate}
                    audioUrl={audioUrl} setAudioUrl={setAudioUrl}
                    videoUrl={videoUrl} setVideoUrl={setVideoUrl}
                    isSaving={isSaving}
                    onCancel={() => setIsEventOpen(false)}
                    handleAddEvent={handleAddEvent}
                    cropImageSrc={cropImageSrc} setCropImageSrc={setCropImageSrc}
                    handleCropComplete={handleCropComplete}
                    handleMediaUpload={handleMediaUpload}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Поиск записей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[250px] rounded-full border-slate-200 focus-visible:ring-orange-400 bg-white shadow-sm"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" className="rounded-full border-slate-200 shadow-sm bg-white shrink-0" />}>
                  <Filter className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Фильтр</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-[1.5rem] p-2 shadow-xl border-slate-100">
                  <DropdownMenuItem onClick={() => setFilterType('all')} className={`rounded-xl ${filterType === 'all' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600'}`}>
                    Все записи
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('event')} className={`rounded-xl ${filterType === 'event' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600'}`}>
                    Только события
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('word')} className={`rounded-xl ${filterType === 'word' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600'}`}>
                    Только словарь
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setTableLayout(prev => prev === 'fit' ? 'scroll' : 'fit')}
                className="rounded-full border-slate-200 shadow-sm bg-white"
                title={tableLayout === 'fit' ? "Широкий вид" : "Компактный вид"}
              >
                {tableLayout === 'fit' ? <Maximize2 className="h-4 w-4 text-slate-500" /> : <Minimize2 className="h-4 w-4 text-slate-500" />}
              </Button>
              <Button 
                variant="outline" 
                onClick={exportFeedToCSV} 
                disabled={childRecords.length === 0} 
                className="rounded-full border-slate-200 text-green-600 hover:text-green-700 hover:bg-green-50 shadow-sm bg-white"
                title="Выгрузить в Excel"
              >
                <Download className="h-4 w-4 mr-2" />
                <span>Excel</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePrint} 
                disabled={childRecords.length === 0 || isGeneratingPdf} 
                className="rounded-full border-slate-200 text-orange-600 hover:text-orange-700 hover:bg-orange-50 shadow-sm bg-white"
                title="Скачать PDF"
              >
                {isGeneratingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                <span>PDF</span>
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border-4 border-white shadow-sm overflow-hidden">
            {childRecords.length === 0 ? (
              <div className="text-center text-slate-400 py-16 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Calendar className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-xl font-bold text-slate-600">
                  {searchQuery || filterType !== 'all' ? 'По вашему запросу ничего не найдено' : 'Лента событий пока пуста'}
                </p>
                {(!searchQuery && filterType === 'all') && (
                  <p className="text-md mt-2 text-slate-500">Добавьте первое слово или достижение малыша</p>
                )}
              </div>
            ) : (
              <div className={tableLayout === 'fit' ? "overflow-x-hidden" : "overflow-x-auto"}>
                <Table className={tableLayout === 'fit' ? "table-fixed w-full" : "w-max min-w-full"}>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead 
                        className={tableLayout === 'fit' ? "w-[15%] sm:w-[12%] font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors" : "whitespace-nowrap font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"}
                        onClick={() => handleSort('age')}
                      >
                        <div className="flex items-center gap-1">
                          Возраст
                          <ArrowUpDown className="h-3 w-3 opacity-50 flex-shrink-0" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className={tableLayout === 'fit' ? "w-[25%] sm:w-[30%] font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors" : "whitespace-nowrap font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"}
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center gap-1">
                          Запись
                          <ArrowUpDown className="h-3 w-3 opacity-50 flex-shrink-0" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className={tableLayout === 'fit' ? "w-[25%] sm:w-[33%] font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors" : "whitespace-nowrap font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"}
                        onClick={() => handleSort('description')}
                      >
                        <div className="flex items-center gap-1">
                          Описание
                          <ArrowUpDown className="h-3 w-3 opacity-50 flex-shrink-0" />
                        </div>
                      </TableHead>
                      <TableHead className={tableLayout === 'fit' ? "w-[10%] sm:w-[8%] font-bold text-slate-600 text-center" : "whitespace-nowrap font-bold text-slate-600 text-center"}>
                        <span className="hidden sm:inline">Медиа</span>
                        <span className="sm:hidden">📎</span>
                      </TableHead>
                      <TableHead 
                        className={tableLayout === 'fit' ? "w-[15%] sm:w-[12%] font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors" : "whitespace-nowrap font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"}
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-1">
                          Дата
                          <ArrowUpDown className="h-3 w-3 opacity-50 flex-shrink-0" />
                        </div>
                      </TableHead>
                      <TableHead className={tableLayout === 'fit' ? "w-[10%] sm:w-[5%]" : "whitespace-nowrap"}></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {childRecords.map(record => (
                      <TableRow key={record.id} className="cursor-pointer hover:bg-slate-50/50 transition-colors group" onClick={() => setSelectedRecord(record)}>
                        <TableCell 
                          className="text-slate-600 align-top text-xs sm:text-sm break-words whitespace-normal hover:bg-slate-100/50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDateId(record.id);
                          }}
                          title="Нажмите, чтобы изменить дату и возраст"
                        >
                          <div className="flex items-center gap-1">
                            {calculateAge(child.birthDate, record.date)}
                          </div>
                        </TableCell>
                        <TableCell className={`align-top break-words whitespace-normal ${tableLayout === 'fit' ? 'max-w-[20ch]' : 'max-w-[100ch]'}`}>
                          {record.title && <div className="font-bold text-slate-800 break-words">{record.title}</div>}
                          {record.word && (
                            <div className="mt-0.5">
                              <div className="text-xs text-slate-500">Слово:</div>
                              <div className="text-sm font-medium text-orange-600 break-words">{record.word}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className={`align-top break-words whitespace-normal ${tableLayout === 'fit' ? 'max-w-[20ch]' : 'max-w-[100ch]'}`}>
                          {record.description && <div className="text-slate-600 break-words">{record.description}</div>}
                          {record.translation && (
                            <div className="mt-0.5">
                              <div className="text-xs text-slate-500">Смысл:</div>
                              <div className="text-sm text-slate-600 break-words">{record.translation}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center align-top">
                          <div className="flex items-center justify-center gap-1.5">
                            {record.videoUrl && <Camera className="h-4 w-4 text-orange-400" />}
                            {record.audioUrl && <Mic className="h-4 w-4 text-blue-400" />}
                            {!record.videoUrl && !record.audioUrl && <span className="text-slate-300">-</span>}
                          </div>
                        </TableCell>
                        <TableCell 
                          className="text-slate-600 align-top text-xs sm:text-sm break-words whitespace-normal hover:bg-slate-100/50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDateId(record.id);
                          }}
                          title="Нажмите, чтобы изменить дату"
                        >
                          {editingDateId === record.id ? (
                            <Input 
                              type="date"
                              defaultValue={record.date.split('T')[0]}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => {
                                setEditingDateId(null);
                                if (e.target.value && e.target.value !== record.date.split('T')[0]) {
                                  updateRecord(record.id, { date: new Date(e.target.value).toISOString() });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                } else if (e.key === 'Escape') {
                                  setEditingDateId(null);
                                }
                              }}
                              className="h-8 px-2 text-xs w-[130px]"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              {new Date(record.date).toLocaleDateString('ru-RU')}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="align-top py-2 px-1">
                          <div className="flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                openEditDialog(record); 
                              }} 
                              className="h-8 w-8 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-full"
                              title="Редактировать"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDelete(record.id); 
                              }} 
                              className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
        
        {createPortal(
          <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
            <div id="printable-feed-container" style={{ width: '800px', backgroundColor: '#ffffff' }}>
              <PrintableFeed child={child} records={childRecords} />
            </div>
          </div>,
          document.body
        )}
      </div>

      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-0 shadow-xl bg-white/95 backdrop-blur-md">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-2 text-slate-800">
                  {selectedRecord.word ? 'Тарабарский словарь' : 'Событие'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-2">
                <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-400" />
                    {calculateAge(child.birthDate, selectedRecord.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    {new Date(selectedRecord.date).toLocaleDateString('ru-RU')}
                  </div>
                </div>

                <div className="space-y-4 text-lg">
                  {selectedRecord.word ? (
                    <>
                      <div>
                        <span className="font-bold text-slate-700">Тарабарское слово: </span>
                        <span className="text-orange-600 font-medium">{selectedRecord.word}</span>
                      </div>
                      {selectedRecord.translation && (
                        <div>
                          <span className="font-bold text-slate-700">Смысл / перевод: </span>
                          <span className="text-slate-600">{selectedRecord.translation}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {selectedRecord.title && (
                        <div>
                          <span className="font-bold text-slate-700">Событие:</span> {selectedRecord.title}
                        </div>
                      )}
                      {selectedRecord.description && (
                        <div>
                          <span className="font-bold text-slate-700">Описание:</span> {selectedRecord.description}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {(selectedRecord.audioUrl || selectedRecord.videoUrl) && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700">Медиа:</h4>
                    {selectedRecord.audioUrl && (
                      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-3 text-blue-700 font-bold">
                          <Mic className="h-5 w-5" /> Аудио
                        </div>
                        <MediaViewer url={selectedRecord.audioUrl} type="audio" />
                      </div>
                    )}
                    {selectedRecord.videoUrl && (
                      <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                        <div className="flex items-center gap-2 mb-3 text-orange-700 font-bold">
                          <Camera className="h-5 w-5" /> Фото/Видео
                        </div>
                        <MediaViewer url={selectedRecord.videoUrl} type="media" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => openEditDialog(selectedRecord)} className="rounded-full h-10 px-6 font-bold text-slate-600 border-slate-200 hover:bg-slate-100 shadow-sm">
                  Редактировать
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDictOpen} onOpenChange={setIsDictOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-0 shadow-xl bg-white/95 backdrop-blur-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <BookOpen className="h-6 w-6 text-orange-400" />
              Тарабарский словарь
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2 mt-4">
            {dictionaryRecords.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Словарь пока пуст.</p>
            ) : (
              <div className="overflow-x-hidden">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[30%] font-bold text-slate-600">Слово</TableHead>
                      <TableHead className="w-[35%] font-bold text-slate-600">Смысл</TableHead>
                      <TableHead className="w-[20%] font-bold text-slate-600">Возраст</TableHead>
                      <TableHead className="w-[15%] font-bold text-slate-600">Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dictionaryRecords.map(r => (
                      <TableRow key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold text-orange-600 align-top max-w-[20ch] break-words whitespace-normal">{r.word}</TableCell>
                        <TableCell className="text-slate-600 align-top max-w-[20ch] break-words whitespace-normal">{r.translation}</TableCell>
                        <TableCell 
                          className="text-slate-500 truncate align-top text-xs sm:text-sm hover:bg-slate-100/50 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDateId(r.id);
                          }}
                          title="Нажмите, чтобы изменить дату и возраст"
                        >
                          <div className="flex items-center gap-1">
                            {calculateAge(child.birthDate, r.date)}
                            <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400 flex-shrink-0" />
                          </div>
                        </TableCell>
                        <TableCell 
                          className="text-slate-500 truncate align-top text-xs sm:text-sm hover:bg-slate-100/50 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDateId(r.id);
                          }}
                          title="Нажмите, чтобы изменить дату"
                        >
                          {editingDateId === r.id ? (
                            <Input 
                              type="date"
                              defaultValue={r.date.split('T')[0]}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => {
                                setEditingDateId(null);
                                if (e.target.value && e.target.value !== r.date.split('T')[0]) {
                                  updateRecord(r.id, { date: new Date(e.target.value).toISOString() });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                } else if (e.key === 'Escape') {
                                  setEditingDateId(null);
                                }
                              }}
                              className="h-8 px-2 text-xs w-[130px] rounded-full border-slate-200"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              {new Date(r.date).toLocaleDateString('ru-RU')}
                              <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400 flex-shrink-0" />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button onClick={exportToCSV} disabled={dictionaryRecords.length === 0} className="bg-green-400 hover:bg-green-500 text-white rounded-full shadow-sm font-bold">
              <Download className="h-4 w-4 mr-2" />
              Выгрузить в Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-0 shadow-xl bg-white/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2 text-slate-800">Удаление</DialogTitle>
          </DialogHeader>
          <div className="text-center text-slate-600 mb-6">
            Вы уверены, что хотите удалить это событие?
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setRecordToDelete(null)} className="rounded-full h-12 px-6 font-bold text-slate-600 border-slate-200 hover:bg-slate-100 shadow-sm">
              Отмена
            </Button>
            <Button onClick={confirmDelete} className="rounded-full h-12 px-8 font-bold bg-red-400 hover:bg-red-500 text-white shadow-sm">
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!alertMessage} onOpenChange={(open) => !open && setAlertMessage(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-0 shadow-xl bg-white/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2 text-slate-800">Внимание</DialogTitle>
          </DialogHeader>
          <div className="text-center text-slate-600 mb-6">
            {alertMessage}
          </div>
          <div className="flex justify-center">
            <Button onClick={() => setAlertMessage(null)} className="rounded-full h-12 px-8 font-bold bg-orange-400 hover:bg-orange-500 text-white shadow-sm">
              ОК
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
