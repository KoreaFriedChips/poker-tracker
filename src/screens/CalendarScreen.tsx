import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { RootStackScreenProps } from '../types/navigation';
import { useSessions } from '../context/SessionsContext';
import { PokerSession, HandHistory } from '../types';
import { Card } from 'react-native-paper';
import { format } from 'date-fns';

interface DayProfit {
  profit: number;
  sessions: PokerSession[];
}

interface MarkedDates {
  [date: string]: {
    customStyles: {
      container: {
        backgroundColor?: string;
      };
      text: {
        color: string;
      };
    };
    dots?: Array<{
      color: string;
    }>;
  };
}

const HandHistoryCard: React.FC<{ handHistory: HandHistory }> = ({ handHistory }) => (
  <Card style={styles.handHistoryCard}>
    <Card.Content>
      <Text style={styles.streetLabel}>Preflop:</Text>
      <Text style={styles.streetText}>{handHistory.preflop}</Text>
      
      {handHistory.flop && (
        <>
          <Text style={styles.streetLabel}>Flop:</Text>
          <Text style={styles.streetText}>{handHistory.flop}</Text>
        </>
      )}
      
      {handHistory.turn && (
        <>
          <Text style={styles.streetLabel}>Turn:</Text>
          <Text style={styles.streetText}>{handHistory.turn}</Text>
        </>
      )}
      
      {handHistory.river && (
        <>
          <Text style={styles.streetLabel}>River:</Text>
          <Text style={styles.streetText}>{handHistory.river}</Text>
        </>
      )}
      
      {handHistory.result && (
        <>
          <Text style={styles.streetLabel}>Result:</Text>
          <Text style={styles.streetText}>{handHistory.result}</Text>
        </>
      )}
      
      {handHistory.notes && (
        <>
          <Text style={styles.streetLabel}>Notes:</Text>
          <Text style={styles.streetText}>{handHistory.notes}</Text>
        </>
      )}
    </Card.Content>
  </Card>
);

