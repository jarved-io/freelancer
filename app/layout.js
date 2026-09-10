import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'SkillBridge Campus',
  description: 'A verified campus marketplace — hire fellow students for any service, or list your own.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
          <footer className="border-t border-line bg-bgsoft py-9 mt-16">
            <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between gap-4 text-sm text-inkfaint">
              <div>
                <strong className="text-ink text-base">SkillBridge Campus</strong>
                <div>A verified campus marketplace.</div>
              </div>
              <div>Any student. Any service. One campus.</div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
