import React, { useState } from 'react';
import { Button, Modal, Icon, Select } from '../ui';
import { useStore } from '../../store';
import { Student, PaymentStatus, Transaction } from '../../types';
import { parseCSV, bulkMapCSVRows, ImportMapping, ImportResult } from '../../helpers/csvParser';
import { findConflicts, resolveConflict, ConflictStrategy } from '../../helpers/conflictResolution';

interface CSVImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UploadStepProps {
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ handleFileUpload }) => (
    <div className="text-center py-8">
       <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-primary-light rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/10">
          <Icon iconName="document-text" className="w-8 h-8 text-accent" />
       </div>
       <h3 className="text-xl font-display font-bold mb-2 text-gray-900 dark:text-white">Upload CSV File</h3>
       <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Upload a CSV file containing your student roster to bulk import them into Vellor.</p>

       <label className="bg-accent text-white px-8 py-3.5 rounded-full cursor-pointer hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 font-bold inline-block">
           Choose CSV File
           <input type="file" accept=".csv" className="hidden" onClick={(e) => (e.target as HTMLInputElement).value = ''} onChange={handleFileUpload} />
       </label>

       <div className="mt-8 p-4 bg-gray-50 dark:bg-primary/30 rounded-2xl text-left border border-gray-100 dark:border-white/5 text-sm">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Supported Columns (Auto-mapped):</p>
          <ul className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
             <li className="flex items-center gap-1.5"><Icon iconName="check-circle" className="w-3.5 h-3.5 text-success" /> Student Info</li>
             <li className="flex items-center gap-1.5"><Icon iconName="check-circle" className="w-3.5 h-3.5 text-success" /> Guardian Details</li>
             <li className="flex items-center gap-1.5"><Icon iconName="check-circle" className="w-3.5 h-3.5 text-success" /> Payments</li>
             <li className="flex items-center gap-1.5"><Icon iconName="check-circle" className="w-3.5 h-3.5 text-success" /> Lesson History</li>
          </ul>
       </div>
    </div>
);

interface MappingStepProps {
    csvDataLength: number;
    mapping: ImportMapping;
    setMapping: (mapping: ImportMapping) => void;
    originalHeaders: string[];
    setStep: (step: number) => void;
    handleImport: () => void;
}

