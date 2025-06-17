import Link from 'next/link';
import { Twitter, Youtube, Tv, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">关于 `江夫人_KWKmia`</h3>
            <p className="text-sm text-muted-foreground">
              熟女年上，混沌的灵魂千娇百媚～｜音声演绎
            </p>
            <p className="text-sm text-muted-foreground">
              虚拟UP主｜虚拟猫猫学院猫德教师
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">贵客可能想看</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about">关于我（施工中...）</Link>
              </li>
              <li>
                <Link href="/contact">售后咨询（施工中...）</Link>
              </li>
              <li>
                <Link href="/support">常见问题（施工中...）</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">还能在这里找到妾身</h3>
            <div className="flex space-x-4">
              <a
                href="https://space.bilibili.com/3493075143887555"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                <Tv className="h-5 w-5" />
              </a>
              <a
                href="mailto:judymike2025@outlook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} 江夫人_KWKmia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}