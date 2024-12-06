export const metadata = {
  title: "Hubcamp",
  description: "Learning Technology",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
