/**
 * @file ConfirmationModal.tsx
 * Defines a specialized modal for confirming user actions.
 */

import React, { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button, ButtonProps } from './Button';
import { Icon } from './Icon';

/**
 * Props for the ConfirmationModal component.
 */
interface ConfirmationModalProps {
  /** Controls whether the modal is open or closed. */
  isOpen: boolean;
  /** Function to call when the modal should be closed. */
  onClose: () => void;
  /** Function to call when the confirmation action is triggered. */
  onConfirm: () => void;
  /** The title of the confirmation dialog. */
  title: string;
  /** The main message or question in the dialog. Can be a string or React node. */
  message: ReactNode;
  /** The text for the confirm button. Defaults to "Confirm". */
  confirmButtonText?: string;
  /** The variant/color of the confirm button. Defaults to 'danger'. */
  confirmButtonVariant?: ButtonProps['variant'];
}

/**
 * A specialized modal for confirming user actions, especially destructive ones like deletion.
 * It provides a consistent layout with a clear message and Confirm/Cancel buttons.
 *
 * @param {ConfirmationModalProps} props The properties for the confirmation modal.
 * @returns {React.ReactElement} A modal dialog pre-configured for confirmation scenarios.
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirm",
  confirmButtonVariant = 'danger',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidthClass="max-w-sm"
      footer={
        <div className="flex w-full gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-full">
            Cancel
          </Button>
          <Button variant={confirmButtonVariant} onClick={onConfirm} className="flex-1 rounded-full shadow-lg shadow-danger/20">
            {confirmButtonText}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-danger/10 mb-4">
            <Icon iconName="warning" className="h-8 w-8 text-danger" aria-hidden="true" />
        </div>
        <div className="mt-2">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {message}
            </p>
        </div>
      </div>
    </Modal>
  );
};
