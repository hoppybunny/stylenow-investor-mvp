import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="fashion-container py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-neutral-600">
              © 2025 Styled By Clara. All rights reserved.
            </span>
          </div>
          
          {/* Uncomment if you want to add navigation links */}
          {/* <nav className="flex items-center space-x-6">
            <Link 
              href="/privacy" 
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Terms of Service
            </Link>
          </nav> */}
        </div>
      </div>
    </footer>
  );
}
