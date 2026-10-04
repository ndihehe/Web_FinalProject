import React, { useState, useEffect } from 'react';
import { cinemaService } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';

export default function UserProfileScreen() {
  const { navigate } = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'

  // Form info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [isEditing, setIsEditing] = useState(false);

  // Form password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [alertMsg, setAlertMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await cinemaService.getUserProfile();
      setProfile(res.data);
      setFullName(res.data.fullName || '');
      setPhone(res.data.phone || '');
      setDateOfBirth(res.data.dateOfBirth || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setDateOfBirth(profile.dateOfBirth || '');
    }
    setIsEditing(false);
    setErrorMsg('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isEditing) return;
    setSubmitting(true);
    setErrorMsg('');
    setAlertMsg('');
    try {
      const res = await cinemaService.updateUserProfile({
        fullName,
        phone,
        dateOfBirth
      });
      setProfile(res.data);
      setAlertMsg('Cập nhật thông tin tài khoản thành công!');
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setAlertMsg('');
    try {
      await cinemaService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      setAlertMsg('Đổi mật khẩu thành công! Các phiên đăng nhập khác đã được thu hồi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi đổi mật khẩu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  return (
    <div className="page-container user-profile-screen">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Hồ sơ cá nhân</span>
        </div>

        {alertMsg && (
          <div className="alert-banner success">
            <FeatherIcon name="check-circle" size={18} />
            <span>{alertMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert-banner error">
            <FeatherIcon name="alert-circle" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="profile-layout-grid">
          {/* CỘT TRÁI: THẺ THÀNH VIÊN VÀ ĐIỀU HƯỚNG */}
          <div className="profile-sidebar glass-card">
            <div className="profile-avatar-card">
              <div className="avatar-circle initial-avatar">
                <span>{(profile.fullName || 'B').trim().charAt(0).toUpperCase()}</span>
              </div>
              <h3 className="profile-user-name spotlight-text">{profile.fullName}</h3>
              <span className="profile-email-badge">{profile.email}</span>
              <span className="profile-role-tag">THÀNH VIÊN BETA REWARDS</span>
            </div>

            <div className="profile-nav-menu">
              <button
                className={`p-nav-item ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <FeatherIcon name="user" size={16} /> Thông Tin Cá Nhân
              </button>
              <button
                className={`p-nav-item ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <FeatherIcon name="lock" size={16} /> Đổi Mật Khẩu
              </button>
              <button className="p-nav-item" onClick={() => navigate('/wallet')}>
                <FeatherIcon name="credit-card" size={16} /> Ví Tiền & Nạp Tiền
              </button>
              <button className="p-nav-item" onClick={() => navigate('/user/booking')}>
                <FeatherIcon name="film" size={16} /> Vé & Đơn Đã Đặt
              </button>
              <button className="p-nav-item" onClick={() => navigate('/user/voucher')}>
                <FeatherIcon name="tag" size={16} /> Kho Voucher Của Tôi
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: NỘI DUNG FORM */}
          <div className="profile-main-content">
            {activeTab === 'info' && (
              <div className="profile-form-card glass-card">
                <h3 className="form-card-title spotlight-text">CẬP NHẬT THÔNG TIN HỒ SƠ</h3>
                <p className="form-card-subtitle">Theo quy chuẩn hệ thống, địa chỉ Email là định danh bất biến không thể thay đổi.</p>

                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label>Địa chỉ Email (Cố định):</label>
                    <input
                      type="email"
                      className="input-glass disabled"
                      value={profile.email}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label>Họ và tên:</label>
                    <input
                      type="text"
                      className={`input-glass ${!isEditing ? 'disabled' : ''}`}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Số điện thoại:</label>
                    <input
                      type="text"
                      className={`input-glass ${!isEditing ? 'disabled' : ''}`}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+84..."
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>Ngày sinh:</label>
                    <input
                      type="date"
                      className={`input-glass ${!isEditing ? 'disabled' : ''}`}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* NÚT CHỈNH SỬA CẠNH NÚT LƯU THAY ĐỔI */}
                  <div className="profile-action-btns-row">
                    {!isEditing ? (
                      <button
                        type="button"
                        className="btn-glass-edit"
                        onClick={() => setIsEditing(true)}
                        title="Bấm vào để mở quyền chỉnh sửa thông tin"
                      >
                        <FeatherIcon name="edit-2" size={16} />
                        <span>CHỈNH SỬA</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-glass-cancel"
                        onClick={handleCancelEdit}
                        disabled={submitting}
                        title="Hủy các thay đổi vừa nhập"
                      >
                        <FeatherIcon name="x" size={16} />
                        <span>HỦY</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      className={`btn-glass-save ${!isEditing ? 'disabled' : ''}`}
                      disabled={!isEditing || submitting}
                      title={!isEditing ? 'Vui lòng chọn nút Chỉnh sửa trước khi lưu' : 'Lưu các thay đổi hồ sơ'}
                    >
                      <FeatherIcon name="check" size={16} />
                      <span>{submitting ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="profile-form-card glass-card">
                <h3 className="form-card-title spotlight-text">ĐỔI MẬT KHẨU TÀI KHOẢN</h3>
                <p className="form-card-subtitle">Mật khẩu mới phải từ 8 ký tự trở lên để đảm bảo an toàn tuyệt đối cho tài khoản.</p>

                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label>Mật khẩu hiện tại:</label>
                    <input
                      type="password"
                      className="input-glass"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Mật khẩu mới (tối thiểu 8 ký tự):</label>
                    <input
                      type="password"
                      className="input-glass"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Xác nhận mật khẩu mới:</label>
                    <input
                      type="password"
                      className="input-glass"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="profile-action-btns-row">
                    <button type="submit" className="btn-glass-save" disabled={submitting}>
                      <FeatherIcon name="check" size={16} />
                      <span>{submitting ? 'ĐANG CẬP NHẬT...' : 'XÁC NHẬN ĐỔI MẬT KHẨU'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
