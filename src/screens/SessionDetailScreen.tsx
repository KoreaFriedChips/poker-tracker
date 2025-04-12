import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { RootStackScreenProps } from '../types/navigation';

const SessionDetailScreen = () => {
  const route = useRoute<RootStackScreenProps<'SessionDetail'>['route']>();
  const session = route.params.session;

  if (!session) {
    return (
      <View style={styles.container}>
        <Text>Session not found</Text>
      </View>
    );
  }

  const profit = session.cashOut - session.buyIn;
  const hours = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60 * 60);
  const hourlyRate = profit / hours;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.location}>{session.location}</Text>
        <Text style={styles.stakes}>{session.stakes}</Text>
        <Text style={[styles.profit, { color: profit >= 0 ? '#4CAF50' : '#F44336' }]}>
          ${profit.toFixed(2)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {format(new Date(session.startTime), 'MMM d, yyyy')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>
            {format(new Date(session.startTime), 'h:mm a')} -{' '}
            {format(new Date(session.endTime), 'h:mm a')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{hours.toFixed(1)} hours</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Buy-in:</Text>
          <Text style={styles.detailValue}>${session.buyIn.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cash-out:</Text>
          <Text style={styles.detailValue}>${session.cashOut.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Hourly Rate:</Text>
          <Text style={[styles.detailValue, { color: hourlyRate >= 0 ? '#4CAF50' : '#F44336' }]}>
            ${hourlyRate.toFixed(2)}/hr
          </Text>
        </View>
      </View>

      {session.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Notes</Text>
          <Text style={styles.notes}>{session.notes}</Text>
        </View>
      )}

      {session.handHistories && session.handHistories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hand Histories</Text>
          {session.handHistories.map((hand, index) => (
            <View key={hand.id} style={styles.handHistory}>
              <Text style={styles.handTitle}>Hand #{index + 1}</Text>
              {hand.preflop && (
                <View style={styles.handSection}>
                  <Text style={styles.handLabel}>Preflop:</Text>
                  <Text style={styles.handText}>{hand.preflop}</Text>
                </View>
              )}
              {hand.flop && (
                <View style={styles.handSection}>
                  <Text style={styles.handLabel}>Flop:</Text>
                  <Text style={styles.handText}>{hand.flop}</Text>
                </View>
              )}
              {hand.turn && (
                <View style={styles.handSection}>
                  <Text style={styles.handLabel}>Turn:</Text>
                  <Text style={styles.handText}>{hand.turn}</Text>
                </View>
              )}
              {hand.river && (
                <View style={styles.handSection}>
                  <Text style={styles.handLabel}>River:</Text>
                  <Text style={styles.handText}>{hand.river}</Text>
                </View>
              )}
              {hand.result && (
                <View style={styles.handSection}>
                  <Text style={styles.handLabel}>Result:</Text>
                  <Text style={styles.handText}>{hand.result}</Text>
                </View>
              )}
              {hand.notes && (
                <View style={styles.handSection}>
                  <Text style={styles.handLabel}>Notes:</Text>
                  <Text style={styles.handText}>{hand.notes}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  location: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stakes: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  profit: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
  },
  handHistory: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  handTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  handSection: {
    marginBottom: 8,
  },
  handLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  handText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SessionDetailScreen; 