import './globals.css';

export const metadata = {
  title: 'Bellavista Golf — Apuestas',
  description: 'La app de apuestas del Club de Golf Bellavista',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
