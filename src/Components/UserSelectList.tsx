import React, { useState } from 'react';
import { Group, Button, ActionIcon, ScrollArea, Checkbox } from '@mantine/core';
import { collection, getDocs, updateDoc, doc, arrayUnion, query, where } from 'firebase/firestore';
import { firestore as db } from '../firebase-config';
import { IconX } from '@tabler/icons-react';
import { useAuth } from '../Auth/AuthContext';

interface UserSelectListProps {
  onClose: () => void;
}

export const UserSelectList: React.FC<UserSelectListProps> = ({
  onClose
}) => {

  const { user } = useAuth();
  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const loadUsers = async () => {
    const usersCollection = collection(db, 'userRoles');
    const usersSnapshot = await getDocs(
      query(usersCollection, where('name', '!=', false)));
    const usersList = usersSnapshot.docs.map(doc => ({
      label: doc.data().name, // Assuming the user document has a 'name' field
      value: doc.id
    }));
    setUserOptions(usersList);
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  const handleShareSubmit = async () => {
    if (selectedUsers.length > 0) {
      await updateDoc(doc(db, 'carts', user.uid), {
        users: arrayUnion(...selectedUsers)
      });
      console.log('Shared cart with users:', selectedUsers);
    }
    onClose();
  };

  const handleCheckboxChange = (value: string) => {
    if (selectedUsers.includes(value)) {
      setSelectedUsers(selectedUsers.filter(user => user !== value));
    } else {
      setSelectedUsers([...selectedUsers, value]);
    }
  };

  return (
    <div style={{ 
        marginBottom: '1rem', 
        backgroundColor: 'rgba(184, 200, 255, 1)', 
        borderRadius: '5px', 
        padding: '0 15px 15px 15px' 
      }}>
      <Group justify="space-between">
        <h4>Share Cart</h4>
        <ActionIcon onClick={onClose}>
          <IconX />
        </ActionIcon>
      </Group>
      <ScrollArea style={{ height: 200, marginBottom: '1rem' }}>
        {userOptions.map((user) => (
          <Checkbox
            p={5}
            key={user.value}
            label={user.label}
            checked={selectedUsers.includes(user.value)}
            onChange={() => handleCheckboxChange(user.value)}
          />
        ))}
      </ScrollArea>
      <Group justify="end" mt="md">
        <Button onClick={handleShareSubmit}>Share</Button>
      </Group>
    </div>
  );
};
