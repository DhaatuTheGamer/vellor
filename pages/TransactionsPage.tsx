import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../store';
import { Transaction, PaymentStatus } from '../types';
import { Button, Modal, Card, Icon, ConfirmationModal } from '../components/ui';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { TransactionListItem } from '../components/transactions/TransactionListItem';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Manages the display and manipulation of financial transactions.
 */
export const TransactionsPage: React.FC = () => {
  const { transactions, students, addTransaction, updateTransaction, deleteTransaction, settings, getStudentById } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState<Transaction | null>(null);
  const location = useLocation();
  
  type FilterType = 'all' | 'paid' | 'due' | 'partially-paid' | 'overpaid' | 'unpaid';
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
      if (location.state?.openAddTransactionModal) {
          setEditingTransaction(undefined);
          setShowForm(true);
      }
      if (location.state?.filter) {
        setActiveFilter(location.state.filter);
      }
  }, [location.state]);

  const handleSaveTransaction = (transactionData: Transaction) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteRequest = (transaction: Transaction) => {
    setConfirmingDelete(transaction);
  };
  
  const confirmDeletion = () => {
    if (confirmingDelete) {
      deleteTransaction(confirmingDelete.id);
      setConfirmingDelete(null);
    }
  };
  
  const sortedTransactions = useMemo(() => 
    [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [transactions]);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') {
        return sortedTransactions;
    }
    if (activeFilter === 'unpaid') {
        return sortedTransactions.filter(t => t.status === PaymentStatus.Due || t.status === PaymentStatus.PartiallyPaid);
    }
    const statusMap = {
        'paid': PaymentStatus.Paid,
        'due': PaymentStatus.Due,
        'partially-paid': PaymentStatus.PartiallyPaid,
        'overpaid': PaymentStatus.Overpaid,
    };
    const targetStatus = statusMap[activeFilter as keyof typeof statusMap];
    if (targetStatus) {
      return sortedTransactions.filter(t => t.status === targetStatus);
    }
    return sortedTransactions;
  }, [sortedTransactions, activeFilter]);

  const filterButtons: { label: string, filter: FilterType }[] = [
    { label: "All", filter: 'all' },
    { label: "Unpaid", filter: 'unpaid' },
    { label: "Paid", filter: 'paid' },
    { label: "Due", filter: 'due' },
    { label: "Partially Paid", filter: 'partially-paid' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
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
      className="space-y-6 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track lessons, payments, and outstanding balances.</p>
        </div>
        <Button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }} leftIcon="plus" className="w-full sm:w-auto rounded-full shadow-lg shadow-accent/20">Log Lesson</Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {filterButtons.map(({ label, filter }) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className="rounded-full"
          >
            {label}
          </Button>
        ))}
      </div>

      {transactions.length === 0 && !showForm ? (
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
           <Card className="text-center py-16 rounded-3xl border-0 shadow-sm bg-white dark:bg-primary-light">
            <div className="w-20 h-20 mx-auto bg-gray-50 dark:bg-primary rounded-full flex items-center justify-center mb-6">
              <Icon iconName="banknotes" className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-2 text-gray-900 dark:text-white">No Transactions Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Log your first lesson to start tracking your income and student payments.</p>
            <Button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }} leftIcon="plus" className="rounded-full">Log First Lesson</Button>
          </Card>
         </motion.div>
      ) : filteredTransactions.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="text-center py-12 rounded-3xl border-0 shadow-sm bg-white dark:bg-primary-light">
             <p className="text-gray-500 dark:text-gray-400">No transactions match the current filter.</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredTransactions.map(t => {
              const student = getStudentById(t.studentId);
              return (
                <motion.div key={t.id} variants={itemVariants} layout initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.9 }}>
                  <TransactionListItem
                    transaction={t}
                    studentName={student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteRequest}
                    currencySymbol={settings.currencySymbol}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} title={editingTransaction ? 'Edit Transaction' : 'Log New Lesson'}>
        <TransactionForm
          transaction={editingTransaction}
          students={students}
          onSave={handleSaveTransaction}
          onClose={() => { setShowForm(false); setEditingTransaction(undefined); }}
          currencySymbol={settings.currencySymbol}
        />
      </Modal>
      
      <ConfirmationModal
        isOpen={!!confirmingDelete}
        onClose={() => setConfirmingDelete(null)}
        onConfirm={confirmDeletion}
        title="Confirm Transaction Deletion"
        message={<span className="text-danger">Are you sure you want to delete this transaction? This action cannot be undone.</span>}
        confirmButtonText="Delete Transaction"
      />
    </motion.div>
  );
};