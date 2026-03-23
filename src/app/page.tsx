import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nextjs Template',
  description: 'Nextjs template boilerplate.'
};
export default function Home() {
  return <main className="w-full">NextJS Template.</main>;
}
