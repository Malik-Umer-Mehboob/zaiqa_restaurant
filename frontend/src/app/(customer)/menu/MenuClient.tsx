'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import MenuCard from '@/components/MenuCard';
import type { MenuCategory, MenuItem } from '@/types';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function MenuClient({ initialCategories }: { initialCategories: MenuCategory[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Determine items to display
  let itemsToDisplay = [];
  if (activeCategory === 'All') {
    itemsToDisplay = initialCategories.flatMap(cat => cat.items || []);
  } else {
    const cat = initialCategories.find(c => c.id === activeCategory);
    itemsToDisplay = cat ? (cat.items || []) : [];
  }

  // Apply search filter
  if (searchQuery.trim() !== '') {
    const lowerQuery = searchQuery.toLowerCase();
    itemsToDisplay = itemsToDisplay.filter((item: MenuItem) =>  
      item.name.toLowerCase().includes(lowerQuery) || 
      (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
      (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  return (
    <div className="pb-16 pt-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-bottle mb-6">Our Menu</h1>
        <p className="text-ink/80 max-w-2xl mx-auto text-lg leading-relaxed">
          Discover our carefully curated selection of authentic dishes, prepared with passion and the finest ingredients.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="relative shadow-sm">
          <input 
            type="text" 
            placeholder="Search for dishes, ingredients, or tags..." 
            className="w-full p-4 pl-6 border-2 border-basmati rounded-full focus:outline-none focus:border-turmeric bg-basmati text-ink transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-14">
        <button 
          onClick={() => setActiveCategory('All')}
          className={`px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
            activeCategory === 'All' 
              ? 'bg-chili text-basmati shadow-md scale-105' 
              : 'bg-basmati text-ink border border-bottle/10 hover:bg-bottle/5'
          }`}
        >
          All
        </button>
        {initialCategories.map(category => (
          <button 
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
              activeCategory === category.id 
                ? 'bg-chili text-basmati shadow-md scale-105' 
                : 'bg-basmati text-ink border border-bottle/10 hover:bg-bottle/5'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Grid — staggered scroll-reveal */}
      {itemsToDisplay.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          key={activeCategory + searchQuery}  // re-trigger animation on filter change
        >
          {itemsToDisplay.map((item: MenuItem) => (
            <motion.div key={item.id} variants={cardVariants}>
              <MenuCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-24 bg-basmati/40 rounded-3xl border border-bottle/5">
          <p className="text-2xl text-ink/50 font-serif mb-4">No dishes found matching your criteria.</p>
          <button 
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="text-turmeric font-bold text-lg hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}


