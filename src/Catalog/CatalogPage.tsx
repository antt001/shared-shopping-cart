import { useEffect, useState } from 'react';
import { Flex, Grid, Loader } from '@mantine/core';
import { CatalogItem, Item } from '../Components/CatalogItem';
import { collection, getDocs, query, startAfter, limit, orderBy } from 'firebase/firestore';
import { firestore as db } from '../firebase-config';
import Header from '../Components/Header';
import { CartSidebar } from '../Cart/CartSidebar';
import { useDisclosure } from '@mantine/hooks';

const ITEMS_PER_PAGE = 25;

export function CatalogPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  // Use media queries to determine the number of columns based on screen size
  // const columns = useMediaQuery('(min-width: 1200px)') ? 4 : useMediaQuery('(min-width: 992px)') ? 3 : useMediaQuery('(min-width: 768px)') ? 2 : 1;

  const fetchItems = async () => {
    setLoading(true);
    const itemsCollection = collection(db, 'products');
    const itemsQuery = lastVisible
      ? query(itemsCollection, orderBy('name'), startAfter(lastVisible), limit(ITEMS_PER_PAGE))
      : query(itemsCollection, orderBy('name'), limit(ITEMS_PER_PAGE));

    const itemsSnapshot = await getDocs(itemsQuery);
    const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));

    if (itemsSnapshot.docs.length > 0) {
      setLastVisible(itemsSnapshot.docs[itemsSnapshot.docs.length - 1]);
      setItems(prevItems => [...prevItems, ...itemsList]);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleScroll = (e: any) => {
    if (loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight) {
      fetchItems();
    }
  };

  return (
    <>
      <Header onCartOpen={() => open()} />
      <Flex
        onScroll={handleScroll}
        style={{ height: '100vh', overflowY: 'scroll' }}
        direction="column" gap="md" p="md">
        <Grid>
          {items.map((item, key) => (
            <Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 4, lg: 2 }} key={key}>
              <CatalogItem item={item} onCartOpen={() => open()} />
            </Grid.Col>
          ))}
        </Grid>
        {loading && <Loader />}
      </Flex>
      <CartSidebar opened={opened} onClose={() => close()} />
    </>
  );
}
