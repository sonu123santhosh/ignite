import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/Button';
import Tag from '../components/Tag';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found | SportLink';
  }, []);

  return (
    <div className="py-20 sm:py-28 max-w-3xl mx-auto px-4 text-center">
      <Tag variant="amber" className="mb-4">404 Error</Tag>

      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white font-['Barlow_Condensed']">
        Out of Bounds &mdash; Page Not Found
      </h1>

      <p className="mt-3 text-base text-[#a3afc6] max-w-md mx-auto leading-relaxed">
        The play called doesn&apos;t exist. Return to the home page or browse one of our platform sections.
      </p>

      <div className="mt-8 flex justify-center">
        <Link to="/">
          <Button variant="primary" size="lg" className="gap-2">
            <Home className="w-4 h-4" />
            <span>Back to home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
