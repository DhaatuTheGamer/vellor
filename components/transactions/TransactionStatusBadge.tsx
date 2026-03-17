import React from 'react';
import { PaymentStatus } from '../../types';
import { Badge } from '../ui';
import { getPaymentStatusColor } from '../../helpers';

/**
 * A component that displays a transaction's payment status using a colored `Badge`.
 */
export const TransactionStatusBadge: React.FC<{status: PaymentStatus}> = ({status}) => {
    return <Badge text={status} color={getPaymentStatusColor(status)} />;
};