import { roboto } from "@/app/styles/fonts";
import { getCssText } from "@/app/styles/stitches.config";
import { globalStyles } from "./styles/global";

export const metadata = {
  title: "HubCamp",
  description: "hubcamp.com.br",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  globalStyles();
  return (
    <html lang="pt-br">
      <head>
        <style
          id="stitches"
          dangerouslySetInnerHTML={{ __html: getCssText() }}
        />
      </head>
      <body className={`${roboto.className} antialiased`}>{children}</body>
    </html>
  );
}
