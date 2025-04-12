import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackScreenProps } from '../types/navigation';
import { useSessions } from '../context/SessionsContext';
import { PokerSession } from '../types';
import { LineChart } from 'react-native-chart-kit';

interface LocationStats {
  name: string;
  profit: number;
  record: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<RootStackScreenProps<'MainTabs'>['navigation']>();
  const { sessions, refreshSessions } = useSessions();
  const [selectedView, setSelectedView] = useState<'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState({
    profit: 0,
    roi: 0,
    record: '',
  });
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [{ data: [0] }],
  });
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);

  useEffect(() => {
    refreshSessions();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      calculateStats();
      updateChartData();
      calculateLocationStats();
    }
  }, [sessions, selectedView]);

  const calculateStats = () => {
    const totalBuyIn = sessions.reduce((sum, session) => sum + session.buyIn, 0);
    const totalProfit = sessions.reduce((sum, session) => sum + (session.cashOut - session.buyIn), 0);
    const wins = sessions.filter(session => session.cashOut > session.buyIn).length;
    const losses = sessions.filter(session => session.cashOut < session.buyIn).length;
    const draws = sessions.filter(session => session.cashOut === session.buyIn).length;

    setStats({
      profit: totalProfit,
      roi: totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0,
      record: `${wins}-${losses}-${draws}`,
    });
  };

  const updateChartData = () => {
    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Calculate cumulative profit
    let cumulativeProfit = 0;
    const profitData = sortedSessions.map(session => {
      cumulativeProfit += (session.cashOut - session.buyIn);
      return cumulativeProfit;
    });

    // Generate labels (you can customize this based on selectedView)
    const labels = sortedSessions.map(session => 
      new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    );

    setChartData({
      labels,
      datasets: [{ data: profitData.length > 0 ? profitData : [0] }],
    });
  };

  const calculateLocationStats = () => {
    const locationMap = new Map<string, { profit: number; wins: number; losses: number; draws: number }>();
    
    sessions.forEach(session => {
      const profit = session.cashOut - session.buyIn;
      const current = locationMap.get(session.location) || { profit: 0, wins: 0, losses: 0, draws: 0 };
      
      locationMap.set(session.location, {
        profit: current.profit + profit,
        wins: current.wins + (profit > 0 ? 1 : 0),
        losses: current.losses + (profit < 0 ? 1 : 0),
        draws: current.draws + (profit === 0 ? 1 : 0),
      });
    });

    const stats = Array.from(locationMap.entries()).map(([name, stats]) => ({
      name,
      profit: stats.profit,
      record: `${stats.wins}-${stats.losses}-${stats.draws}`,
    }));

    // Sort by profit (highest to lowest)
    stats.sort((a, b) => b.profit - a.profit);
    setLocationStats(stats);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>{selectedView === 'month' ? 'Apr 2025' : 'Summary'}</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, selectedView === 'week' && styles.toggleButtonActive]}
              onPress={() => setSelectedView('week')}
            >
              <Text style={styles.toggleButtonText}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, selectedView === 'month' && styles.toggleButtonActive]}
              onPress={() => setSelectedView('month')}
            >
              <Text style={styles.toggleButtonText}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, selectedView === 'year' && styles.toggleButtonActive]}
              onPress={() => setSelectedView('year')}
            >
              <Text style={styles.toggleButtonText}>Year</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Profit</Text>
              <Text style={[styles.statValue, { color: stats.profit >= 0 ? '#4CAF50' : '#F44336' }]}>
                ${stats.profit.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ROI</Text>
              <Text style={[styles.statValue, { color: stats.roi >= 0 ? '#4CAF50' : '#F44336' }]}>
                {stats.roi.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Record</Text>
              <Text style={styles.statValue}>{stats.record}</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.locationsSection}>
          <Text style={styles.sectionTitle}>Locations</Text>
          {locationStats.map((location) => (
            <TouchableOpacity key={location.name} style={styles.locationItem}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={[styles.locationProfit, { color: location.profit >= 0 ? '#4CAF50' : '#F44336' }]}>
                  {location.profit >= 0 ? '+' : ''}{location.profit.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.locationRecord}>{location.record}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  locationsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationProfit: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationRecord: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen; 