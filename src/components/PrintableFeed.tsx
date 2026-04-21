import React, { forwardRef, useState, useEffect } from 'react';
import { Child, EventRecord } from '../store';
import { calculateAge } from '../lib/dateUtils';
import { Star, Sun, Baby, Calendar, Mic, Video } from 'lucide-react';
import { getMediaLocally } from '../lib/db';

interface PrintableFeedProps {
  child: Child;
  records: EventRecord[];
}

const colors = {
  slate800: '#1e293b',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate100: '#f1f5f9',
  white: '#ffffff',
  orange100: '#ffedd5',
  orange200: '#fed7aa',
  orange300: '#fdba74',
  orange400: '#fb923c',
  orange500: '#f97316',
  orange600: '#ea580c',
  orange50: '#fff7ed',
  pink200: '#fbcfe8',
  pink500: '#ec4899',
  pink50: '#fdf2f8',
  yellow500: '#eab308',
  yellow50: '#fefce8',
  yellow200: '#fef08a',
  blue50: '#eff6ff',
  blue500: '#3b82f6',
};

const Thumbnail = ({ url, isAudio }: { url: string, isAudio?: boolean }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isAudio) return;
    let isMounted = true;
    
    const loadMedia = async () => {
      let actualUrl = url;
      if (url.startsWith('local:')) {
        const data = await getMediaLocally(url.split(':')[1]);
        if (data) actualUrl = data;
      }
      if (!actualUrl) return;
      
      if (actualUrl.startsWith('data:image/')) {
        if (isMounted) setImgSrc(actualUrl);
      } else if (actualUrl.startsWith('data:video/')) {
        const video = document.createElement('video');
        video.src = actualUrl;
        video.currentTime = 0.1;
        video.muted = true;
        video.playsInline = true;
        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          if (isMounted) setImgSrc(canvas.toDataURL('image/jpeg'));
        };
        video.onerror = () => {
          if (isMounted) setImgSrc('error');
        };
        video.load();
      }
    };
    loadMedia();
    return () => { isMounted = false; };
  }, [url, isAudio]);

  if (isAudio) {
    return (
      <div className="flex items-center justify-center w-20 h-14 mx-auto border rounded-md" style={{ backgroundColor: colors.blue50, borderColor: colors.blue500, color: colors.blue500 }}>
        <Mic className="w-6 h-6" />
      </div>
    );
  }

  if (!imgSrc) {
    return <div className="w-20 h-14 mx-auto border rounded-md" style={{ backgroundColor: colors.slate100, borderColor: colors.slate300 }}></div>;
  }
  
  if (imgSrc === 'error') {
    return (
      <div className="flex items-center justify-center w-20 h-14 mx-auto border rounded-md" style={{ backgroundColor: colors.orange50, borderColor: colors.orange300, color: colors.orange500 }}>
        <Video className="w-6 h-6" />
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      className="w-20 h-14 object-cover mx-auto border rounded-md" 
      style={{ borderColor: colors.blue500 }}
      alt="thumbnail" 
    />
  );
};

