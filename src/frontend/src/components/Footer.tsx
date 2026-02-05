import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-6 px-4">
        <div className="text-center text-sm text-muted-foreground">
          © 2025. Built with{' '}
          <Heart className="inline w-4 h-4 text-red-500 fill-red-500" /> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
