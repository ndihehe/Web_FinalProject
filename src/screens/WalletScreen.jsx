import React, { useState, useEffect } from 'react';
import { cinemaService } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';

export default function WalletScreen() {
  const { navigate } = useRouter();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100000);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [wRes, txRes] = await Promise.all([
        cinemaService.getWallet(),
        cinemaService.getWalletTransactions()
      ]);
      setWallet(wRes?.data || {});
      setTransactions(Array.isArray(txRes?.data) ? txRes.data : (txRes?.data?.items || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    setSubmitting(true);
    try {
      await cinemaService.topUpWallet({ amount: Number(topUpAmount) });
      setIsTopUpModalOpen(false);
      setAlertMsg(`Nạp thành công ${Number(topUpAmount).toLocaleString('vi-VN')} đ vào ví!`);
      await loadWalletData();
    } catch (e) {
      alert(e.message || 'Lỗi nạp tiền');
    } finally {
      setSubmitting(false);
    }
  };

  const presetAmounts = [50000, 100000, 200000, 500000, 1000000];

  return (
    <div className="page-container wallet-screen">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Ví Beta Rewards</span>
        </div>

        {alertMsg && (
          <div className="alert-banner success">
            <FeatherIcon name="check-circle" size={18} />
            <span>{alertMsg}</span>
          </div>
        )}

        {/* THẺ SỐ DƯ VÍ BETA CINEMA */}
        <div className="wallet-card-container">
          <div className="wallet-card-card">
            <div className="w-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/images/logo_tdtdt_transparent.png" alt="TDTDT Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                <div>
                  <span className="w-brand-tag">TDTDT CINEMA WALLET</span>
                  <span className="w-card-subtitle">Thanh toán vé & F&B tức thì, hoàn tiền an toàn</span>
                </div>
              </div>
              <div className="w-icon-badge">
                <FeatherIcon name="credit-card" size={28} />
              </div>
            </div>

            <div className="w-card-body">
              <span className="w-balance-label">SỐ DƯ KHẢ DỤNG</span>
              <h1 className="w-balance-amount spotlight-text">
                {wallet ? wallet.balance.toLocaleString('vi-VN') : 0} <span className="w-currency">VND</span>
              </h1>
            </div>

            <div className="w-card-footer">
              <button className="btn-wallet-topup" onClick={() => setIsTopUpModalOpen(true)}>
                <FeatherIcon name="plus-circle" size={18} /> NẠP TIỀN VÀO VÍ
              </button>
              <button className="btn-wallet-history" onClick={() => navigate('/user/booking')}>
                <FeatherIcon name="shopping-bag" size={18} /> Vé đã mua
              </button>
            </div>
          </div>
        </div>

        {/* SỔ CÁI LEDGER BIẾN ĐỘNG SỐ DƯ (GET /wallet/transaction) */}
        <div className="wallet-history-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title spotlight-text">BIẾN ĐỘNG SỐ DƯ VÍ (LEDGER)</h2>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải lịch sử giao dịch ví...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <FeatherIcon name="file-text" size={40} />
              <p>Chưa có giao dịch biến động nào trong ví.</p>
            </div>
          ) : (
            <div className="table-responsive-box">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Loại giao dịch</th>
                    <th>Mô tả chi tiết</th>
                    <th>Biến động</th>
                    <th>Số dư sau GD</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="tx-time-col">
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td>
                        <span className={`tx-type-badge ${tx.type.toLowerCase()}`}>
                          {tx.type === 'TOP_UP' ? 'NẠP TIỀN' : tx.type === 'PAYMENT' ? 'THANH TOÁN' : 'HOÀN TIỀN'}
                        </span>
                      </td>
                      <td className="tx-desc-col">{tx.description}</td>
                      <td className={`tx-amount-col ${tx.direction === 'CREDIT' ? 'credit' : 'debit'}`}>
                        {tx.direction === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="tx-balance-col spotlight-text">
                        {tx.balanceAfter.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NẠP TIỀN VÍ (POST /wallet/top-up) */}
      {isTopUpModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box-orthogonal">
            <h3 className="modal-title spotlight-text">Nạp Tiền Vào Ví Beta</h3>
            <p className="modal-desc">
              Chọn mức tiền bạn muốn nạp qua Cổng thanh toán (ATM nội địa / Visa / QR):
            </p>

            <div className="preset-amounts-grid">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  className={`preset-btn ${topUpAmount === amt ? 'active' : ''}`}
                  onClick={() => setTopUpAmount(amt)}
                >
                  {amt.toLocaleString('vi-VN')} đ
                </button>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Hoặc nhập số tiền tùy chọn (10.000đ - 10.000.000đ):</label>
              <input
                type="number"
                min="10000"
                max="10000000"
                step="10000"
                className="input-orthogonal"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
            </div>

            <div className="modal-actions-row">
              <button className="btn-modal-cancel" onClick={() => setIsTopUpModalOpen(false)}>Đóng</button>
              <button className="btn-movie-book" disabled={submitting} onClick={handleTopUp}>
                {submitting ? 'Đang nạp...' : `Xác nhận nạp ${Number(topUpAmount).toLocaleString('vi-VN')} đ`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
