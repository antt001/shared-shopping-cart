import React from 'react';
import { Group, Avatar, Menu, UnstyledButton, ActionIcon } from '@mantine/core';
import { useAuth } from '../Auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase-config';
import { IconShoppingCart } from '@tabler/icons-react';

interface HeaderProps {
  onCartOpen: () => void;
}
const Header: React.FC<HeaderProps> = ({ onCartOpen }) => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
    window.location.reload();
  };

  return (
    <header>
      <Group justify="space-between" px="md">
        <h2>Catalog</h2>
        <Group>
          <ActionIcon onClick={onCartOpen}>
            <IconShoppingCart size={24} />
          </ActionIcon>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Avatar src={user?.photoURL || 'default-avatar.png'} alt={user?.displayName || 'User'} />
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{user?.displayName || 'User'}</Menu.Label>
              <Menu.Item color="red" onClick={handleLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </header>
  );
};

export default Header;
