import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card, Title, Paragraph, Button, FAB, Text, Chip, Dialog, Portal } from 'react-native-paper';
import { format } from 'date-fns';

import { useGroupStore } from '../../store/groupStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useUserStore } from '../../store/userStore';
import { RootStackParamList } from '../../navigation';
import { Expense, Group } from '../../types';

type GroupDetailsRouteProp = RouteProp<RootStackParamList, 'GroupDetails'>;
type GroupDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'GroupDetails'>;

const GroupDetailsScreen = () => {
  const route = useRoute<GroupDetailsRouteProp>();
  const navigation = useNavigation<GroupDetailsNavigationProp>();
  const { groupId } = route.params;
  
  const { groups } = useGroupStore();
  const { getExpensesByGroup, calculateBalances } = useExpenseStore();
  const { getUserById, currentUser } = useUserStore();
  
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  
  const group = groups.find((g: Group) => g.id === groupId);
  const expenses = getExpensesByGroup(groupId);
  const balances = calculateBalances(groupId);
  
  if (!group) {
    return (
      <View style={styles.centered}>
        <Text>Group not found</Text>
      </View>
    );
  }
  
  const getUserBalance = (userId: string) => {
    const balance = balances.find((b: any) => b.userId === userId);
    return balance ? balance.amount : 0;
  };
  
  const currentUserBalance = getUserBalance(currentUser?.id || '');
  
  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const payer = getUserById(item.payerId);
    
    return (
      <Card style={styles.expenseCard}>
        <Card.Content>
          <Title>{item.title}</Title>
          {item.description && <Paragraph>{item.description}</Paragraph>}
          <View style={styles.expenseDetails}>
            <Paragraph>Amount: ${item.amount.toFixed(2)}</Paragraph>
            <Paragraph>Paid by: {payer?.name || 'Unknown'}</Paragraph>
            <Paragraph>
              Date: {format(new Date(item.date), 'MMM dd, yyyy')}
            </Paragraph>
            <Chip style={styles.categoryChip}>{item.category}</Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  const renderMemberItem = ({ item }: { item: any }) => {
    const balance = getUserBalance(item.id);
    const balanceText = balance === 0 
      ? 'Settled up' 
      : balance > 0 
        ? `Owed $${balance.toFixed(2)}` 
        : `Owes $${Math.abs(balance).toFixed(2)}`;
    
    return (
      <View style={styles.memberItem}>
        <Text style={styles.memberName}>{item.name} {item.id === currentUser?.id && '(You)'}</Text>
        <Text 
          style={{ 
            color: balance > 0 ? 'green' : balance < 0 ? 'red' : 'black',
          }}
        >
          {balanceText}
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>{group.name}</Title>
        <Paragraph>{group.description || 'No description'}</Paragraph>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Your Balance</Text>
          <Text 
            style={[
              styles.balanceAmount, 
              { 
                color: currentUserBalance > 0 
                  ? 'green' 
                  : currentUserBalance < 0 
                    ? 'red' 
                    : 'black'
              }
            ]}
          >
            {currentUserBalance === 0 
              ? 'You are all settled up' 
              : currentUserBalance > 0 
                ? `You are owed $${currentUserBalance.toFixed(2)}` 
                : `You owe $${Math.abs(currentUserBalance).toFixed(2)}`
            }
          </Text>
        </View>
        
        <Button 
          mode="outlined" 
          onPress={() => setShowMembersDialog(true)}
          style={styles.membersButton}
        >
          View Members ({group.members.length})
        </Button>
      </View>
      
      <View style={styles.expensesContainer}>
        <Title style={styles.expensesTitle}>Expenses</Title>
        
        {expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No expenses yet. Add one to get started!
            </Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.expensesList}
          />
        )}
      </View>
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddExpense', { groupId })}
      />
      
      <Portal>
        <Dialog
          visible={showMembersDialog}
          onDismiss={() => setShowMembersDialog(false)}
        >
          <Dialog.Title>Group Members</Dialog.Title>
          <Dialog.Content>
            <FlatList
              data={group.members}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.membersList}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowMembersDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  balanceCard: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  membersButton: {
    marginTop: 16,
  },
  expensesContainer: {
    flex: 1,
    padding: 16,
  },
  expensesTitle: {
    marginBottom: 8,
  },
  expensesList: {
    paddingBottom: 80,
  },
  expenseCard: {
    marginBottom: 12,
  },
  expenseDetails: {
    marginTop: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
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
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#757575',
  },
  membersList: {
    paddingVertical: 8,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  memberName: {
    fontSize: 16,
  },
});

export default GroupDetailsScreen;
