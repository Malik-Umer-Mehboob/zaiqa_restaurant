'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import MenuCard from '@/components/MenuCard';
import type { MenuItem } from '@/types';

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function FeaturedSection({ featuredItems }: { featuredItems: MenuItem[] }) {
  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-bottle mb-4">Featured Delights</h2>
        <div className="w-24 h-1.5 bg-chili mx-auto rounded-full"></div>
      </div>

      {featuredItems.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {featuredItems.map((item: MenuItem) => (
            <motion.div key={item.id} variants={cardVariants}>
              <MenuCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-center text-ink/60 italic">No featured items available right now.</p>
      )}

      <div className="text-center mt-12">
        <Link
          href="/menu"
          className="inline-block px-8 py-3 bg-turmeric text-ink font-semibold rounded-lg hover:bg-turmeric/90 transition-all duration-200 hover:scale-105"
        >
          View Full Menu
        </Link>
      </div>
    </section>
  );
}
