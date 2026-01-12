import { NavbarSwitcher } from "@/components/navbar-switcher";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="min-h-screen bg-background">
          <NavbarSwitcher />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}