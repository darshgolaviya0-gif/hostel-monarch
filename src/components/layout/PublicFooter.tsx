import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { Logo } from './Logo';

export function PublicFooter() {
  return (
    <footer className="brand-gradient text-navy-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Link to="/" aria-label="Go to homepage">
              <Logo dark subtitle={false} />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-navy-300">
              Smart Living. Seamless Management. India's premium digital hostel operating system for students, parents and administrators.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: Globe, href: '/', label: 'Website home' },
                { Icon: MessageCircle, href: 'https://wa.me/919000012345', label: 'Chat on WhatsApp' },
                { Icon: Send, href: 'mailto:hello@hostelmonarch.in?subject=Enquiry', label: 'Send an email' },
                { Icon: Mail, href: 'mailto:hello@hostelmonarch.in', label: 'Email us' },
              ].map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold-400 hover:text-navy-950"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm text-navy-300">
              <li><Link to="/about" className="hover:text-gold-400">About Hostel Monarch</Link></li>
              <li><Link to="/facilities" className="hover:text-gold-400">Facilities</Link></li>
              <li><Link to="/rooms" className="hover:text-gold-400">Room Types</Link></li>
              <li><Link to="/services" className="hover:text-gold-400">Services</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Access Portal</p>
            <ul className="mt-4 space-y-2.5 text-sm text-navy-300">
              <li><Link to="/login?role=student" className="hover:text-gold-400">Student Login</Link></li>
              <li><Link to="/login?role=staff" className="hover:text-gold-400">Staff Login</Link></li>
              <li><Link to="/login?role=admin" className="hover:text-gold-400">Administration Login</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-navy-300">
              <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" /> Hostel Monarch Campus, Surat, Gujarat, India</li>
              <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0 text-gold-400" /> +91 90000 12345</li>
              <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-gold-400" /> hello@hostelmonarch.in</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-navy-400 sm:flex-row">
          <p>© 2026 Hostel Monarch. All rights reserved. A demo smart hostel management platform.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-gold-400">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold-400">Terms of Service</Link>
            <Link to="/refund-policy" className="hover:text-gold-400">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
