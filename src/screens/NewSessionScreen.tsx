import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { RootStackScreenProps } from '../types/navigation';
import { useSessions } from '../context/SessionsContext';
import { PokerSession, HandHistory } from '../types';

const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const NewSessionScreen = () => {
  const navigation = useNavigation<RootStackScreenProps<'MainTabs'>['navigation']>();
  const { addSession } = useSessions();
  const [location, setLocation] = useState('');
  const [stakes, setStakes] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [buyIn, setBuyIn] = useState('');
  const [cashOut, setCashOut] = useState('');
  const [notes, setNotes] = useState('');
  const [handHistories, setHandHistories] = useState<HandHistory[]>([]);
  const [currentHand, setCurrentHand] = useState<HandHistory>({
    id: generateId(),
    preflop: '',
    flop: '',
    turn: '',
    river: '',
    result: '',
    notes: '',
  });

  const saveSession = async () => {
    if (!location || !stakes || !buyIn || !cashOut) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newSession: PokerSession = {
      id: generateId(),
      location,
      stakes,
      startTime,
      endTime,
      buyIn: parseFloat(buyIn),
      cashOut: parseFloat(cashOut),
      notes,
      handHistories,
    };

    try {
      await addSession(newSession);
      Alert.alert('Success', 'Session saved successfully', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setLocation('');
            setStakes('');
            setStartTime(new Date());
            setEndTime(new Date());
            setBuyIn('');
            setCashOut('');
            setNotes('');
            setHandHistories([]);
            // Navigate back to home
            navigation.navigate('MainTabs');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save session');
    }
  };

  const addHandHistory = () => {
    if (currentHand.preflop) {
      setHandHistories([...handHistories, currentHand]);
      setCurrentHand({
        id: generateId(),
        preflop: '',
        flop: '',
        turn: '',
        river: '',
        result: '',
        notes: '',
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Location (e.g., Bellagio, Home Game)"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Stakes (e.g., 1/2 NL, 2/5 PLO)"
          value={stakes}
          onChangeText={setStakes}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Start Time:</Text>
          <DateTimePicker
            value={startTime}
            mode="datetime"
            onChange={(event, date) => date && setStartTime(date)}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>End Time:</Text>
          <DateTimePicker
            value={endTime}
            mode="datetime"
            onChange={(event, date) => date && setEndTime(date)}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Buy-in Amount"
          value={buyIn}
          onChangeText={setBuyIn}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Cash-out Amount"
          value={cashOut}
          onChangeText={setCashOut}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Session Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hand Histories</Text>
        <TextInput
          style={styles.input}
          placeholder="Preflop Action"
          value={currentHand.preflop}
          onChangeText={(text) => setCurrentHand({ ...currentHand, preflop: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Flop Action"
          value={currentHand.flop}
          onChangeText={(text) => setCurrentHand({ ...currentHand, flop: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Turn Action"
          value={currentHand.turn}
          onChangeText={(text) => setCurrentHand({ ...currentHand, turn: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="River Action"
          value={currentHand.river}
          onChangeText={(text) => setCurrentHand({ ...currentHand, river: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Result"
          value={currentHand.result}
          onChangeText={(text) => setCurrentHand({ ...currentHand, result: text })}
        />
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Hand Notes"
          value={currentHand.notes}
          onChangeText={(text) => setCurrentHand({ ...currentHand, notes: text })}
          multiline
        />
        <TouchableOpacity style={styles.addButton} onPress={addHandHistory}>
          <Text style={styles.addButtonText}>Add Hand History</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveSession}>
        <Text style={styles.saveButtonText}>Save Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NewSessionScreen; 