import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  Ticket,
  MapPin,
  MessageSquare,
  ChevronRight,
  LogOut,
  X,
  Calendar,
  ChevronDown,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import './Profile.css';

// Type definition for tabs
type TabId = 'account' | 'orders' | 'vouchers' | 'addresses' | 'reviews';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [height, setHeight] = useState('163');
  const [weight, setWeight] = useState('57');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Placeholder user data
  const user = {
    name: "Ngọc Thịnh Nguyễn",
    phone: "0382253049",
    gender: "Nam",
    dob: "23/02/2004",
    height: "163 cm",
    weight: "57 kg",
    email: "thinh23022004@gmail.com",
    tier: "Thành viên Vàng",
    avatar: "N"
  };

  const tabs = [
    { id: 'account', label: 'Thông tin tài khoản', icon: User },
    { id: 'orders', label: 'Lịch sử đơn hàng', icon: ShoppingBag },
    { id: 'vouchers', label: 'Ví voucher', icon: Ticket },
    { id: 'addresses', label: 'Sổ địa chỉ', icon: MapPin },
    { id: 'reviews', label: 'Đánh giá & phản hồi', icon: MessageSquare },
  ];

  const handleLogout = () => {
    // Implement logout logic here later
    alert("Đăng xuất thành công");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="tab-pane">
            <h2 className="profile-content-title" style={{ marginBottom: '25px' }}>Thông tin tài khoản</h2>

            <div className="account-info-form">
              {/* Personal Info */}
              <div className="info-group">
                <div className="info-row">
                  <span className="info-label text-gray-500">Họ và tên</span>
                  <span className="info-value font-medium">{user.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-500">Số điện thoại</span>
                  <span className="info-value font-medium">{user.phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-500">Giới tính</span>
                  <span className="info-value font-medium">{user.gender}</span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-500">Ngày sinh</span>
                  <span className="info-value font-medium">{user.dob}</span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-500">Chiều cao</span>
                  <span className="info-value font-medium">{user.height}</span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-500">Cân nặng</span>
                  <span className="info-value font-medium">{user.weight}</span>
                </div>

                <button 
                  className="profile-btn-outline mt-8"
                  onClick={() => setIsAccountModalOpen(true)}
                >
                  CẬP NHẬT
                </button>
              </div>

              {/* Login Info */}
              <div className="info-group mt-12" style={{ marginTop: '48px' }}>
                <h3 className="profile-content-title" style={{ marginBottom: '40px' }}>Thông tin đăng nhập</h3>
                <div className="info-row">
                  <span className="info-label text-gray-500">Email</span>
                  <span className="info-value font-medium">{user.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label text-gray-500">Mật khẩu</span>
                  <span className="info-value font-medium">••••••••••••••</span>
                </div>

                <button 
                  className="profile-btn-outline mt-8"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  CẬP NHẬT
                </button>
              </div>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="tab-pane">
            <div className="profile-content-header">
              <h2 className="profile-content-title">Lịch sử đơn hàng</h2>
            </div>
            <div className="tab-placeholder">
              <ShoppingBag className="tab-placeholder-icon" />
              <h3 className="tab-placeholder-title">Chưa có đơn hàng nào</h3>
              <p className="tab-placeholder-desc text-gray-500">
                Bạn chưa có đơn đặt hàng nào. Hãy mua sắm để Coolmate phục vụ bạn nhé!
              </p>
              <Link to="/" className="profile-btn-primary">Tiếp tục mua sắm</Link>
            </div>
          </div>
        );
      case 'vouchers':
        return (
          <div className="tab-pane">
            <div className="profile-content-header">
              <h2 className="profile-content-title">Ví voucher của tôi</h2>
            </div>
            <div className="tab-placeholder">
              <Ticket className="tab-placeholder-icon" />
              <h3 className="tab-placeholder-title">Không có voucher khả dụng</h3>
              <p className="tab-placeholder-desc text-gray-500">
                Bạn chưa có mã giảm giá nào. Hãy lấy mã trong các chương trình khuyến mãi.
              </p>
              <button className="profile-btn-outline">Săn mã ngay</button>
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div className="tab-pane">
            <div className="profile-content-header flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
              <h2 className="profile-content-title text-2xl font-bold">Địa chỉ của tôi</h2>
              <button className="address-add-btn">
                <span>+</span> THÊM ĐỊA CHỈ MỚI
              </button>
            </div>
            
            <div className="address-book-content">
              <h3 className="address-book-subtitle">Sổ địa chỉ</h3>
              
              <div className="address-empty-state">
                <p>Bạn chưa có địa chỉ nào!</p>
              </div>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="tab-pane">
            <div className="profile-content-header">
              <h2 className="profile-content-title">Đánh giá & Phản hồi</h2>
            </div>
            <div className="tab-placeholder">
              <MessageSquare className="tab-placeholder-icon" />
              <h3 className="tab-placeholder-title">Chưa có sản phẩm để đánh giá</h3>
              <p className="tab-placeholder-desc text-gray-500">
                Bạn không có sản phẩm nào chờ đánh giá.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  console.log("Profile render state:", { activeTab });

  return (
    <div className="profile-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="profile-breadcrumbs">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="current">Tài khoản của tôi</span>
        </nav>

        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-user-info">
              <div className="profile-avatar">
                {/* Default to Initial if no image */}
                {user.avatar}
              </div>
              <div>
                <div className="profile-name">{user.name}</div>
                <div className="profile-tier">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  {user.tier}
                </div>
              </div>
            </div>

            <ul className="profile-nav-list">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id} className="profile-nav-item">
                    <button
                      className={`profile-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id as TabId)}
                    >
                      <Icon className="profile-nav-icon" />
                      {tab.label}
                    </button>
                  </li>
                );
              })}

              <li className="profile-nav-item mt-4 pt-4 border-t border-gray-200">
                <button className="profile-nav-btn text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                  <LogOut className="profile-nav-icon" />
                  Đăng xuất
                </button>
              </li>
            </ul>
          </aside>

          {/* Main Content */}
          <main className="profile-content">
            {renderContent() || <div className="p-8 text-center text-red-500">Error rendering tab: {activeTab}</div>}
          </main>
        </div>
      </div>

      {/* Account Update Modal */}
      {isAccountModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsAccountModalOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setIsAccountModalOpen(false)}>
              <X size={20} />
            </button>
            <h2 className="profile-modal-title">Chỉnh sửa thông tin tài khoản</h2>
            
            <form className="profile-modal-form" onSubmit={(e) => { e.preventDefault(); setIsAccountModalOpen(false); }}>
              {/* Name Input */}
              <div className="modal-input-group mt-10">
                <span className="modal-floating-label">Họ và tên</span>
                <User className="modal-input-icon" size={18} />
                <input type="text" className="modal-input" defaultValue={user.name} />
              </div>
              
              {/* DOB Inputs */}
              <div className="modal-flex-row mt-10 gap-4">
                <div className="modal-input-group">
                  <span className="modal-floating-label">Ngày</span>
                  <Calendar className="modal-input-icon" size={18} />
                  <input type="text" className="modal-input select-arrow-pad" defaultValue="23" />
                  <ChevronDown className="modal-select-arrow" size={16} />
                </div>
                <div className="modal-input-group">
                  <span className="modal-floating-label">Tháng</span>
                  <Calendar className="modal-input-icon" size={18} />
                  <input type="text" className="modal-input select-arrow-pad" defaultValue="2" />
                  <ChevronDown className="modal-select-arrow" size={16} />
                </div>
                <div className="modal-input-group">
                  <span className="modal-floating-label">Năm</span>
                  <Calendar className="modal-input-icon" size={18} />
                  <input type="text" className="modal-input select-arrow-pad" defaultValue="2004" />
                  <ChevronDown className="modal-select-arrow" size={16} />
                </div>
              </div>
              
              {/* Gender Radio */}
              <div className="modal-flex-row mt-10 mb-2 gap-6 items-center">
                <label className="modal-radio-label">
                  <input type="radio" name="gender" value="Nam" defaultChecked />
                  <span className="radio-custom"></span>
                  Nam
                </label>
                <label className="modal-radio-label">
                  <input type="radio" name="gender" value="Nữ" />
                  <span className="radio-custom"></span>
                  Nữ
                </label>
                <label className="modal-radio-label">
                  <input type="radio" name="gender" value="Khác" />
                  <span className="radio-custom"></span>
                  Không tiết lộ
                </label>
              </div>
              
              {/* Phone Input */}
              <div className="modal-input-group mt-10">
                <span className="modal-floating-label">Số điện thoại</span>
                <div className="modal-input-icon">
                  <img src="https://flagcdn.com/w20/vn.png" alt="VN Flag" className="w-5 h-auto rounded-sm" />
                </div>
                <input type="text" className="modal-input" defaultValue={user.phone} />
              </div>
              
              {/* Height Slider */}
              <div className="modal-slider-group mt-10">
                <span className="modal-slider-label">Chiều cao</span>
                <input 
                  type="range" 
                  min="100" 
                  max="190" 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)}
                  className="modal-slider mx-4" 
                  style={{ '--val': `${((Number(height) - 100) / (190 - 100)) * 100}%` } as React.CSSProperties}
                />
                <span className="modal-slider-val text-co-black font-bold">{height}cm</span>
              </div>
              
              {/* Weight Slider */}
              <div className="modal-slider-group mt-10 mb-8">
                <span className="modal-slider-label">Cân nặng</span>
                <input 
                  type="range" 
                  min="30" 
                  max="90" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)}
                  className="modal-slider mx-4" 
                  style={{ '--val': `${((Number(weight) - 30) / (90 - 30)) * 100}%` } as React.CSSProperties}
                />
                <span className="modal-slider-val text-co-black font-bold">{weight}kg</span>
              </div>
              
              <button type="submit" className="modal-submit-btn">
                CẬP NHẬT THÔNG TIN <span className="ml-2">→</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {isPasswordModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="profile-modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setIsPasswordModalOpen(false)}>
              <X size={20} />
            </button>
            <h2 className="profile-modal-title leading-tight whitespace-pre-line">
              {"Chỉnh sửa thông tin\ntài khoản"}
            </h2>
            
            <form className="profile-modal-form mt-8" onSubmit={(e) => { e.preventDefault(); setIsPasswordModalOpen(false); }}>
              {/* Old Password */}
              <div className="modal-input-group mt-10">
                <span className="modal-floating-label">Mật khẩu cũ</span>
                <Lock className="modal-input-icon text-gray-400" size={18} />
                <input 
                  type={showOldPassword ? "text" : "password"} 
                  className="modal-input pr-10" 
                  defaultValue="password123" 
                />
                <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="profile-modal-icon-btn">
                  {showOldPassword ? <EyeOff className="text-black" size={18} /> : <Eye className="text-black" size={18} />}
                </button>
              </div>

              {/* New Password */}
              <div className="modal-input-group mt-10">
                <span className="modal-floating-label hidden-if-empty">Mật khẩu mới</span>
                <Lock className="modal-input-icon text-gray-300" size={18} />
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  className="modal-input pr-10 text-gray-400" 
                  placeholder="Mật khẩu mới" 
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="profile-modal-icon-btn">
                  {showNewPassword ? <EyeOff className="text-black" size={18} /> : <Eye className="text-black" size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="modal-input-group mt-10 mb-10">
                <span className="modal-floating-label hidden-if-empty">Nhập lại mật khẩu</span>
                <Lock className="modal-input-icon text-gray-300" size={18} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="modal-input pr-10 text-gray-400" 
                  placeholder="Nhập lại mật khẩu" 
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="profile-modal-icon-btn">
                  {showConfirmPassword ? <EyeOff className="text-black" size={18} /> : <Eye className="text-black" size={18} />}
                </button>
              </div>

              <button type="submit" className="modal-submit-btn">
                CẬP NHẬT MẬT KHẨU
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