const MappingStep: React.FC<MappingStepProps> = ({
    csvDataLength,
    mapping,
    setMapping,
    originalHeaders,
    setStep,
    handleImport
}) => {
    const [activeCategory, setActiveCategory] = useState<'student' | 'guardian' | 'financial'>('student');

    const categories = [
        { id: 'student', label: 'Student Info', icon: 'user' },
        { id: 'guardian', label: 'Guardian', icon: 'users' },
        { id: 'financial', label: 'Payments & Lessons', icon: 'currency-dollar' }
    ];

    const fieldsByCategory = {
        student: [
            { field: 'firstName', label: 'First Name (Required)' },
            { field: 'lastName', label: 'Last Name' },
            { field: 'email', label: 'Email Address' },
            { field: 'studentPhone', label: 'Phone Number' },
            { field: 'notes', label: 'Bio/Notes' },
            { field: 'subjects', label: 'Subjects' }
        ],
        guardian: [
            { field: 'guardianName', label: 'Guardian Name' },
            { field: 'guardianEmail', label: 'Guardian Email' },
            { field: 'guardianPhone', label: 'Guardian Phone' }
        ],
        financial: [
            { field: 'defaultRate', label: 'Default Rate' },
            { field: 'paymentAmount', label: 'Payment Amount' },
            { field: 'paymentDate', label: 'Payment Date' },
            { field: 'lessonDate', label: 'Lesson Date' },
            { field: 'lessonDuration', label: 'Lesson Duration (min)' }
        ]
    };

    return (
        <div className="space-y-6">
            <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl text-accent font-medium text-sm">
                Found {csvDataLength} records. Let's map your columns to Vellor fields.
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-primary/50 rounded-xl">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                            activeCategory === cat.id 
                                ? 'bg-white dark:bg-primary-light text-accent shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <Icon iconName={cat.icon as any} className="w-4 h-4" />
                        <span className="hidden sm:inline">{cat.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-gray-50 dark:bg-primary/50 p-5 rounded-3xl space-y-4 border border-gray-100 dark:border-white/5 max-h-[40vh] overflow-y-auto custom-scrollbar">
                {fieldsByCategory[activeCategory].map(({field, label}) => (
                   <div key={field} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-primary-light rounded-xl border border-gray-200 dark:border-white/10">
                       <span className="text-sm font-bold text-gray-700 dark:text-gray-300 sm:w-1/3 truncate">{label}</span>
                       <div className="sm:w-2/3">
                           <Select
                             value={(mapping as any)[field] || ''}
                             onChange={e => setMapping({...mapping, [field]: e.target.value})}
                             options={[{label: '-- Skip Field --', value: ''}, ...originalHeaders.map(h => ({label: h, value: h}))]}
                           />
                       </div>
                   </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/10">
                <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">Back</Button>
                <Button variant="primary" onClick={handleImport} className="rounded-full px-6 shadow-lg shadow-accent/20 font-bold">Import Data</Button>
            </div>
        </div>
    );
};

export const CSVImportWizard: React.FC<CSVImportWizardProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<number>(1);
    const [originalHeaders, setOriginalHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
    const [mapping, setMapping] = useState<ImportMapping>({ firstName: '' });
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    
    const students = useStore(s => s.students);
    const addStudent = useStore(s => s.addStudent);
    const updateStudent = useStore(s => s.updateStudent);
    const addTransaction = useStore(s => s.addTransaction);
    const addToast = useStore(s => s.addToast);
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
             const text = event.target?.result as string;
             const data = parseCSV(text);
             if (data.length === 0) { 
                 addToast("Invalid CSV format or not enough data rows.", "error"); 
                 return; 
             }
             
             const headers = Object.keys(data[0]);
             setOriginalHeaders(headers);
             setCsvData(data);
             
             // Enhanced Auto-Map logic
             const newMap: any = {};
             headers.forEach(h => {
                 const hl = h.toLowerCase();
                 if (!newMap.firstName && (hl === 'first name' || hl === 'name' || hl === 'firstname')) newMap.firstName = h;
                 if (!newMap.lastName && (hl === 'last name' || hl === 'lastname')) newMap.lastName = h;
                 if (!newMap.email && hl.includes('email')) newMap.email = h;
                 if (!newMap.studentPhone && (hl.includes('phone') || hl.includes('mobile'))) newMap.studentPhone = h;
                 if (!newMap.defaultRate && (hl.includes('rate') || hl.includes('price') || hl.includes('fee') || hl.includes('$/hr'))) newMap.defaultRate = h;
                 if (!newMap.subjects && (hl.includes('subject') || hl.includes('topic'))) newMap.subjects = h;
                 if (!newMap.guardianName && (hl.includes('parent') || hl.includes('guardian'))) newMap.guardianName = h;
                 if (!newMap.paymentAmount && (hl.includes('paid') || hl.includes('amount'))) newMap.paymentAmount = h;
             });
             setMapping(newMap);
             setStep(2);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        const result = bulkMapCSVRows(csvData, mapping);
        
        for (const entities of result.entities) {
            let studentId = '';
            const conflicts = findConflicts(entities.student, students);
            
            if (conflicts.length > 0) {
                // For bulk import without a per-conflict UI yet, we default to "Overwrite" to update existing records
                // In a future phase, we can add the "Prompt per Conflict" UI
                const resolved = resolveConflict(entities.student, conflicts[0].existing, ConflictStrategy.Overwrite);
                if (resolved) {
                    updateStudent(resolved.id, resolved);
                    studentId = resolved.id;
                }
            } else {
                const newStudent = addStudent(entities.student as any);
                studentId = newStudent.id;
            }

            if (studentId) {
                if (entities.payment) {
                    addTransaction({
                        studentId,
                        amountPaid: entities.payment.amount,
                        lessonFee: entities.payment.amount, // Assume it covers the full fee if imported this way
                        date: entities.payment.date,
                        status: PaymentStatus.Paid,
                        paymentMethod: 'Other',
                        notes: 'Imported via CSV'
                    } as any);
                }
                if (entities.lesson && !entities.payment) {
                    addTransaction({
                        studentId,
                        amountPaid: 0,
                        lessonFee: entities.student.tuition?.defaultRate || 0,
                        date: entities.lesson.date,
                        status: PaymentStatus.Due,
                        paymentMethod: '',
                        notes: 'Imported via CSV'
                    } as any);
                }
            }
        }
        
        setImportResult(result);
        setStep(3);
        addToast(`Successfully processed ${result.successCount} rows.`, 'success');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Data (CSV)">
            {step === 1 && <UploadStep handleFileUpload={handleFileUpload} />}
            
            {step === 2 && (
                <MappingStep
                    csvDataLength={csvData.length}
                    mapping={mapping}
                    setMapping={setMapping}
                    originalHeaders={originalHeaders}
                    setStep={setStep}
                    handleImport={handleImport}
                />
            )}

            {step === 3 && importResult && (
                <div className="space-y-6">
                    <div className="flex items-center justify-center py-4">
                        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                            <Icon iconName="check-circle" className="w-10 h-10 text-success" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Import Complete</h3>
                        <p className="text-gray-500 dark:text-gray-400">Successfully imported {importResult.successCount} records.</p>
                    </div>
                    
                    {importResult.errorCount > 0 && (
                        <div className="bg-danger/10 border border-danger/20 p-4 rounded-2xl">
                            <p className="text-danger font-bold text-sm mb-2">Errors encountered in {importResult.errorCount} rows:</p>
                            <div className="max-h-32 overflow-y-auto text-xs text-danger/80 space-y-1 custom-scrollbar">
                                {importResult.errors.map((err, i) => (
                                    <div key={i}>Row {err.row}: {err.error}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button variant="primary" onClick={onClose} className="w-full rounded-full py-4 font-bold shadow-lg shadow-accent/20">Done</Button>
                </div>
            )}
        </Modal>
    );
};
