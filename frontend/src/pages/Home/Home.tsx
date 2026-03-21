import { useState, useEffect } from 'react';
import './Home.css';
import HeroSlider from '../../components/HeroSlider/HeroSlider';
import Categories from '../../components/Categories/Categories';
import CollectionsBanner from '../../components/CollectionsBanner/CollectionsBanner';
import ProductSection from '../../components/ProductSection/ProductSection';
import Testimonials from '../../components/Testimonials/Testimonials';
import TrustBadges from '../../components/TrustBadges/TrustBadges';
import Newsletter from '../../components/Newsletter/Newsletter';
import { mensFashion, womensFashion } from '../../mocks/products';
import Skeleton from '../../components/Skeleton/Skeleton';
import './Home.css';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-page">
      <main className="main-content">
        {isLoading ? (
          <div className="home-loading">
            <div className="hero-skeleton">
              <Skeleton type="rectangular" height={500} />
            </div>
            <div className="categories-skeleton">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} type="circular" width={80} height={80} />
              ))}
            </div>
            <div className="product-section-skeleton">
              <Skeleton type="text" width={200} height={28} />
              <div className="product-grid-skeleton">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="product-card-skeleton">
                    <Skeleton type="rectangular" height={280} />
                    <Skeleton type="text" width="80%" />
                    <Skeleton type="text" width="40%" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <HeroSlider />
            <Categories />
            
            <ProductSection 
              title="THỜI TRANG NAM NỔI BẬT" 
              products={mensFashion} 
              viewAllLink="/mens-fashion" 
            />
            
            <CollectionsBanner />
            
            <ProductSection 
              title="THỜI TRANG NỮ THỊNH HÀNH" 
              products={womensFashion} 
              viewAllLink="/womens-fashion" 
            />
            
            <Testimonials />
            
            <Newsletter />
            <TrustBadges />
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
