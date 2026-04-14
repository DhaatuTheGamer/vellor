const { performance } = require('perf_hooks');

const runBenchmark = () => {
    const transactions = Array.from({ length: 100000 }, (_, i) => ({
        id: `tx-${i}`,
        studentId: `student-${i % 100}`,
        status: i % 2 === 0 ? 'DUE' : 'PAID',
        lessonFee: 100
    }));

    const currentHoveredStudentId = 'student-50';

    // Baseline implementation
    const baselineStart = performance.now();
    let updatedCountBaseline = 0;
    const studentDueTransactions = transactions.filter(
        tx => tx.studentId === currentHoveredStudentId &&
        (tx.status === 'DUE' || tx.status === 'PARTIALLY_PAID')
    );

    if (studentDueTransactions.length > 0) {
        studentDueTransactions.forEach(t => {
            updatedCountBaseline++;
        });
    }
    const baselineTime = performance.now() - baselineStart;

    // Optimized implementation
    const optStart = performance.now();
    let updatedCountOpt = 0;
    for (let i = 0, len = transactions.length; i < len; i++) {
        const tx = transactions[i];
        if (tx.studentId === currentHoveredStudentId && (tx.status === 'DUE' || tx.status === 'PARTIALLY_PAID')) {
            updatedCountOpt++;
        }
    }
    const optTime = performance.now() - optStart;

    console.log(`Baseline Time: ${baselineTime.toFixed(2)}ms`);
    console.log(`Optimized Time: ${optTime.toFixed(2)}ms`);
    console.log(`Updated Count (Should match): Baseline=${updatedCountBaseline}, Optimized=${updatedCountOpt}`);
};

runBenchmark();
