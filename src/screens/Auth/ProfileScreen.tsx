import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Avatar, Title, Text, Card } from 'react-native-paper';
import { useUserStore } from '../../store/userStore';
import { useGroupStore } from '../../store/groupStore';
import { useExpenseStore } from '../../store/expenseStore';

const ProfileScreen = () => {
  const { currentUser, updateUser } = useUserStore();
  const { groups } = useGroupStore();
  const { expenses, calculateBalances } = useExpenseStore();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  
  if (!currentUser) {
    return (
      <View style={styles.centered}>
        <Text>User not found</Text>
      </View>
    );
  }
  
  const userGroups = groups.filter((group: { members: any[]; }) => 
    group.members.some(member => member.id === currentUser.id)
  );
  
  const getTotalBalance = () => {
    let total = 0;
    
    userGroups.forEach((group: { id: any; }) => {
      const balances = calculateBalances(group.id as string);
      const userBalance = balances.find((b: { userId: any; }) => b.userId === currentUser.id);
      if (userBalance) {
        total += userBalance.amount;
      }
    });
    
    return total;
  };
  
  const totalBalance = getTotalBalance();
  
  const handleSave = () => {
    if (name.trim()) {
      updateUser(currentUser.id, { name, email });
      setIsEditing(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={name.substring(0, 2).toUpperCase()} 
          style={styles.avatar}
        />
        
        {isEditing ? (
          <View style={styles.editForm}>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setName(currentUser.name);
                  setEmail(currentUser.email || '');
                  setIsEditing(false);
                }}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSave}
                style={styles.button}
                disabled={!name.trim()}
              >
                Save
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Title style={styles.name}>{currentUser.name}</Title>
            {currentUser.email && <Text style={styles.email}>{currentUser.email}</Text>}
            <Button 
              mode="outlined" 
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </View>
        )}
      </View>
      
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Summary</Title>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Groups</Text>
            <Text style={styles.summaryValue}>{userGroups.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Balance</Text>
            <Text 
              style={[
                styles.summaryValue, 
                { 
                  color: totalBalance > 0 
                    ? 'green' 
                    : totalBalance < 0 
                      ? 'red' 
                      : 'black'
                }
              ]}
            >
              {totalBalance === 0 
                ? 'Settled up' 
                : totalBalance > 0 
                  ? `You are owed $${totalBalance.toFixed(2)}` 
                  : `You owe $${Math.abs(totalBalance).toFixed(2)}`
              }
            </Text>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.section}>
        <Title>Your Groups</Title>
        {userGroups.length === 0 ? (
          <Text style={styles.emptyText}>You haven't joined any groups yet.</Text>
        ) : (
          userGroups.map((group: { id: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; members: string | any[]; }) => {
            const balances = calculateBalances(group.id as string);
            const userBalance = balances.find((b: { userId: any; }) => b.userId === currentUser.id);
            const balance = userBalance ? userBalance.amount : 0;
            
            return (
              <Card key={group.id} style={styles.groupCard}>
                <Card.Content>
                  <Title>{group.name}</Title>
                  <Text>Members: {group.members.length}</Text>
                  <Text 
                    style={{ 
                      color: balance > 0 ? 'green' : balance < 0 ? 'red' : 'black',
                      fontWeight: 'bold',
                      marginTop: 8
                    }}
                  >
                    {balance === 0 
                      ? 'You are settled up' 
                      : balance > 0 
                        ? `You are owed $${balance.toFixed(2)}` 
                        : `You owe $${Math.abs(balance).toFixed(2)}`
                    }
                  </Text>
                </Card.Content>
              </Card>
            );
          })
        )}
      </View>
    </ScrollView>
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
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    marginTop: 16,
  },
  editForm: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  summaryCard: {
    margin: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  groupCard: {
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ProfileScreen;
