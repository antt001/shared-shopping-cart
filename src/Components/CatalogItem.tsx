import React from 'react';
import { Card, Image, Text, Button, Stack } from '@mantine/core';
import { useCart } from '../Cart/CartContext';

export interface Item {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: string;
  imageURL: string;
}

interface CatalogItemProps {
  item: Item;
  onCartOpen: () => void;
}

export const CatalogItem: React.FC<CatalogItemProps> = ({ item, onCartOpen }) => {

  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price.replace(/[^0-9\.]+/g, "")),
      quantity: 1,  // Start with a default quantity of 1
    });
    onCartOpen();
  };
  
  return (
    <Card shadow="sm" padding="lg" maw={300} miw={200}>
      {/* Assuming each item might have an image URL */}
      <Card.Section>
        <Image src={item.imageURL} alt={item.name} />
      </Card.Section>

      <Stack gap="xs" style={{ marginBottom: 5, marginTop: 'md' }}>
        <Text fw={500} truncate="end">{item.name}</Text>
        <Text c="blue" size="xl">{item.price}</Text>
      </Stack>

      <Text size="sm" c="dimmed" truncate="end">
        {item.short_description}
      </Text>

      <Button variant="light" color="blue" fullWidth style={{ marginTop: 14 }} onClick={handleAddToCart}>
        Add to Cart
      </Button>
    </Card>
  );
};
