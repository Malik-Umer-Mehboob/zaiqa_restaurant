import Link from 'next/link';
import FeaturedSection from '@/components/FeaturedSection';
import type { MenuCategory } from '@/types';

async function getFeaturedItems() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/menu`, {
      next: { revalidate: 60 } // revalidate every minute
    });
    const json = await res.json();
    if (json.success && json.data.length > 0) {
      const allItems = json.data.flatMap((cat: MenuCategory) => cat.items || []);
      return allItems.slice(0, 3);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch featured items', error);
    return [];
  }
}



export default async function HomePage() {
  const featuredItems = await getFeaturedItems();

  return (
    <div className="flex flex-col gap-20 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-bottle text-basmati p-6 sm:p-12 md:p-24 flex flex-col items-center text-center shadow-xl mt-4">
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 to-transparent"></div>
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold text-turmeric mb-6 tracking-wide drop-shadow-lg">
            Zaiqa
          </h1>
          <p className="text-lg md:text-2xl mb-12 font-light opacity-90 leading-relaxed">
            Experience the authentic taste of tradition. <br className="hidden md:block" /> Where every spice tells a story.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link 
              href="/menu" 
              className="px-10 py-4 bg-turmeric text-ink font-bold text-lg rounded-xl hover:bg-turmeric/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              Order Now
            </Link>
            <Link 
              href="/reservations" 
              className="px-10 py-4 bg-transparent border-2 border-turmeric text-ink hover:bg-turmeric hover:text-white font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105"
            >
              Reserve a Table
            </Link>
          </div>
        </div>
      </section>

      {/* Scrolling Marquee Strip */}
      <div className="overflow-hidden bg-bottle py-4 rounded-2xl shadow-inner -mt-10">
        <div className="marquee-track font-serif text-turmeric text-xl tracking-widest select-none">
          <span className="flex-shrink-0 px-8 whitespace-nowrap">
            Biryani&nbsp;•&nbsp;Karahi&nbsp;•&nbsp;Seekh Kebab&nbsp;•&nbsp;Naan&nbsp;•&nbsp;Haleem&nbsp;•&nbsp;Nihari&nbsp;•&nbsp;Tikka&nbsp;•&nbsp;Qorma&nbsp;•&nbsp;
          </span>
          <span className="flex-shrink-0 px-8 whitespace-nowrap" aria-hidden="true">
            Biryani&nbsp;•&nbsp;Karahi&nbsp;•&nbsp;Seekh Kebab&nbsp;•&nbsp;Naan&nbsp;•&nbsp;Haleem&nbsp;•&nbsp;Nihari&nbsp;•&nbsp;Tikka&nbsp;•&nbsp;Qorma&nbsp;•&nbsp;
          </span>
        </div>
      </div>

      {/* Featured Items Section — client component handles scroll-reveal */}
      <FeaturedSection featuredItems={featuredItems} />
    </div>
  );
}