const CalendarScreen = () => {
  const navigation = useNavigation<RootStackScreenProps<'MainTabs'>['navigation']>();
  const { sessions, refreshSessions } = useSessions();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<PokerSession[]>([]);
  const [dailyProfits, setDailyProfits] = useState<{ [date: string]: DayProfit }>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthStats, setMonthStats] = useState({
    totalProfit: 0,
    sessionCount: 0,
    winningDays: 0,
    losingDays: 0,
  });

  useEffect(() => {
    refreshSessions();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      const profits: { [date: string]: DayProfit } = {};
      let monthlyProfit = 0;
      let monthlySessionCount = 0;
      let winningDays = 0;
      let losingDays = 0;
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      sessions.forEach(session => {
        const sessionDate = new Date(session.startTime);
        const date = sessionDate.toISOString().split('T')[0];
        
        // Initialize daily profit tracking
        if (!profits[date]) {
          profits[date] = { profit: 0, sessions: [] };
        }
        profits[date].profit += (session.cashOut - session.buyIn);
        profits[date].sessions.push(session);

        // Track monthly stats
        if (sessionDate >= monthStart && sessionDate <= monthEnd) {
          monthlyProfit += (session.cashOut - session.buyIn);
          monthlySessionCount++;
        }
      });

      // Count winning and losing days for the current month
      Object.entries(profits).forEach(([date, data]) => {
        const dayDate = new Date(date);
        if (dayDate >= monthStart && dayDate <= monthEnd) {
          if (data.profit > 0) winningDays++;
          if (data.profit < 0) losingDays++;
        }
      });

      setDailyProfits(profits);
      setMonthStats({
        totalProfit: monthlyProfit,
        sessionCount: monthlySessionCount,
        winningDays,
        losingDays,
      });
    }
  }, [sessions, currentMonth]);

  const getMarkedDates = (): MarkedDates => {
    const marked: MarkedDates = {};
    
    Object.entries(dailyProfits).forEach(([date, data]) => {
      marked[date] = {
        customStyles: {
          container: {
            backgroundColor: selectedDate === date ? '#e0e0e0' : undefined,
          },
          text: {
            color: data.profit >= 0 ? '#4CAF50' : '#F44336',
          },
        },
      };
    });

    return marked;
  };

  const getDayContent = (date: string) => {
    const dayData = dailyProfits[date];
    if (!dayData) return null;

    const profit = dayData.profit;
    return (
      <View style={styles.dayContainer}>
        <Text style={[styles.dayText, { color: profit >= 0 ? '#4CAF50' : '#F44336' }]}>
          ${Math.abs(profit).toFixed(0)}
        </Text>
      </View>
    );
  };

  const onDayPress = (day: DateData) => {
    const date = day.dateString;
    setSelectedDate(date);
    setSelectedSessions(dailyProfits[date]?.sessions || []);
  };

  const onMonthChange = (month: DateData) => {
    setCurrentMonth(new Date(month.timestamp));
  };

  const renderHandHistory = (hand: HandHistory) => {
    return (
      <View key={hand.id} style={styles.handHistory}>
        <Text style={styles.handAction}>
          <Text style={styles.handLabel}>Preflop: </Text>
          {hand.preflop}
        </Text>
        {hand.flop && (
          <Text style={styles.handAction}>
            <Text style={styles.handLabel}>Flop: </Text>
            {hand.flop}
          </Text>
        )}
        {hand.turn && (
          <Text style={styles.handAction}>
            <Text style={styles.handLabel}>Turn: </Text>
            {hand.turn}
          </Text>
        )}
        {hand.river && (
          <Text style={styles.handAction}>
            <Text style={styles.handLabel}>River: </Text>
            {hand.river}
          </Text>
        )}
        {hand.result && (
          <Text style={styles.handAction}>
            <Text style={styles.handLabel}>Result: </Text>
            {hand.result}
          </Text>
        )}
        {hand.notes && (
          <Text style={styles.handNotes}>{hand.notes}</Text>
        )}
      </View>
    );
  };

  const renderSessionItem = (session: PokerSession) => {
    const profit = session.cashOut - session.buyIn;
    return (
      <TouchableOpacity
        key={session.id}
        style={styles.sessionItem}
        onPress={() => navigation.navigate('SessionDetail', { session })}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>{session.location}</Text>
          <Text style={[styles.profit, { color: profit >= 0 ? '#4CAF50' : '#F44336' }]}>
            ${profit >= 0 ? '+' : ''}{profit.toFixed(0)}
          </Text>
        </View>
        <Text style={styles.sessionSubtitle}>
          {session.stakes} • {new Date(session.startTime).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </Text>
        {session.notes && (
          <Text style={styles.sessionNotes}>{session.notes}</Text>
        )}
        {session.handHistories && session.handHistories.length > 0 && (
          <View style={styles.handHistoriesContainer}>
            <Text style={styles.handHistoriesTitle}>Hand Histories</Text>
            {session.handHistories.map(renderHandHistory)}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const groupedSessions = sessions.reduce((acc, session) => {
    const date = format(new Date(session.startTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity style={styles.dollarButton}>
            <Text style={styles.dollarButtonText}>Dollars</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.monthStats}>
          <View style={styles.monthPnL}>
            <Text style={[
              styles.pnlAmount,
              { color: monthStats.totalProfit >= 0 ? '#4CAF50' : '#F44336' }
            ]}>
              ${monthStats.totalProfit >= 0 ? '+' : ''}{monthStats.totalProfit.toFixed(2)}
            </Text>
            <Text style={styles.pnlLabel}>Profit/Loss</Text>
          </View>
          <View style={styles.monthDetails}>
            <Text style={styles.monthDetailText}>
              {monthStats.sessionCount} sessions
            </Text>
            <Text style={styles.monthDetailText}>
              {monthStats.winningDays}W - {monthStats.losingDays}L
            </Text>
          </View>
        </View>

        <Calendar
          markingType="custom"
          markedDates={getMarkedDates()}
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
          dayComponent={({ date, state }: { date?: DateData; state?: string }) => {
            if (!date) return null;
            const isDisabled = state === 'disabled';
            const dateString = date.dateString;
            return (
              <TouchableOpacity
                style={[
                  styles.dayBase,
                  selectedDate === dateString && styles.selectedDay
                ]}
                onPress={() => onDayPress({ dateString, day: date.day, month: date.month, year: date.year, timestamp: date.timestamp })}
                disabled={isDisabled}
              >
                <Text style={[
                  styles.dayNumber,
                  isDisabled && styles.disabledText
                ]}>
                  {date.day}
                </Text>
                {getDayContent(dateString)}
              </TouchableOpacity>
            );
          }}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#e0e0e0',
            selectedDayTextColor: '#000000',
            todayTextColor: '#2196F3',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            arrowColor: '#2196F3',
            monthTextColor: '#2d4150',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
          }}
        />

        {selectedDate && selectedSessions.length > 0 && (
          <View style={styles.sessionsContainer}>
            <Text style={styles.sessionsTitle}>
              {selectedSessions.length} {selectedSessions.length === 1 ? 'Session' : 'Sessions'}
            </Text>
            {selectedSessions.map(renderSessionItem)}
          </View>
        )}

        {Object.entries(groupedSessions).map(([date, dateSessions]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{format(new Date(date), 'MMMM d, yyyy')}</Text>
            {dateSessions.map(session => (
              <Card key={session.id} style={styles.sessionCard}>
                <Card.Content>
                  <Text style={styles.sessionHeader}>
                    {session.location} - {session.stakes}
                  </Text>
                  <Text style={styles.sessionTime}>
                    {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                  </Text>
                  <Text style={[styles.sessionResult, session.cashOut - session.buyIn > 0 ? styles.profit : styles.loss]}>
                    ${(session.cashOut - session.buyIn).toFixed(2)}
                  </Text>
                  {session.handHistories.length > 0 && (
                    <View style={styles.handHistoriesContainer}>
                      <Text style={styles.handHistoriesHeader}>Hand Histories:</Text>
                      {session.handHistories.map((history) => (
                        <HandHistoryCard key={history.id} handHistory={history} />
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthStats: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  monthPnL: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pnlAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pnlLabel: {
    fontSize: 14,
    color: '#666',
  },
  monthDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  monthDetailText: {
    fontSize: 14,
    color: '#666',
  },
  dollarButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dollarButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayBase: {
    width: (Dimensions.get('window').width - 32) / 7,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  disabledText: {
    color: '#d9e1e8',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sessionsContainer: {
    padding: 16,
  },
  sessionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sessionItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  profit: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
  handHistoriesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  handHistoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  handHistory: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  handAction: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  handLabel: {
    fontWeight: '600',
    color: '#666',
  },
  handNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  dateGroup: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sessionCard: {
    marginBottom: 10,
    elevation: 2,
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  sessionResult: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loss: {
    color: '#e74c3c',
  },
  handHistoryCard: {
    marginVertical: 5,
    backgroundColor: '#f8f9fa',
  },
  streetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 5,
  },
  streetText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});

export default CalendarScreen; 