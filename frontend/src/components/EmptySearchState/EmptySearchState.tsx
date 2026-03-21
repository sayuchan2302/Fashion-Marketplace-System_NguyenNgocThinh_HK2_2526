import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { CLIENT_TEXT } from '../../utils/texts';
import './EmptySearchState.css';

const t = CLIENT_TEXT.search.empty;

const EmptySearchState = ({ query }: { query: string }) => {
  const popularKeywords = t.popularKeywords;

  return (
    <motion.div
      className="empty-search-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.08 }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className="empty-search-icon"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Search size={64} strokeWidth={1} />
      </motion.div>

      <motion.h2
        className="empty-search-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {t.title}
      </motion.h2>

      <motion.p
        className="empty-search-subtitle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {query ? t.subtitle(query) : 'Vui lòng nhập từ khóa tìm kiếm'}
      </motion.p>

      {query && (
        <motion.div
          className="empty-search-suggestions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <p className="empty-search-suggestions-label">{t.suggestions}</p>
          <div className="empty-search-keywords">
            {popularKeywords.map((keyword, i) => (
              <motion.div
                key={keyword}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={`/search?q=${encodeURIComponent(keyword)}`}
                  className="empty-search-keyword-chip"
                >
                  {keyword}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        className="empty-search-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p className="empty-search-browse-label">{t.browseCategories}</p>
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <Link to="/category/men" className="empty-search-browse-btn">
            Thời Trang Nam
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <Link to="/category/women" className="empty-search-browse-btn">
            Thời Trang Nữ
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="empty-search-hint"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p>Mẹo: Thử tìm kiếm với tên sản phẩm, danh mục hoặc mã sản phẩm</p>
      </motion.div>
    </motion.div>
  );
};

export default EmptySearchState;
