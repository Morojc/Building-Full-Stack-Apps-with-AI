import dynamic from 'next/dynamic';
import { Smile } from 'lucide-react';

const EmojiGenerator = dynamic(() => import('@/components/emoji-generator'), { ssr: false });

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex items-center gap-2">
        <Smile className="w-10 h-10 text-yellow-400" />
        <h1 className="text-3xl font-bold">EMOJI MAKER</h1>
      </header>
      <main className="w-full max-w-3xl">
        <EmojiGenerator />
      </main>
    </div>
  );
}
