import { getCssText } from "@/app/styles/stitches.config";

export const metadata = {
  title: "HubCamp",
  description: "hubcamp.com.br",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <style
          id="stitches"
          dangerouslySetInnerHTML={{ __html: getCssText() }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
