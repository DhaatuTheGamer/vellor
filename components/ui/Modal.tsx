/**
 * @file Modal.tsx
 * Defines the Modal component for dialogs and pop-ups.
 */

import React, { ReactNode, useEffect } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Props for the Modal component.
 */
interface ModalProps {
  /** Controls whether the modal is open or closed. */
  isOpen: boolean;
  /** Function to call when the modal should be closed (e.g., by clicking overlay or close button). */
  onClose: () => void;
  /** Optional title for the modal header. */
  title?: string;
  /** Content to be displayed within the modal body. */
  children: ReactNode;
  /** Optional footer content, typically for action buttons. */
  footer?: ReactNode;
  /** Optional max width class for the modal panel. */
  maxWidthClass?: string;
}
/**
 * A modal dialog component for displaying content in a layer above the main page.
 * It includes an overlay, a close button, and optional header and footer sections.
 * The modal's visibility is controlled by the `isOpen` prop.
 *
 * @param {ModalProps} props - The properties for the Modal component.
 * @returns {React.ReactElement | null} The modal element if `isOpen` is true, otherwise null.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidthClass = "max-w-md" }) => {
  
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        // Overlay covering the entire screen
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby={title ? "modal-title" : undefined}>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`bg-white dark:bg-primary rounded-[2rem] shadow-2xl w-full ${maxWidthClass} flex flex-col max-h-[90vh] relative z-10 border border-gray-100 dark:border-white/10 overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 sm:px-8 sm:pt-8 sm:pb-6 border-b border-gray-100 dark:border-white/5 flex-shrink-0 bg-gray-50/50 dark:bg-primary-light/20">
              {title && <h3 id="modal-title" className="text-xl sm:text-2xl font-display font-bold text-gray-900 dark:text-white leading-tight">{title}</h3>}
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal" className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400">
                <Icon iconName="x-mark" className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body - Scrollable area for content */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-grow custom-scrollbar">
              {children}
            </div>

            {/* Modal Footer (optional) */}
            {footer && (
              <div className="p-6 sm:px-8 sm:pb-8 sm:pt-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 flex-shrink-0 bg-gray-50/50 dark:bg-primary-light/20">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};