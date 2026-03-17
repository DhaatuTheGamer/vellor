

import React, { useState, useEffect } from 'react';
import { Student, StudentFormData, PhoneNumber } from '../../types';
import { Button, Input, Select, Textarea, PhoneInput, Icon } from '../ui';
import { COUNTRIES } from '../../constants';

/**
 * Props for the StudentForm component.
 */
interface StudentFormProps {
  /** Optional student data to pre-fill the form for editing. */
  student?: Student;
  /** Callback function when the form is submitted with valid student data. */
  onSave: (studentData: Student) => void;
  /** Callback function to close the form/modal. */
  onClose: () => void;
}
/**
 * A form for adding a new student or editing an existing one.
 */
export const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onClose }) => {
  const initialFormState: StudentFormData = {
    firstName: '', lastName: '',
    country: 'United States',
    parent: { name: '', relationship: 'Parent' },
    contact: { 
      studentPhone: { countryCode: '+1', number: '' },
      parentPhone1: { countryCode: '+1', number: '' },
      parentPhone2: { countryCode: '+1', number: '' },
      email: '' 
    },
    tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60, preferredPaymentMethod: '' },
    notes: '',
  };
  // Let TypeScript infer the state type from the initial state object.
  // This provides a stricter type where contact phone numbers are always defined,
  // removing the need for non-null assertions.
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        country: student.country || 'United States',
        parent: student.parent || { name: '', relationship: 'Parent' },
        contact: {
          email: student.contact.email || '',
          studentPhone: student.contact.studentPhone || { countryCode: '+1', number: '' },
          parentPhone1: student.contact.parentPhone1 || { countryCode: '+1', number: '' },
          parentPhone2: student.contact.parentPhone2 || { countryCode: '+1', number: '' },
        },
        tuition: student.tuition,
        notes: student.notes || '',
      });
    } else {
      setFormData(initialFormState);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [field, subField] = name.split('.');

    if (subField) {
      setFormData(prev => ({
        ...prev,
        [field]: { ...(prev as any)[field], [subField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handlePhoneChange = (name: string, value: PhoneNumber) => {
    const [field, subField] = name.split('.'); // field: 'contact', subField: 'studentPhone'
    setFormData(prev => ({
        ...prev,
        [field]: {
            ...(prev as any)[field],
            [subField]: value
        }
    }));
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryName = e.target.value;
    const selectedCountry = COUNTRIES.find(c => c.name === countryName);
    const newCountryCode = selectedCountry ? selectedCountry.code : '+1';

    setFormData(prev => ({
      ...prev,
      country: countryName,
      contact: {
        ...prev.contact,
        studentPhone: { countryCode: newCountryCode, number: prev.contact.studentPhone?.number ?? '' },
        parentPhone1: { countryCode: newCountryCode, number: prev.contact.parentPhone1?.number ?? '' },
        parentPhone2: { countryCode: newCountryCode, number: prev.contact.parentPhone2?.number ?? '' },
      }
    }));
  };

  const handleTuitionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name.replace('tuition.', '');
    setFormData(prev => ({
        ...prev,
        tuition: {
            ...prev.tuition,
            [fieldName]: fieldName === 'defaultRate' || fieldName === 'typicalLessonDuration' ? parseFloat(value) || 0 : value,
        }
    }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
        ...prev,
        tuition: {
            ...prev.tuition,
            subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s),
        }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentToSave: Student = {
      id: student?.id || crypto.randomUUID(),
      createdAt: student?.createdAt || new Date().toISOString(),
      ...formData,
    };
    onSave(studentToSave);
  };

  const countryOptions = COUNTRIES.map(c => ({ value: c.name, label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="identification" className="w-4 h-4" />
            Basic Info
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
          <Select 
            label="Country" 
            name="country" 
            value={formData.country || 'United States'} 
            onChange={handleCountryChange} 
            options={countryOptions} 
          />
        </div>

        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="users" className="w-4 h-4" />
            Parent/Guardian Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Parent Name" name="parent.name" value={formData.parent?.name || ''} onChange={handleChange} />
            <Select label="Relationship" name="parent.relationship" value={formData.parent?.relationship || 'Parent'} onChange={handleChange} options={[{value: 'Parent', label: 'Parent'},{value: 'Mother', label: 'Mother'}, {value: 'Father', label: 'Father'}, {value: 'Guardian', label: 'Guardian'}]} />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="phone" className="w-4 h-4" />
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhoneInput label="Student Phone" name="contact.studentPhone" value={formData.contact.studentPhone ?? { countryCode: '+1', number: '' }} onChange={handlePhoneChange} />
            <PhoneInput label="Parent Phone 1" name="contact.parentPhone1" value={formData.contact.parentPhone1 ?? { countryCode: '+1', number: '' }} onChange={handlePhoneChange} />
            <PhoneInput label="Parent Phone 2 (Optional)" name="contact.parentPhone2" value={formData.contact.parentPhone2 ?? { countryCode: '+1', number: '' }} onChange={handlePhoneChange} />
            <Input label="Email" name="contact.email" type="email" value={formData.contact.email} onChange={handleChange} wrapperClassName="md:col-span-2" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon iconName="academic-cap" className="w-4 h-4" />
            Tuition Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Subject(s)" name="tuition.subjects" value={formData.tuition.subjects.join(', ')} onChange={handleSubjectChange} helperText="For more than one use comma" />
            <Input label="Default Rate" name="tuition.defaultRate" type="number" value={formData.tuition.defaultRate} onChange={handleTuitionChange} min="0" step="0.01" />
            <Select 
              label="Rate Type" 
              name="tuition.rateType" 
              value={formData.tuition.rateType} 
              onChange={handleTuitionChange} 
              options={[
                {value: 'hourly', label: 'Hourly'}, 
                {value: 'per_lesson', label: 'Per Lesson'},
                {value: 'monthly', label: 'Monthly'}
              ]} 
            />
            <Input label="Duration (mins)" name="tuition.typicalLessonDuration" type="number" value={formData.tuition.typicalLessonDuration} onChange={handleTuitionChange} min="0" helperText="Typical Lesson/Session Duration" />
            <Select 
              label="Preferred Payment Method" 
              name="tuition.preferredPaymentMethod" 
              value={formData.tuition.preferredPaymentMethod || ''} 
              onChange={handleTuitionChange} 
              options={[
                { value: '', label: 'Not Specified' },
                { value: 'Online', label: 'Online' },
                { value: 'Cash', label: 'Cash' },
              ]} 
            />
          </div>
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
          {student ? 'Save Changes' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
};