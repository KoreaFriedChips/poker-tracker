import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PokerSession } from '../types';

// Dummy data for testing
const dummyData: PokerSession[] = [
  {
    id: '1',
    location: 'Bellagio',
    stakes: '2/5 NL',
    startTime: new Date('2024-03-10T14:00:00Z'),
    endTime: new Date('2024-03-10T20:00:00Z'),
    buyIn: 500,
    cashOut: 1200,
    notes: 'Good session, hit set over set',
    handHistories: [],
  },
  {
    id: '2',
    location: 'Aria',
    stakes: '5/10 NL',
    startTime: new Date('2024-03-11T18:00:00Z'),
    endTime: new Date('2024-03-12T02:00:00Z'),
    buyIn: 1000,
    cashOut: 2300,
    notes: 'Crazy action game',
    handHistories: [],
  },
  {
    id: '3',
    location: 'Wynn',
    stakes: '2/5 NL',
    startTime: new Date('2024-03-12T15:00:00Z'),
    endTime: new Date('2024-03-12T21:00:00Z'),
    buyIn: 500,
    cashOut: 300,
    notes: 'Tough lineup',
    handHistories: [],
  },
  {
    id: '4',
    location: 'Bellagio',
    stakes: '2/5 NL',
    startTime: new Date('2024-03-13T16:00:00Z'),
    endTime: new Date('2024-03-13T23:00:00Z'),
    buyIn: 500,
    cashOut: 900,
    notes: 'Standard session',
    handHistories: [],
  },
  {
    id: '5',
    location: 'Aria',
    stakes: '5/10 NL',
    startTime: new Date('2024-03-14T19:00:00Z'),
    endTime: new Date('2024-03-15T03:00:00Z'),
    buyIn: 1000,
    cashOut: 800,
    notes: 'Lost big pot with AA',
    handHistories: [],
  },
  {
    id: '6',
    location: 'Wynn',
    stakes: '2/5 NL',
    startTime: new Date('2024-03-15T14:00:00Z'),
    endTime: new Date('2024-03-15T22:00:00Z'),
    buyIn: 500,
    cashOut: 1500,
    notes: 'Great game, lots of action',
    handHistories: [],
  },
];

interface SessionsContextType {
  sessions: PokerSession[];
  addSession: (session: PokerSession) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export const SessionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<PokerSession[]>([]);

  const refreshSessions = async () => {
    try {
      const sessionsJson = await AsyncStorage.getItem('pokerSessions');
      if (sessionsJson) {
        const parsedSessions = JSON.parse(sessionsJson) as PokerSession[];
        setSessions(parsedSessions);
      } else {
        // Load dummy data if no sessions exist
        await AsyncStorage.setItem('pokerSessions', JSON.stringify(dummyData));
        setSessions(dummyData);
      }
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    }
  };

  const addSession = async (session: PokerSession) => {
    try {
      const updatedSessions = [...sessions, session];
      await AsyncStorage.setItem('pokerSessions', JSON.stringify(updatedSessions));
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  return (
    <SessionsContext.Provider value={{ sessions, addSession, refreshSessions }}>
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionsProvider');
  }
  return context;
}; 