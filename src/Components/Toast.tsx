import { Group, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';

const ToastStyle: React.CSSProperties = { 
  display: 'block', 
  alignItems: 'center', 
  justifyContent: 'center', 
  border: '1px solid #CACACA',
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '300px',
  backgroundColor: '#fff',
  borderRadius: '5px',
  padding: '10px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  zIndex: 9999
};

const Toast: React.FC<{ message: string; }> = ({ message }) => {
  return (
    <div style={ToastStyle}>
      <Group grow>
        <IconCheck />
        <Text>{message}</Text>
      </Group>
    </div>
  );
};

export default Toast;