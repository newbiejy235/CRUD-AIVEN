'use client';

import { useEffect, useMemo, useState } from 'react';

const emptyForm = { name: '', category: '', price: '' };
const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'transactions', label: 'Transaksi', icon: 'receipt' },
  { id: 'categories', label: 'Kategori', icon: 'layers' },
  { id: 'reports', label: 'Laporan', icon: 'chart' },
];

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    receipt: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2z" /><path d="M8 8h8M8 12h8M8 16h3" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /><path d="M17 6h3v3" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9h18M16 15h.01" /><path d="M6 5V3h12v2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    coffee: <><path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" /><path d="M17 10h1a3 3 0 1 1 0 6h-1M8 3v2M12 3v2" /></>,
    food: <><path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11M17 3v18M17 3c-2 2-3 5-3 8h3" /></>,
    cart: <><path d="M3 4h2l2.5 12h11L21 8H6" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" /></>,
    dots: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function getCategory(transaction) {
  return transaction.description?.trim() || 'Lainnya';
}

function getDate(value) {
  return value ? new Date(value) : null;
}

function formatDate(value) {
  const date = getDate(value);
  if (!date || Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatAxisAmount(value) {
  return `Rp ${new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)}`;
}

function categoryIcon(category) {
  const value = category.toLowerCase();
  if (value.includes('makan') || value.includes('food')) return 'food';
  if (value.includes('transport') || value.includes('belanja')) return 'cart';
  if (value.includes('rumah') || value.includes('tagihan')) return 'home';
  return 'coffee';
}

function getMonthlyChart(transactions) {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const days = Array.from({ length: today.getDate() }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), index + 1);
    const amount = transactions.reduce((total, transaction) => {
      const transactionDate = getDate(transaction.created_at);
      if (
        transactionDate &&
        transactionDate.getFullYear() === date.getFullYear() &&
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getDate() === date.getDate()
      ) {
        return total + Number(transaction.price || 0);
      }
      return total;
    }, 0);
    return { date, amount };
  });

  return { firstDay, days };
}

function SpendingChart({ transactions }) {
  const { firstDay, days } = useMemo(() => getMonthlyChart(transactions), [transactions]);
  const maxAmount = Math.max(...days.map((day) => day.amount), 100000);
  const points = days
    .map((day, index) => {
      const x = 36 + (index / Math.max(days.length - 1, 1)) * 704;
      const y = 170 - (day.amount / maxAmount) * 130;
      return `${x},${y}`;
    })
    .join(' ');
  const total = days.reduce((sum, day) => sum + day.amount, 0);
  const peakDay = days.reduce((peak, day) => (day.amount > peak.amount ? day : peak), days[0]);

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">RINGKASAN PENGELUARAN</p>
          <h2>Arus pengeluaran</h2>
        </div>
        <div className="chart-select">
          <Icon name="calendar" size={15} />
          {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(firstDay)}
        </div>
      </div>
      <div className="chart-total">{currency.format(total)}</div>
      <div className="chart-caption">Total pengeluaran bulan ini</div>
      <div className="chart-wrap">
        <div className="chart-y-labels" aria-hidden="true">
          <span>{formatAxisAmount(maxAmount)}</span>
          <span>{formatAxisAmount(maxAmount * 0.66)}</span>
          <span>{formatAxisAmount(maxAmount * 0.33)}</span>
          <span>{formatAxisAmount(0)}</span>
        </div>
        <svg className="spending-chart" viewBox="0 0 760 205" role="img" aria-label="Grafik pengeluaran bulan ini">
          <defs>
            <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#a6edb5" stopOpacity=".2" />
              <stop offset="100%" stopColor="#a6edb5" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[40, 83, 126, 170].map((y) => (
            <line key={y} x1="36" x2="740" y1={y} y2={y} className="chart-gridline" />
          ))}
          <polygon points={`36,170 ${points} 740,170`} fill="url(#chart-fill)" />
          <polyline points={points} className="chart-line" />
          {peakDay?.amount > 0 && (
            <circle
              cx={36 + (days.indexOf(peakDay) / Math.max(days.length - 1, 1)) * 704}
              cy={170 - (peakDay.amount / maxAmount) * 130}
              r="4"
              className="chart-dot"
            />
          )}
        </svg>
      </div>
      <div className="chart-x-labels">
        <span>1 {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(firstDay)}</span>
        <span>{Math.ceil(days.length / 2)} {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(firstDay)}</span>
        <span>{days.length} {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(firstDay)}</span>
      </div>
    </section>
  );
}

