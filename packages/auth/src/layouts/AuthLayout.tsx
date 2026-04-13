import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@workspace/ui';
import { CircleQuestionMark } from 'lucide-react';

export default function AuthLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-screen flex-col bg-background/90">
        <header className="w-full border-b border-border/60">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.3em]">
              <Image
                src="https://i.ibb.co/1fG2X5Gd/switchfj.png"
                alt="Switch Fiji"
                width={220}
                height={40}
              />
            </Link>
            <Button variant="transparent" className="w-fit">
              <CircleQuestionMark size={18} /> &nbsp;
              Help
            </Button>
          </div>
        </header>
        <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center px-6 py-6">
          {children}
        </main>
        <footer className="mt-auto">
          <p className="text-text-1 text-center py-[30px]">
            Copyright Switch Network 2026. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
