import React from 'react';
import { Github, Linkedin, X } from 'lucide-react';
import { Button, Icon } from './ui';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface FooterProps {
  onGetStarted: () => void;
  scrollTo: (id: string) => void;
  setIsAdviceOpen: (open: boolean) => void;
  setIsPrivacyOpen: (open: boolean) => void;
  setIsTermsOpen: (open: boolean) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onGetStarted,
  scrollTo,
  setIsAdviceOpen,
  setIsPrivacyOpen,
  setIsTermsOpen,
}) => {
  return (
    <section data-pomelli-section="footer-cta" data-crawler-intent="conversion" className="py-24 px-4 text-center relative z-20 border-t border-gray-100 dark:border-white/5">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white tracking-tighter">Ready to take control?</h2>
        <Button onClick={onGetStarted} size="lg" className="rounded-full shadow-lg shadow-accent/20 py-4 px-10 text-lg mb-16">
           Manage Your Business Now
        </Button>

        {/* Actual Footer */}
        <footer className="mt-20 pt-16 pb-8 border-t border-gray-200/50 dark:border-white/5 max-w-6xl mx-auto text-left">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <img src="/logo.png" alt="Vellor" className="w-10 h-10 object-contain dark:bg-white/90 dark:rounded-xl dark:p-1" />
                        <span className="font-bold text-gray-900 dark:text-white text-xl">Vellor</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs">
                        The powerful, offline-first operating system designed exclusively for independent tutors.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="https://x.com/dhaatrik" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><XIcon className="w-5 h-5" /></a>
                        <a href="https://www.linkedin.com/in/dhaatrik-chowdhury" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors"><Linkedin className="w-5 h-5" /></a>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Product</h4>
                    <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                        <li><button onClick={() => scrollTo('features')} className="hover:text-accent transition-colors">Features</button></li>
                        <li><button onClick={() => {}} className="hover:text-accent transition-colors">Download PWA</button></li>
                        <li><a href="https://github.com/DhaatuTheGamer/vellor/releases" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Changelog (v4.0)</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Resources</h4>
                    <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                        <li><a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Developer API</a></li>
                        <li><button onClick={() => setIsAdviceOpen(true)} className="hover:text-accent transition-colors">Friendly Tutor Advice</button></li>
                        <li><a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Open Source</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
                    <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                        <li><button onClick={() => setIsPrivacyOpen(true)} className="hover:text-accent transition-colors">Privacy Policy</button></li>
                        <li><button onClick={() => setIsTermsOpen(true)} className="hover:text-accent transition-colors">Terms of Service</button></li>
                    </ul>
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 dark:text-gray-500">
                <p className="flex items-center gap-2"><img src="/logo.png" alt="Vellor" className="w-6 h-6 object-contain rounded dark:bg-white/90 dark:p-0.5" style={{ filter: 'grayscale(1) opacity(0.5)' }} />&copy; {new Date().getFullYear()} Vellor. All rights reserved.</p>
                <p className="mt-2 md:mt-0 flex items-center gap-1">Built with <Icon iconName="heart" className="w-4 h-4 text-red-500" /> for educators.</p>
            </div>
        </footer>
    </section>
  );
};
