import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getCroppedImg } from '../lib/cropImage';

interface ImageCropperDialogProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImage: string) => void;
  aspectRatio?: number;
}

export function ImageCropperDialog({ isOpen, imageSrc, onClose, onCropComplete, aspectRatio = 1 }: ImageCropperDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (croppedAreaPixels && imageSrc) {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-24px)] sm:max-w-[500px] rounded-[1.5rem] sm:rounded-[2rem] border-0 shadow-xl bg-white/95 backdrop-blur-md z-[100]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 text-slate-800">Редактировать фото</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[300px] bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-inner">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={setZoom}
          />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500">Масштаб</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-orange-400"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="rounded-full h-12 px-6 font-bold text-slate-600 border-slate-200 hover:bg-slate-100 shadow-sm">Отмена</Button>
          <Button onClick={handleSave} className="rounded-full h-12 px-8 font-bold bg-orange-400 hover:bg-orange-500 text-white shadow-sm">Применить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
