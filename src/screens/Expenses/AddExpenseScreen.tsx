// src/screens/Expenses/AddExpenseScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Title, Text, Chip, RadioButton, Menu } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { useGroupStore } from '../../store/groupStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useUserStore } from '../../store/userStore';
import { RootStackParamList } from '../../navigation';
import { Split } from '../../types';

type AddExpenseRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;
type AddExpenseNavigationProp = StackNavigationProp<RootStackParamList, 'AddExpense'>;

const CATEGORIES = [
  'Food', 'Transportation', 'Housing', 'Entertainment', 'Utilities', 'Other'
];

const AddExpenseScreen = () => {
  const route = useRoute<AddExpenseRouteProp>();
  const navigation = useNavigation<AddExpenseNavigationProp>();
  const { groupId } = route.params;
  
  const { groups } = useGroupStore();
  const { addExpense } = useExpenseStore();
  const { currentUser } = useUserStore();
  
  const group = groups.find(g => g.id === groupId);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [payerId, setPayerId] = useState(currentUser?.id || '');
  const [splitType, setSplitType] = useState('equal'); // 'equal' or 'custom'
  const [customSplits, setCustomSplits] = useState<Split[]>([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  
  if (!group || !currentUser) {
    return (
      <View style={styles.centered}>
        <Text>Group not found or user not logged in</Text>
      </View>
    );
  }
  
  // Initialize custom splits if empty
  if (customSplits.length === 0 && group.members.length > 0) {
    const initialSplits = group.members.map(member => ({
      userId: member.id,
      amount: 0,
    }));
    setCustomSplits(initialSplits);
  }
  
  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const calculateEqualSplits = (): Split[] => {
    const numMembers = group.members.length;
    if (numMembers === 0 || !amount) return [];
    
    const amountPerPerson = parseFloat(amount) / numMembers;
    
    return group.members.map(member => ({
      userId: member.id,
      amount: amountPerPerson,
    }));
  };
  
  const updateCustomSplit = (userId: string, value: string) => {
    const newAmount = value === '' ? 0 : parseFloat(value);
    
    setCustomSplits(prevSplits => 
      prevSplits.map(split => 
        split.userId === userId 
          ? { ...split, amount: newAmount } 
          : split
      )
    );
  };
  
  const getTotalSplitAmount = () => {
    return customSplits.reduce((sum, split) => sum + split.amount, 0);
  };
  
  const handleAddExpense = () => {
    if (!title.trim() || !amount || !payerId) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    
    const splits = splitType === 'equal' 
      ? calculateEqualSplits() 
      : customSplits;
    
    addExpense({
      title,
      description,
      amount: parsedAmount,
      category,
      date,
      payerId,
      groupId,
      splits,
    });
    
    navigation.goBack();
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Title style={styles.title}>Add New Expense</Title>
        
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
        />
        
        <TextInput
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          multiline
        />
        <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        mode="outlined"
        keyboardType="decimal-pad"
      />
      
      <View style={styles.menuContainer}>
        <Text style={styles.label}>Category</Text>
        <Menu
          visible={showCategoryMenu}
          onDismiss={() => setShowCategoryMenu(false)}
          anchor={
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => setShowCategoryMenu(true)}
            >
              <Text>{category}</Text>
            </TouchableOpacity>
          }
        >
          {CATEGORIES.map((cat) => (
            <Menu.Item
              key={cat}
              onPress={() => {
                setCategory(cat);
                setShowCategoryMenu(false);
              }}
              title={cat}
            />
          ))}
        </Menu>
      </View>
      
      <View style={styles.dateContainer}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{format(date, 'MMM dd, yyyy')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
      
      <View style={styles.payerContainer}>
        <Text style={styles.label}>Paid by</Text>
        <View style={styles.payerOptions}>
          {group.members.map(member => (
            <RadioButton.Item
              key={member.id}
              label={`${member.name} ${member.id === currentUser.id ? '(You)' : ''}`}
              value={member.id}
              status={payerId === member.id ? 'checked' : 'unchecked'}
              onPress={() => setPayerId(member.id)}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.splitContainer}>
        <Text style={styles.label}>Split Type</Text>
        <RadioButton.Group
          onValueChange={value => setSplitType(value)}
          value={splitType}
        >
          <View style={styles.splitOptions}>
            <RadioButton.Item label="Equal" value="equal" />
            <RadioButton.Item label="Custom" value="custom" />
          </View>
        </RadioButton.Group>
        
        {splitType === 'custom' && (
          <View style={styles.customSplitContainer}>
            <Text style={styles.sublabel}>
              Total Amount: ${amount || '0'}
            </Text>
            <Text style={styles.sublabel}>
              Split Amount: ${getTotalSplitAmount().toFixed(2)}
            </Text>
            <Text style={[
              styles.sublabel,
              { 
                color: parseFloat(amount || '0') === getTotalSplitAmount() 
                  ? 'green' 
                  : 'red' 
              }
            ]}>
              {parseFloat(amount || '0') === getTotalSplitAmount() 
                ? 'Splits match total amount' 
                : 'Splits do not match total amount'}
            </Text>
            
            {group.members.map(member => (
              <View key={member.id} style={styles.customSplitItem}>
                <Text style={styles.memberName}>
                  {member.name} {member.id === currentUser.id ? '(You)' : ''}
                </Text>
                <TextInput
                  label="Amount"
                  value={
                    customSplits.find(split => split.userId === member.id)?.amount.toString() || '0'
                  }
                  onChangeText={(value) => updateCustomSplit(member.id, value)}
                  style={styles.splitInput}
                  mode="outlined"
                  keyboardType="decimal-pad"
                />
              </View>
            ))}
          </View>
        )}
      </View>
      
      <Button
        mode="contained"
        onPress={handleAddExpense}
        style={styles.addButton}
        disabled={
          !title.trim() || 
          !amount || 
          isNaN(parseFloat(amount)) || 
          parseFloat(amount) <= 0 ||
          (splitType === 'custom' && parseFloat(amount) !== getTotalSplitAmount())
        }
      >
        Add Expense
      </Button>
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
formContainer: {
  padding: 16,
},
title: {
  fontSize: 24,
  marginBottom: 16,
},
input: {
  marginBottom: 16,
},
label: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 8,
},
sublabel: {
  fontSize: 14,
  marginBottom: 8,
},
menuContainer: {
  marginBottom: 16,
},
categoryButton: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 4,
  padding: 10,
  backgroundColor: 'white',
},
dateContainer: {
  marginBottom: 16,
},
dateButton: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 4,
  padding: 10,
  backgroundColor: 'white',
},
payerContainer: {
  marginBottom: 16,
},
payerOptions: {
  backgroundColor: 'white',
  borderRadius: 4,
  overflow: 'hidden',
},
splitContainer: {
  marginBottom: 16,
},
splitOptions: {
  flexDirection: 'row',
  backgroundColor: 'white',
  borderRadius: 4,
},
customSplitContainer: {
  marginTop: 16,
  padding: 16,
  backgroundColor: 'white',
  borderRadius: 4,
},
customSplitItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
memberName: {
  flex: 1,
  fontSize: 16,
},
splitInput: {
  width: 120,
},
addButton: {
  marginTop: 16,
  paddingVertical: 8,
},
});

export default AddExpenseScreen;
