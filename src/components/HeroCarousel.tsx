"use client";
import { FC } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

interface Product {
  title: string;
  image: string;
  link: string;
  price?: string;
}

interface HeroCarouselProps {
  products: Product[];
  onAddToCart?: (link: string, title: string) => void;
}

const HeroCarousel: FC<HeroCarouselProps> = ({ products, onAddToCart }) => {
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.link, product.title);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Swiper
        spaceBetween={24}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 4000 }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {products.map((product, idx) => (
          <SwiperSlide key={idx}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-56 object-contain bg-gray-50 p-4" 
                />
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-105"
                >
                  + Add to Cart
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-gray-900 text-sm font-semibold line-clamp-2 min-h-[2.5em] mb-3">
                  {product.title}
                </h3>
                {product.price && (
                  <p className="text-blue-600 font-bold text-xl mb-3">{product.price}</p>
                )}
                <div className="flex items-center justify-between">
                  <a 
                    href={product.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-500 hover:text-gray-700 text-xs hover:underline"
                  >
                    View on Amazon →
                  </a>
                  <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                    +$1.50 fee
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel; 