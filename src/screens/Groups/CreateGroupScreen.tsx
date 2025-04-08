import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Chip, Title, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useGroupStore } from '../../store/groupStore';
import { useUserStore } from '../../store/userStore';
import { User } from '../../types';
import { RootStackParamList } from '../../navigation';

type CreateGroupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateGroup'>;

const CreateGroupScreen = () => {
  const navigation = useNavigation<CreateGroupScreenNavigationProp>();
  const { addGroup } = useGroupStore();
  const { currentUser, addUser } = useUserStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState<User[]>(currentUser ? [currentUser] : []);
  
  const addMember = () => {
    if (memberName.trim() === '') return;
    
    const newMember = addUser(memberName.trim());
    setMembers([...members, newMember]);
    setMemberName('');
  };
  
  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };
  
  const handleCreateGroup = () => {
    if (!name.trim() || !currentUser) return;
    
    addGroup(name, description, members, currentUser.id);
    navigation.goBack();
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Title style={styles.title}>Create a New Group</Title>
        
        <TextInput
          label="Group Name"
          value={name}
          onChangeText={setName}
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
        
        <Title style={styles.subtitle}>Members</Title>
        
        <View style={styles.membersContainer}>
          {members.map(member => (
            <Chip
              key={member.id}
              style={styles.chip}
              onClose={member.id !== currentUser?.id ? () => removeMember(member.id) : undefined}
              disabled={member.id === currentUser?.id}
            >
              {member.name} {member.id === currentUser?.id && '(You)'}
            </Chip>
          ))}
        </View>
        
        <View style={styles.addMemberContainer}>
          <TextInput
            label="Add Member"
            value={memberName}
            onChangeText={setMemberName}
            style={styles.memberInput}
            mode="outlined"
          />
          <Button mode="contained" onPress={addMember} style={styles.addButton}>
            Add
          </Button>
        </View>
        
        <Button
          mode="contained"
          onPress={handleCreateGroup}
          style={styles.createButton}
          disabled={!name.trim() || members.length === 0}
        >
          Create Group
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
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
  },
  addMemberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  memberInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    marginLeft: 8,
  },
  createButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

export default CreateGroupScreen;
