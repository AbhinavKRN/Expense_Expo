// src/screens/Groups/HomeScreen.tsx
import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card, Title, Paragraph, FAB, Text } from 'react-native-paper';
import { format } from 'date-fns';

import { useGroupStore } from '../../store/groupStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useUserStore } from '../../store/userStore';
import { RootStackParamList } from '../../navigation';
import { Group } from '../../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { groups } = useGroupStore();
  const { calculateBalances } = useExpenseStore();
  const { currentUser, setCurrentUser, addUser } = useUserStore();

  // Create a mock user if none exists
  useEffect(() => {
    if (!currentUser) {
      const user = addUser('Demo User', 'demo@example.com');
      setCurrentUser(user);
    }
  }, [currentUser, addUser, setCurrentUser]);

  const getTotalBalance = (groupId: string) => {
    if (!currentUser) return 0;
    
    const balances = calculateBalances(groupId);
    const userBalance = balances.find(b => b.userId === currentUser.id);
    return userBalance ? userBalance.amount : 0;
  };

  const renderGroupCard = ({ item: group }: { item: Group }) => {
    const balance = getTotalBalance(group.id);
    const balanceText = balance === 0 
      ? 'You are settled up' 
      : balance > 0 
        ? `You are owed ${balance.toFixed(2)}` 
        : `You owe ${Math.abs(balance).toFixed(2)}`;
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('GroupDetails', { groupId: group.id })}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title>{group.name}</Title>
            <Paragraph>{group.description || 'No description'}</Paragraph>
            <Paragraph>
              Created on {format(new Date(group.createdAt), 'MMM dd, yyyy')}
            </Paragraph>
            <Paragraph>Members: {group.members.length}</Paragraph>
            <Text 
              style={{ 
                color: balance > 0 ? 'green' : balance < 0 ? 'red' : 'black',
                fontWeight: 'bold',
                marginTop: 8
              }}
            >
              {balanceText}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You don't have any groups yet. Create one to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateGroup')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#757575',
  },
});

export default HomeScreen;
