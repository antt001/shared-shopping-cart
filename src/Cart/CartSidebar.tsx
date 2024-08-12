import React from 'react';
import { Drawer, Button, Group, Text, NumberInput, ActionIcon } from '@mantine/core';
import { IconTrash, IconShare, IconArrowRight } from '@tabler/icons-react';
import { useCart } from './CartContext';
import { useDisclosure } from '@mantine/hooks';
import { UserSelectList } from '../Components/UserSelectList';

interface CartSidebarProps {
  opened: boolean;
  onClose: () => void;
  notify: (message: string) => void;
}
export const CartSidebar: React.FC<CartSidebarProps> = ({ opened, onClose, notify }) => {
  const { cartItems, updateItemQuantity, removeItem, clearCart, subtotal } = useCart();
  const [shareOpened, { open, close }] = useDisclosure(false);

  // Create a currency number formatter.
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 2, // (causes 2500.99 to be printed as $2,501)
  });

  const handleClearCart = () => {
    clearCart();
    notify('Cart Cleared');
    onClose();
  };

  const handleCheckout = () => {
    clearCart();
    notify('Checkout Successful');
    onClose();
    // You can add further checkout logic here if needed
  };

  return (
    <Drawer opened={opened} onClose={onClose}
      title="Your Cart"
      padding="md"
      size="md"
      overlayProps={{ opacity: 0.5, blur: 3, center: true }}
      styles={{
        inner: { position: 'absolute', top: 0, right: 0 },
      }}
    >
      {cartItems.length === 0 ? (
        <Text ta="center" c="dimmed">Your cart is empty</Text>
      ) : (
        <>
          <Group grow mb="sm" justify='space-around'>
          <Button
            variant="light"
            leftSection={<IconShare size={14} />}
            rightSection={<IconArrowRight size={14} />}
            onClick={open}
          >Share Cart</Button>
          </Group>
          { shareOpened && <UserSelectList 
            onClose={close} onShareSubmit={handleCheckout} /> }
          {cartItems.map((item, key) => (
            <Group grow key={key} gap="xs" justify="space-between" mb="sm">
              <Text truncate="end">{item.name}</Text>
              <Group>
                <NumberInput
                  value={item.quantity}
                  onChange={(value) => updateItemQuantity(item.id, value as number)}
                  min={1}
                  max={100}
                  style={{ width: 80 }}
                />
                <Group gap="xs" justify='space-between'>
                  <Text>{formatter.format(item.price * item.quantity)}</Text>
                  <ActionIcon color="red" onClick={() => removeItem(item.id)}>
                    <IconTrash />
                  </ActionIcon>
                </Group>
              </Group>
            </Group>
          ))}
          <Group justify="space-between" mt="md">
            <Text fw={500}>Subtotal:</Text>
            <Text fw={500}>{formatter.format(subtotal)}</Text>
          </Group>
          <Group justify='space-between' mt="xl">
            <Button variant="default" onClick={handleClearCart}>Clear Cart</Button>
            <Button onClick={handleCheckout}>Checkout</Button>
          </Group>
        </>
      )}
    </Drawer>
  );
};
