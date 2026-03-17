import React, { useState, useEffect } from 'react';
import { useData } from '../../store';
import { Transaction, Student, TransactionFormData, PaymentStatus } from '../../types';
import { Button, Input, Select, Textarea, Icon } from '../ui';

/**
 * Props for the TransactionForm component.
 */
interface TransactionFormProps {
  /** Optional transaction data to pre-fill for editing. */
  transaction?: Transaction;
  /** List of all students to populate the student selection dropdown. */
  students: Student[];
  /** Optional default student ID to pre-select in the form. */
  defaultStudentId?: string;
  /** Callback when the form is submitted with valid transaction data. */
  onSave: (transactionData: Transaction) => void;
  /** Callback to close the form/modal. */
  onClose: () => void;
  /** Current currency symbol. */
  currencySymbol: string;
}
/**
 * A form for logging a new lesson/payment or editing an existing transaction.
 */
export const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, students, defaultStudentId, onSave, onClose, currencySymbol }) => {
  const { getStudentById } = useData();
  
  const initialFormState: TransactionFormData = {
    studentId: defaultStudentId || (students.length > 0 ? students[0].id : ''),
    date: new Date().toISOString().split('T')[0],
    lessonDuration: 60,
    lessonFee: 0,
    amountPaid: 0,
    paymentMethod: '',
    notes: '',
  };
  const [formData, setFormData] = useState<TransactionFormData>(initialFormState);

  useEffect(() => {
    if (transaction) {
      setFormData({
        studentId: transaction.studentId,
        date: transaction.date.split('T')[0],
        lessonDuration: transaction.lessonDuration,
        lessonFee: transaction.lessonFee,
        amountPaid: transaction.amountPaid,
        paymentMethod: transaction.paymentMethod || '',
        notes: transaction.notes || '',
      });
    } else {
        let fee = 0;
        let duration = 60;
        if(defaultStudentId) {
            const student = getStudentById(defaultStudentId);
            if(student) {
                duration = student.tuition.typicalLessonDuration;
                if(student.tuition.rateType === 'per_lesson' || student.tuition.rateType === 'monthly'){
                    fee = student.tuition.defaultRate;
                    if(student.tuition.rateType === 'monthly') duration = 1;
                } else {
                    fee = student.tuition.defaultRate * (duration / 60);
                }
            }
        }
      setFormData(prev => ({...prev, studentId: defaultStudentId || prev.studentId, lessonFee: fee, lessonDuration: duration, amountPaid: fee}));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction, defaultStudentId, students]); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: name === 'lessonDuration' || name === 'lessonFee' || name === 'amountPaid' ? parseFloat(value) || 0 : value };
    
    if (name === 'studentId' && newFormData.studentId) {
        const student = getStudentById(newFormData.studentId);
        if (student) {
            newFormData.lessonDuration = student.tuition.typicalLessonDuration;
            if (student.tuition.rateType === 'hourly') {
                newFormData.lessonFee = student.tuition.defaultRate * (newFormData.lessonDuration / 60);
            } else if (student.tuition.rateType === 'per_lesson' || student.tuition.rateType === 'monthly') {
                newFormData.lessonFee = student.tuition.defaultRate;
                if (student.tuition.rateType === 'monthly') newFormData.lessonDuration = 1;
            }
            newFormData.amountPaid = newFormData.lessonFee;
        }
    } else if (name === 'lessonDuration' && newFormData.studentId) {
        const student = getStudentById(newFormData.studentId);
        if (student) {
            if (student.tuition.rateType === 'hourly') {
                newFormData.lessonFee = student.tuition.defaultRate * (newFormData.lessonDuration / 60);
            } else if (student.tuition.rateType === 'per_lesson' || student.tuition.rateType === 'monthly') {
                newFormData.lessonFee = student.tuition.defaultRate;
            }
        }
    }
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      alert("Please select a student.");
      return;
    }
    const transactionToSave: Transaction = {
      id: transaction?.id || crypto.randomUUID(),
      createdAt: transaction?.createdAt || new Date().toISOString(),
      ...formData,
      status: PaymentStatus.Due, 
    };
    onSave(transactionToSave);
  };

  const studentOptions = students.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="identification" className="w-4 h-4" />
            Lesson Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Student" name="studentId" value={formData.studentId} onChange={handleChange} options={studentOptions} required placeholder="Select a student" />
            <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
          </div>
          <Input 
            label="Lesson Duration (minutes) / Reference" 
            name="lessonDuration" 
            type="number" 
            value={formData.lessonDuration} 
            onChange={handleChange} 
            required 
            min="0" 
            helperText={getStudentById(formData.studentId)?.tuition.rateType === 'monthly' ? 'e.g., 1 for 1 month' : 'e.g., 60 for 60 minutes'}
          />
        </div>

        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="banknotes" className="w-4 h-4" />
            Payment Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label={`Lesson Fee (${currencySymbol})`} 
              name="lessonFee" 
              type="number" 
              value={formData.lessonFee} 
              onChange={handleChange} 
              required 
              min="0" 
              step="0.01" 
              disabled={getStudentById(formData.studentId)?.tuition.rateType === 'monthly' || getStudentById(formData.studentId)?.tuition.rateType === 'per_lesson'} 
            />
            <Input label={`Amount Paid (${currencySymbol})`} name="amountPaid" type="number" value={formData.amountPaid} onChange={handleChange} required min="0" step="0.01" />
          </div>
          <Input label="Payment Method" name="paymentMethod" value={formData.paymentMethod || ''} onChange={handleChange} placeholder="e.g. Cash, Bank Transfer" />
        </div>

        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="document-text" className="w-4 h-4" />
            Additional Notes
          </h4>
          <Textarea label="Notes" name="notes" value={formData.notes || ''} onChange={handleChange} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/10">
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-full px-6">Cancel</Button>
        <Button type="submit" variant="primary" className="rounded-full px-8 shadow-lg shadow-accent/20">
          {transaction ? 'Save Changes' : 'Log Lesson'}
        </Button>
      </div>
    </form>
  );
};