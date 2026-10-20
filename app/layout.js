import './globals.css';

export const metadata = {
  title: 'RuangDana — Catatan Pengeluaran',
  description: 'Catat dan pantau pengeluaran harianmu dengan RuangDana.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