export const PrintableFeed = forwardRef<HTMLDivElement, PrintableFeedProps>(({ child, records }, ref) => {
  const childFullName = [child.lastName, child.firstName, child.middleName].filter(Boolean).join(' ');
  const birthDateStr = new Date(child.birthDate).toLocaleDateString('ru-RU');

  const [childPhoto, setChildPhoto] = useState<string>('');

  useEffect(() => {
    if (child.photoUrl) {
      if (child.photoUrl.startsWith('local:')) {
        getMediaLocally(child.photoUrl.split(':')[1]).then(data => {
          if (data) setChildPhoto(data);
        });
      } else {
        setChildPhoto(child.photoUrl);
      }
    }
  }, [child.photoUrl]);

  // Sort records by date ascending for the feed
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div ref={ref} className="p-10 font-sans" style={{ width: '800px', minHeight: '100vh', backgroundColor: colors.white, color: colors.slate800 }}>
      {/* Cover / Header */}
      <div className="text-center mb-12 border-b-4 pb-8 relative" style={{ borderColor: colors.orange100 }}>
        <div className="absolute top-0 left-0" style={{ color: colors.orange200 }}>
          <Sun className="w-16 h-16" />
        </div>
        <div className="absolute top-0 right-0" style={{ color: colors.pink200 }}>
          <Star className="w-12 h-12" />
        </div>
        
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 shadow-lg mb-6 flex items-center justify-center" style={{ borderColor: colors.orange200, backgroundColor: colors.orange50 }}>
          {childPhoto ? (
            <img 
              src={childPhoto} 
              alt={child.firstName} 
              crossOrigin={childPhoto.startsWith('http') ? "anonymous" : undefined}
              className="w-full h-full object-cover" 
            />
          ) : (
            <Baby className="w-16 h-16" style={{ color: colors.orange300 }} />
          )}
        </div>
        
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight" style={{ color: colors.orange600 }}>
          Как росли детки
        </h1>
        <div className="text-2xl font-bold mb-4 break-words hyphens-auto flex flex-col items-center gap-1" style={{ color: colors.slate700, wordBreak: 'break-word', maxWidth: '100%' }}>
          {child.firstName && <span>{child.firstName}</span>}
          {child.lastName && <span>{child.lastName}</span>}
          {child.middleName && <span>{child.middleName}</span>}
        </div>
        <div className="flex items-center justify-center gap-2 font-medium break-words whitespace-normal" style={{ color: colors.slate500 }}>
          <Calendar className="w-5 h-5" />
          <span>Дата рождения: {birthDateStr} {child.birthTime && `в ${child.birthTime}`}</span>
        </div>
      </div>

      {/* Table */}
      <div className="mt-8">
        <table className="w-full text-left border-collapse" style={{ borderColor: colors.slate300 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.slate300}`, color: colors.slate600 }}>
              <th className="py-3 px-4 font-bold w-[15%]">Возраст</th>
              <th className="py-3 px-4 font-bold w-[25%]">Запись</th>
              <th className="py-3 px-4 font-bold w-[35%]">Описание</th>
              <th className="py-3 px-4 font-bold text-center w-[10%]">Медиа</th>
              <th className="py-3 px-4 font-bold w-[15%]">Дата</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map((record, index) => {
              const age = calculateAge(child.birthDate, record.date);
              const dateStr = new Date(record.date).toLocaleDateString('ru-RU');
              
              return (
                <tr key={record.id} style={{ borderBottom: `1px solid ${colors.slate100}` }}>
                  <td className="py-3 px-4 align-top" style={{ color: colors.slate600 }}>{age}</td>
                  <td className="py-3 px-4 align-top break-words whitespace-normal">
                    {record.title && <div className="font-bold" style={{ color: colors.slate800 }}>{record.title}</div>}
                    {record.word && (
                      <div className="mt-0.5">
                        <div className="text-xs" style={{ color: colors.slate500 }}>Слово:</div>
                        <div className="text-sm font-medium" style={{ color: colors.orange600 }}>{record.word}</div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top break-words whitespace-normal">
                    {record.description && <div style={{ color: colors.slate600 }}>{record.description}</div>}
                    {record.translation && (
                      <div className="mt-0.5">
                        <div className="text-xs" style={{ color: colors.slate500 }}>Смысл:</div>
                        <div className="text-sm" style={{ color: colors.slate600 }}>{record.translation}</div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top text-center">
                    <div className="flex flex-col items-center gap-2">
                      {record.videoUrl && <Thumbnail url={record.videoUrl} />}
                      {record.audioUrl && <Thumbnail url={record.audioUrl} isAudio />}
                      {!record.videoUrl && !record.audioUrl && <span style={{ color: colors.slate300 }}>-</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top" style={{ color: colors.slate600 }}>{dateStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedRecords.length === 0 && (
        <div className="text-center py-12" style={{ color: colors.slate400 }}>
          <p className="text-xl">Лента событий пока пуста.</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 pt-8 border-t-2 text-center text-sm font-medium" style={{ borderColor: colors.slate100, color: colors.slate400 }}>
        <p>Создано с любовью • Как росли детки</p>
      </div>
    </div>
  );
});

PrintableFeed.displayName = 'PrintableFeed';
