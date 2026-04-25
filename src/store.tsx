import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  saveMediaLocally, 
  deleteMediaLocally, 
  getChildrenLocally, 
  saveChildLocally, 
  deleteChildLocally, 
  getRecordsLocally, 
  saveRecordLocally, 
  deleteRecordLocally 
} from './lib/db';

export type Child = {
  id: string;
  photoUrl: string;
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  birthTime: string;
  createdAt?: string;
};

export type EventRecord = {
  id: string;
  childId: string;
  title?: string;
  description?: string;
  word?: string;
  translation?: string;
  videoUrl?: string;
  audioUrl?: string;
  date: string; // ISO string
};

interface StoreContextType {
  children: Child[];
  records: EventRecord[];
  addChild: (child: Omit<Child, 'id'>) => Promise<void>;
  updateChild: (id: string, updates: Partial<Child>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  addRecord: (record: Omit<EventRecord, 'id'> & { date?: string }) => Promise<void>;
  updateRecord: (id: string, updates: Partial<EventRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  isAboutOpen: boolean;
  setIsAboutOpen: (open: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children: reactChildren }: { children: ReactNode }) {
  const [children, setChildren] = useState<Child[]>([]);
  const [records, setRecords] = useState<EventRecord[]>([]);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshData = async () => {
    try {
      const loadedChildren = await getChildrenLocally();
      const loadedRecords = await getRecordsLocally();
      setChildren(loadedChildren);
      setRecords(loadedRecords);
    } catch (error) {
      console.error("Failed to load data from local storage", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addChild = async (child: Omit<Child, 'id'>) => {
    const id = uuidv4();
    const newChild: Child = { ...child, id, createdAt: new Date().toISOString() };
    try {
      await saveChildLocally(newChild);
      setChildren(prev => [...prev, newChild]);
    } catch (error) {
      console.error("Failed to save child locally", error);
    }
  };

  const updateChild = async (id: string, updates: Partial<Child>) => {
    try {
      const child = children.find(c => c.id === id);
      if (!child) return;
      const updatedChild = { ...child, ...updates };
      await saveChildLocally(updatedChild);
      setChildren(prev => prev.map(c => c.id === id ? updatedChild : c));
    } catch (error) {
      console.error("Failed to update child locally", error);
    }
  };

  const deleteChild = async (id: string) => {
    try {
      await deleteChildLocally(id);
      setChildren(prev => prev.filter(c => c.id !== id));
      
      // Also delete associated records
      const childRecords = records.filter(r => r.childId === id);
      for (const record of childRecords) {
        await deleteRecord(record.id);
      }
    } catch (error) {
      console.error("Failed to delete child locally", error);
    }
  };

  const addRecord = async (record: Omit<EventRecord, 'id'> & { date?: string }) => {
    const id = uuidv4();
    
    let videoUrl = record.videoUrl;
    let audioUrl = record.audioUrl;

    if (videoUrl && videoUrl.startsWith('data:')) {
      const mediaId = `media_${id}`;
      await saveMediaLocally(mediaId, videoUrl);
      videoUrl = `local:${mediaId}`;
    }
    if (audioUrl && audioUrl.startsWith('data:')) {
      const mediaId = `audio_${id}`;
      await saveMediaLocally(mediaId, audioUrl);
      audioUrl = `local:${mediaId}`;
    }

    const newRecord: EventRecord = { ...record, id, date: record.date || new Date().toISOString(), videoUrl, audioUrl };
    await saveRecordLocally(newRecord);
    setRecords(prev => [...prev, newRecord]);
  };

  const updateRecord = async (id: string, updates: Partial<EventRecord>) => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    let videoUrl = updates.videoUrl;
    let audioUrl = updates.audioUrl;

    if (videoUrl && videoUrl.startsWith('data:')) {
      const mediaId = `media_${id}`;
      await saveMediaLocally(mediaId, videoUrl);
      videoUrl = `local:${mediaId}`;
      updates.videoUrl = videoUrl;
    }
    if (audioUrl && audioUrl.startsWith('data:')) {
      const mediaId = `audio_${id}`;
      await saveMediaLocally(mediaId, audioUrl);
      audioUrl = `local:${mediaId}`;
      updates.audioUrl = audioUrl;
    }

    const updatedRecord = { ...record, ...updates };

    await saveRecordLocally(updatedRecord);
    setRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
  };

  const deleteRecord = async (id: string) => {
    const record = records.find(r => r.id === id);
    if (record) {
      if (record.videoUrl?.startsWith('local:')) {
        await deleteMediaLocally(record.videoUrl.split(':')[1]);
      }
      if (record.audioUrl?.startsWith('local:')) {
        await deleteMediaLocally(record.audioUrl.split(':')[1]);
      }
    }
    try {
      await deleteRecordLocally(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Failed to delete record locally", error);
    }
  };

  return (
    <StoreContext.Provider value={{
      children, records, addChild, updateChild, deleteChild, addRecord, updateRecord, deleteRecord, refreshData, isAboutOpen, setIsAboutOpen, isModalOpen, setIsModalOpen
    }}>
      {reactChildren}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

