import React, { useState } from 'react';
import FeatherIcon from './FeatherIcon';

export default function UserProfileModal({ user, onClose, onLogout, onTopUpWallet }) {
  const [activeTab, setActiveTab] = useState('PROFILE'); // PROFILE, WALLET, BOOKINGS, PASSWORD
  const [topUpAmount, setTopUpAmount] = useState('100000');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passNotice, setPassNotice] = useState('');

  const handleTopUp = () => {
    const val = parseInt(topUpAmount);
    if (val > 0) {
      onTopUpWallet(val);
      alert(`Nạp thành công ${val.toLocaleString('vi-VN')} đ vào ví Beta Pay!`);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setPassNotice('Đổi mật khẩu thành công!');
    setCurrentPass('');
    setNewPass('');
  };

  return (
    <div className="seat-booking-modal" id="user-profile-modal">
      <div className="seat-booking-panel" style={{ maxWidth: '780px' }}>
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0px', background: 'var(--orange-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{user.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>

          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} title="Đóng modal">
            <FeatherIcon name="x" size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-main)' }}>
          <button
            onClick={() => setActiveTab('PROFILE')}
            style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: activeTab === 'PROFILE' ? 'var(--orange-primary)' : 'var(--text-muted)', borderBottom: activeTab === 'PROFILE' ? '2px solid var(--orange-primary)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FeatherIcon name="user" size={16} /> Hồ sơ cá nhân
          </button>
          <button
            onClick={() => setActiveTab('WALLET')}
            style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: activeTab === 'WALLET' ? 'var(--orange-primary)' : 'var(--text-muted)', borderBottom: activeTab === 'WALLET' ? '2px solid var(--orange-primary)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FeatherIcon name="dollar-sign" size={16} /> Ví Beta Pay
          </button>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: activeTab === 'BOOKINGS' ? 'var(--orange-primary)' : 'var(--text-muted)', borderBottom: activeTab === 'BOOKINGS' ? '2px solid var(--orange-primary)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FeatherIcon name="film" size={16} /> Lịch sử đặt vé
          </button>
          <button
            onClick={() => setActiveTab('PASSWORD')}
            style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: activeTab === 'PASSWORD' ? 'var(--orange-primary)' : 'var(--text-muted)', borderBottom: activeTab === 'PASSWORD' ? '2px solid var(--orange-primary)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FeatherIcon name="key" size={16} /> Đổi mật khẩu
          </button>
        </div>

        {/* Tab content */}
        <div className="panel-content" style={{ padding: '24px' }}>
          {activeTab === 'PROFILE' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Họ và tên</label>
                <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '0px', border: '1px solid var(--border-subtle)', color: '#fff' }}>
                  {user.name}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email</label>
                <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '0px', border: '1px solid var(--border-subtle)', color: '#fff' }}>
                  {user.email}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Số điện thoại</label>
                <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '0px', border: '1px solid var(--border-subtle)', color: '#fff' }}>
                  {user.phone || '+84900000001'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Trạng thái tài khoản</label>
                <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '0px', border: '1px solid var(--border-subtle)', color: '#22c55e', fontWeight: 600 }}>
                  Đang hoạt động (ACTIVE)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'WALLET' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '24px', borderRadius: '0px', border: '1px solid var(--border-active)', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Số dư Ví Beta Pay</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--orange-primary)' }}>
                    {user.walletBalance.toLocaleString('vi-VN')} đ
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '0px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--border-subtle)', outline: 'none' }}
                  >
                    <option value="50000">50.000 đ</option>
                    <option value="100000">100.000 đ</option>
                    <option value="200000">200.000 đ</option>
                    <option value="500000">500.000 đ</option>
                  </select>
                  <button onClick={handleTopUp} className="btn-orange" style={{ padding: '10px 18px', borderRadius: '0px', fontSize: '14px' }}>
                    <FeatherIcon name="plus-circle" size={16} /> Nạp Tiền
                  </button>
                </div>
              </div>

              <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: '12px' }}>Giao Dịch Gần Đây</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: '0px', fontSize: '13px' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>Thanh toán vé xem phim</strong>
                    <div style={{ color: 'var(--text-muted)' }}>The Witcher Season 2 (2 vé)</div>
                  </div>
                  <div style={{ color: '#ef4444', fontWeight: 700 }}>-260.000 đ</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: '0px', fontSize: '13px' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>Nạp tiền vào ví</strong>
                    <div style={{ color: 'var(--text-muted)' }}>Ngân hàng Vietcombank</div>
                  </div>
                  <div style={{ color: '#22c55e', fontWeight: 700 }}>+500.000 đ</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'BOOKINGS' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {user.bookings && user.bookings.map((b) => (
                  <div key={b.id} style={{ padding: '16px 20px', background: 'var(--bg-card)', borderRadius: '0px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>{b.movieTitle}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {b.cinema} | {b.time}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--orange-primary)', marginTop: '2px' }}>
                        Ghế: {b.seats.join(', ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '16px' }}>{b.total.toLocaleString('vi-VN')} đ</div>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '0px', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontWeight: 700 }}>
                        ĐÃ THANH TOÁN
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'PASSWORD' && (
            <form onSubmit={handleChangePassword} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {passNotice && <div style={{ color: '#22c55e', fontSize: '13px' }}>{passNotice}</div>}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '0px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: '#fff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '0px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: '#fff', outline: 'none' }}
                />
              </div>
              <button type="submit" className="btn-orange" style={{ padding: '10px', borderRadius: '0px', marginTop: '6px' }}>
                Cập Nhật Mật Khẩu
              </button>
            </form>
          )}
        </div>

        {/* Panel Footer */}
        <div className="panel-footer" style={{ justifyContent: 'flex-end' }}>
          <button
            onClick={() => { onLogout(); onClose(); }}
            style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, padding: '8px 16px', borderRadius: '0px', background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <FeatherIcon name="log-out" size={16} /> Đăng Xuất
          </button>
        </div>
      </div>
    </div>
  );
}
