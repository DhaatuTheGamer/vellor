import { describe, it, expect, beforeEach } from 'vitest';
import { 
  setHoveredTransaction, 
  setHoveredStudent, 
  currentHoveredTransactionId, 
  currentHoveredStudentId 
} from '../../helpers/globalHover';

describe('Global Hover Helper', () => {
  beforeEach(() => {
    setHoveredTransaction(null);
    setHoveredStudent(null);
  });

  it('updates currentHoveredTransactionId correctly', () => {
    expect(currentHoveredTransactionId).toBe(null);
    setHoveredTransaction('tx-123');
    expect(currentHoveredTransactionId).toBe('tx-123');
    setHoveredTransaction(null);
    expect(currentHoveredTransactionId).toBe(null);
  });

  it('updates currentHoveredStudentId correctly', () => {
    expect(currentHoveredStudentId).toBe(null);
    setHoveredStudent('student-456');
    expect(currentHoveredStudentId).toBe('student-456');
    setHoveredStudent(null);
    expect(currentHoveredStudentId).toBe(null);
  });
});
