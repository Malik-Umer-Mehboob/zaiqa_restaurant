import MenuClient from './MenuClient';

export const metadata = {
  title: 'Menu | Zaiqa',
  description: 'Explore our authentic dishes.',
};

async function getMenuData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/menu`, {
      cache: 'no-store'
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error('Menu fetch error:', error);
    return [];
  }
}

export default async function MenuPage() {
  const menuCategories = await getMenuData();
  
  // Pass the server-fetched data to our interactive Client Component
  return <MenuClient initialCategories={menuCategories} />;
}
