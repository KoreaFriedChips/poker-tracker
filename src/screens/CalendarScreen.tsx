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
import { PokerSession } from '../types';

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
      </TouchableOpacity>
    );
  };

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
});

export default CalendarScreen; 