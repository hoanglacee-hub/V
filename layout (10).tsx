import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chấm Công Việc Nhà 🏠",
  description: "Quản lý việc nhà cho 4 bạn ở ghép",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Việc Nhà",
  },
};

export default function ChamCongLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/cham-cong" className="flex items-center gap-2.5">
            <span className="text-2xl">🏠</span>
            <h1 className="text-lg font-bold text-white">Việc Nhà</h1>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink href="/cham-cong" emoji="📋" label="Bảng công" />
            <NavLink href="/cham-cong/cong-viec" emoji="✏️" label="Công việc" />
            <NavLink href="/cham-cong/thanh-vien" emoji="👥" label="Thành viên" />
            <NavLink href="/cham-cong/lich-su" emoji="📊" label="Lịch sử" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  emoji,
  label,
}: {
  href: string;
  emoji: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
    >
      <span>{emoji}</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
