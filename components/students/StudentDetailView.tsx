import React, { useMemo } from 'react';
import { Student, Transaction, PaymentStatus } from '../../types';
import { Button, Card, Icon } from '../ui';
import { formatCurrency, formatDate, formatPhoneNumber } from '../../helpers';
import { TransactionStatusBadge } from '../transactions/TransactionStatusBadge';
import { motion } from 'framer-motion';

/**
 * Props for the StudentDetailView component.
 */
interface StudentDetailViewProps {
  /** The student whose details are to be displayed. */
  student: Student;
  /** Callback to close the detail view. */
  onClose: () => void;
  /** Callback to initiate editing this student. */
  onEdit: (student:Student) => void;
  /** Callback to open the log payment form for this student. */
  onLogPayment: (studentId: string) => void;
  /** Array of all transactions, used to filter for this student. */
  transactions: Transaction[];
  /** Current currency symbol. */
  currencySymbol: string;
}
// Helper to generate a consistent gradient based on a string
const getGradient = (name: string) => {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-fuchsia-500 to-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Displays a comprehensive, detailed view of a single student.
 * This view includes contact information, tuition details, notes, and a full
 * transaction history, along with actions to edit the profile or log a new payment.
 */
export const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student, onClose, onEdit, onLogPayment, transactions, currencySymbol }) => {
  // Filter and sort transactions for the current student
  const studentTransactions = transactions
    .filter(t => t.studentId === student.id)
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
  
  // Calculate total owed and total paid for this student
  const totalOwed = studentTransactions.reduce((sum, t) => {
    if (t.status === PaymentStatus.Due) return sum + t.lessonFee;
    if (t.status === PaymentStatus.PartiallyPaid) return sum + (t.lessonFee - t.amountPaid);
    return sum;
  }, 0);
  const totalPaidForStudent = studentTransactions.reduce((sum, t) => sum + t.amountPaid, 0);

  const gradientClass = useMemo(() => getGradient(student.firstName + student.lastName), [student.firstName, student.lastName]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Student Header: Avatar, Name, Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-black/5 border border-white/20 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0 border-4 border-white dark:border-primary shadow-lg`}>
                <span className="text-3xl font-display font-bold text-white shadow-sm">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </span>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">{student.firstName} {student.lastName}</h2>
              {student.parent && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-primary text-sm text-gray-600 dark:text-gray-300">
                  <Icon iconName="users" className="w-3.5 h-3.5" />
                  {student.parent.name} <span className="opacity-60">({student.parent.relationship})</span>
                </div>
              )}
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full sm:w-auto">
          <Button onClick={() => onEdit(student)} leftIcon="pencil" variant="outline" className="w-full sm:w-auto rounded-full">Edit Profile</Button>
          <Button onClick={() => onLogPayment(student.id)} leftIcon="plus" variant="primary" className="w-full sm:w-auto rounded-full shadow-lg shadow-accent/20">Log Lesson</Button>
        </div>
      </motion.div>

      {/* Contact and Tuition Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-gray-50 dark:bg-primary/50 border-gray-100 dark:border-white/5">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icon iconName="identification" className="w-4 h-4" />
              Contact Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon iconName="phone" className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Student Phone</p>
                  <p className="text-gray-900 dark:text-white font-medium">{formatPhoneNumber(student.contact.studentPhone)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon iconName="users" className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Parent Phones</p>
                  <p className="text-gray-900 dark:text-white font-medium">{formatPhoneNumber(student.contact.parentPhone1)}</p>
                  {student.contact.parentPhone2?.number && (
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{formatPhoneNumber(student.contact.parentPhone2)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon iconName="envelope" className="w-4 h-4 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium truncate">{student.contact.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full bg-gray-50 dark:bg-primary/50 border-gray-100 dark:border-white/5">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icon iconName="academic-cap" className="w-4 h-4" />
              Tuition Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon iconName="book-open" className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Subjects</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {student.tuition.subjects.length > 0 ? student.tuition.subjects.map((subject, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white dark:bg-primary-light border border-gray-200 dark:border-white/10 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300">
                        {subject}
                      </span>
                    )) : <span className="text-gray-500 dark:text-gray-400">N/A</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon iconName="banknotes" className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Rate & Duration</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(student.tuition.defaultRate, currencySymbol)} <span className="text-gray-500 font-normal">({student.tuition.rateType})</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {student.tuition.typicalLessonDuration} {student.tuition.rateType === 'hourly' ? 'mins' : 'sessions'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon iconName="credit-card" className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Preferred Payment</p>
                  <p className="text-gray-900 dark:text-white font-medium">{student.tuition.preferredPaymentMethod || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      
      {/* Notes Card (if notes exist) */}
      {student.notes && (
          <motion.div variants={itemVariants}>
            <Card className="bg-accent/5 border-accent/10">
              <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-2">
                <Icon iconName="document-text" className="w-4 h-4" />
                Notes
              </h3>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{student.notes}</p>
            </Card>
          </motion.div>
      )}

      {/* Lesson & Payment History Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-gray-100 dark:border-white/5">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon iconName="clock" className="w-5 h-5 text-gray-400" />
                History
              </h3>
              <div className="flex flex-wrap gap-4 bg-gray-50 dark:bg-primary/50 p-3 rounded-2xl w-full sm:w-auto">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Total Paid</p>
                  <p className="font-mono font-bold text-success">{formatCurrency(totalPaidForStudent, currencySymbol)}</p>
                </div>
                <div className="w-px bg-gray-200 dark:bg-white/10"></div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Outstanding</p>
                  <p className={`font-mono font-bold ${totalOwed > 0 ? 'text-danger' : 'text-gray-900 dark:text-white'}`}>{formatCurrency(totalOwed, currencySymbol)}</p>
                </div>
              </div>
           </div>

          {studentTransactions.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {studentTransactions.map(t => (
                <div key={t.id} className="p-4 bg-gray-50 dark:bg-primary/30 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-primary-light flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <Icon iconName="calendar" className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(t.date)}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1"><Icon iconName="banknotes" className="w-3.5 h-3.5" /> Fee: {formatCurrency(t.lessonFee, currencySymbol)}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                          <span>Paid: <span className={t.amountPaid > 0 ? 'text-success font-medium' : ''}>{formatCurrency(t.amountPaid, currencySymbol)}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="self-start sm:self-center">
                      <TransactionStatusBadge status={t.status} />
                    </div>
                  </div>
                  {t.notes && (
                    <div className="mt-3 ml-13 p-2.5 bg-white dark:bg-primary-light rounded-xl text-sm text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Note:</span> {t.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-primary/30 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
              <div className="w-16 h-16 mx-auto bg-white dark:bg-primary-light rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Icon iconName="document-text" className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions logged yet.</p>
              <Button onClick={() => onLogPayment(student.id)} variant="ghost" size="sm" className="mt-4 text-accent">Log their first lesson</Button>
            </div>
          )}
        </Card>
      </motion.div>
      
      {/* Back Button */}
      <motion.div variants={itemVariants} className="flex justify-start pt-2">
          <Button onClick={onClose} variant="ghost" leftIcon="arrow-left" className="rounded-full hover:bg-gray-100 dark:hover:bg-primary-light">Back to Students</Button>
      </motion.div>
    </motion.div>
  );
};