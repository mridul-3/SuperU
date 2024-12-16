import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className={'w-screen h-screen overflow-y-auto bg-slate-50'}>
          {children}
        </div>
      </body>
    </html>
  );
}
