import React from "react";

export const metadata = {
  title: "HubCamp",
  description: "hubcamp.com.br",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