function TransactionRows({ transactions, onEdit, onDelete, loading }) {
  if (loading) {
    return <div className="table-empty">Memuat transaksi...</div>;
  }

  if (!transactions.length) {
    return (
      <div className="table-empty">
        <span className="empty-icon"><Icon name="receipt" size={22} /></span>
        <strong>Belum ada transaksi</strong>
        <span>Catat pengeluaran pertamamu untuk mulai melihat ringkasannya.</span>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction) => {
        const category = getCategory(transaction);
        return (
          <article className="transaction-row" key={transaction.id}>
            <div className="transaction-main">
              <span className={`transaction-icon category-${categoryIcon(category)}`}>
                <Icon name={categoryIcon(category)} size={18} />
              </span>
              <div>
                <strong>{transaction.name}</strong>
                <span>{category}</span>
              </div>
            </div>
            <span className="transaction-date">{formatDate(transaction.created_at)}</span>
            <strong className="transaction-amount">− {currency.format(Number(transaction.price))}</strong>
            <div className="transaction-actions">
              <button type="button" onClick={() => onEdit(transaction)} aria-label={`Edit ${transaction.name}`}>Edit</button>
              <button type="button" onClick={() => onDelete(transaction.id)} aria-label={`Hapus ${transaction.name}`}>Hapus</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activePage, setActivePage] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function loadTransactions() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat transaksi');
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const thisMonthTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((transaction) => {
      const date = getDate(transaction.created_at);
      return date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, [transactions]);
  const monthTotal = thisMonthTransactions.reduce((sum, transaction) => sum + Number(transaction.price || 0), 0);
  const totalAmount = transactions.reduce((sum, transaction) => sum + Number(transaction.price || 0), 0);
  const categories = useMemo(() => {
    const grouped = new Map();
    thisMonthTransactions.forEach((transaction) => {
      const category = getCategory(transaction);
      grouped.set(category, (grouped.get(category) || 0) + Number(transaction.price || 0));
    });
    return [...grouped.entries()].sort((a, b) => b[1] - a[1]);
  }, [thisMonthTransactions]);
  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((transaction) => (
      !query ||
      transaction.name.toLowerCase().includes(query) ||
      getCategory(transaction).toLowerCase().includes(query)
    ));
  }, [transactions, search]);

  function openNewForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  }

  function startEdit(transaction) {
    setEditingId(transaction.id);
    setForm({
      name: transaction.name,
      category: getCategory(transaction),
      price: transaction.price,
    });
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.category,
          price: form.price,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan transaksi');
      closeForm();
      await loadTransactions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    setError('');
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus transaksi');
      await loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  }

  const pageTitles = {
    dashboard: ['Dashboard', 'Pantau kondisi keuanganmu hari ini.'],
    transactions: ['Semua transaksi', 'Catatan lengkap pengeluaranmu.'],
    categories: ['Kategori pengeluaran', 'Lihat pengeluaran berdasarkan kategori.'],
    reports: ['Laporan pengeluaran', 'Pahami pola pengeluaranmu bulan ini.'],
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => setActivePage('dashboard')}>
          <span className="brand-mark"><Icon name="wallet" size={20} /></span>
          <span>ruang<span className="brand-accent">dana</span></span>
        </a>
        <div className="sidebar-label">MENU UTAMA</div>
        <nav className="side-nav" aria-label="Navigasi utama">
          {navigation.map((item) => (
            <button
              type="button"
              key={item.id}
              className={activePage === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setActivePage(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'transactions' && <span className="nav-count">{transactions.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-spark">✳</span>
            <strong>Langkah kecil, tujuan besar.</strong>
            <span>Catat pengeluaranmu rutin untuk keuangan yang lebih sehat.</span>
          </div>
          <div className="profile">
            <span className="avatar">R</span>
            <span className="profile-copy"><strong>Ruang Pribadi</strong><small>Catatan keuangan</small></span>
            <Icon name="dots" size={17} />
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>RuangDana</span><span className="breadcrumb-divider">/</span><strong>{pageTitles[activePage][0]}</strong></div>
          <div className="topbar-right">
            <label className="search-box">
              <Icon name="search" size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari transaksi..."
                aria-label="Cari transaksi"
              />
              <kbd>⌘ K</kbd>
            </label>
            <span className="top-avatar">R</span>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">SELAMAT DATANG KEMBALI</p>
              <h1>{pageTitles[activePage][0]}<span className="heading-dot">.</span></h1>
              <p>{pageTitles[activePage][1]}</p>
            </div>
            <button className="primary-button" type="button" onClick={openNewForm}>
              <Icon name="plus" size={17} />
              Catat pengeluaran
            </button>
          </div>

          {error && <div className="error-box" role="alert">{error}</div>}

          {(activePage === 'dashboard' || activePage === 'reports') && (
            <section className="hero-banner">
              <div className="hero-copy">
                <span className="hero-pill"><span /> KEUANGANMU, LEBIH TERATUR</span>
                <h2>Setiap rupiah<br />punya ceritanya.</h2>
                <p>Mulai kebiasaan baik dengan mencatat pengeluaranmu hari ini.</p>
                <button type="button" className="hero-link" onClick={openNewForm}>Catat transaksi pertama <Icon name="arrow" size={15} /></button>
              </div>
              <div className="hero-overlay" />
            </section>
          )}

          {(activePage === 'dashboard' || activePage === 'reports') && (
            <section className="stats-grid" aria-label="Ringkasan keuangan">
              <article className="stat-card">
                <span className="stat-icon green"><Icon name="wallet" /></span>
                <span className="stat-label">Pengeluaran bulan ini</span>
                <strong>{currency.format(monthTotal)}</strong>
                <span className="stat-note"><span className="note-dot" /> {thisMonthTransactions.length} transaksi tercatat</span>
              </article>
              <article className="stat-card">
                <span className="stat-icon purple"><Icon name="receipt" /></span>
                <span className="stat-label">Total transaksi</span>
                <strong>{transactions.length}</strong>
                <span className="stat-note">Semua transaksi tersimpan</span>
              </article>
              <article className="stat-card">
                <span className="stat-icon orange"><Icon name="arrow" /></span>
                <span className="stat-label">Rata-rata transaksi</span>
                <strong>{currency.format(transactions.length ? totalAmount / transactions.length : 0)}</strong>
                <span className="stat-note">Per transaksi sepanjang waktu</span>
              </article>
            </section>
          )}

          {(activePage === 'dashboard' || activePage === 'reports') && (
            <section className="content-grid">
              <SpendingChart transactions={thisMonthTransactions} />
              <section className="panel category-panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">PECAHAN PENGELUARAN</p><h2>Kategori teratas</h2></div>
                  <button className="text-button" type="button" onClick={() => setActivePage('categories')}>Lihat semua <Icon name="arrow" size={14} /></button>
                </div>
                {categories.length ? (
                  <div className="category-list">
                    {categories.slice(0, 4).map(([category, amount], index) => (
                      <div className="category-item" key={category}>
                        <span className={`transaction-icon category-${categoryIcon(category)}`}><Icon name={categoryIcon(category)} size={17} /></span>
                        <span className="category-name">{category}<small>{thisMonthTransactions.filter((item) => getCategory(item) === category).length} transaksi</small></span>
                        <span className="category-amount">{currency.format(amount)}<small>{monthTotal ? Math.round((amount / monthTotal) * 100) : 0}%</small></span>
                        <span className={`category-progress progress-${index}`}><i style={{ width: `${monthTotal ? (amount / monthTotal) * 100 : 0}%` }} /></span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="category-empty">Kategori akan muncul setelah kamu mencatat pengeluaran.</div>
                )}
              </section>
            </section>
          )}

          {activePage === 'categories' && (
            <section className="panel categories-page">
              <div className="panel-heading"><div><p className="eyebrow">BULAN INI</p><h2>Ringkasan per kategori</h2></div><span className="category-total">{currency.format(monthTotal)}</span></div>
              {categories.length ? (
                <div className="category-list category-list-large">
                  {categories.map(([category, amount], index) => (
                    <div className="category-item" key={category}>
                      <span className={`transaction-icon category-${categoryIcon(category)}`}><Icon name={categoryIcon(category)} size={17} /></span>
                      <span className="category-name">{category}<small>{thisMonthTransactions.filter((item) => getCategory(item) === category).length} transaksi</small></span>
                      <span className="category-amount">{currency.format(amount)}<small>{monthTotal ? Math.round((amount / monthTotal) * 100) : 0}%</small></span>
                      <span className={`category-progress progress-${index % 4}`}><i style={{ width: `${monthTotal ? (amount / monthTotal) * 100 : 0}%` }} /></span>
                    </div>
                  ))}
                </div>
              ) : <div className="category-empty">Belum ada pengeluaran untuk diringkas bulan ini.</div>}
            </section>
          )}

          {(activePage === 'dashboard' || activePage === 'transactions') && (
            <section className="panel transactions-panel">
              <div className="panel-heading">
                <div><p className="eyebrow">{activePage === 'dashboard' ? 'AKTIVITAS TERBARU' : 'RIWAYAT PENGELUARAN'}</p><h2>{activePage === 'dashboard' ? 'Transaksi terakhir' : 'Semua transaksi'}</h2></div>
                {activePage === 'dashboard' && <button className="text-button" type="button" onClick={() => setActivePage('transactions')}>Lihat semua <Icon name="arrow" size={14} /></button>}
              </div>
              <div className="transaction-table-head"><span>TRANSAKSI</span><span>TANGGAL</span><span>JUMLAH</span><span /></div>
              <TransactionRows
                transactions={(activePage === 'dashboard' ? filteredTransactions.slice(0, 5) : filteredTransactions)}
                onEdit={startEdit}
                onDelete={handleDelete}
                loading={loading}
              />
            </section>
          )}
        </div>
        <footer className="page-footer"><span>RuangDana</span><span>Kelola pengeluaran, satu catatan dalam satu waktu.</span></footer>
      </div>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm();
        }}>
          <section className="expense-modal" role="dialog" aria-modal="true" aria-labelledby="expense-form-title">
            <div className="modal-heading">
              <div><span className="modal-icon"><Icon name="receipt" size={19} /></span><div><p className="eyebrow">{editingId ? 'PERBARUI CATATAN' : 'CATATAN BARU'}</p><h2 id="expense-form-title">{editingId ? 'Edit pengeluaran' : 'Catat pengeluaran'}</h2></div></div>
              <button type="button" className="close-button" onClick={closeForm} aria-label="Tutup"><Icon name="close" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Nama pengeluaran</span>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Contoh: Makan siang" required autoFocus />
              </label>
              <label className="form-field">
                <span>Kategori</span>
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Pilih kategori</option>
                  {form.category && !['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya'].includes(form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                  <option value="Makanan & Minuman">Makanan & Minuman</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Belanja">Belanja</option>
                  <option value="Tagihan">Tagihan</option>
                  <option value="Hiburan">Hiburan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </label>
              <label className="form-field">
                <span>Jumlah pengeluaran</span>
                <div className="amount-input"><span>Rp</span><input name="price" value={form.price} onChange={handleChange} type="number" min="1" step="1" placeholder="0" required /></div>
              </label>
              {error && <div className="error-box modal-error" role="alert">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={closeForm}>Batal</button>
                <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Menyimpan...' : editingId ? 'Simpan perubahan' : 'Simpan transaksi'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
