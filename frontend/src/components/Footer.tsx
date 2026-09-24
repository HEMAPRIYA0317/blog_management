'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          © {new Date().getFullYear()} <strong>BlogVerse</strong> — Crafted with passion
        </div>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/blogs">Explore</Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
