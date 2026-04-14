const { performance } = require('perf_hooks');

const runBenchmark = () => {
    const transactions = Array.from({ length: 100000 }, (_, i) => ({
        id: `tx-${i}`,
        studentId: `student-${i % 100}`,
        status: i % 2 === 0 ? 'DUE' : 'PAID',
        lessonFee: 100
    }));

    const currentHoveredTransactionId = 'tx-99999';

    // Baseline implementation (.find)
    const baselineStart = performance.now();
    const tBase = transactions.find(tx => tx.id === currentHoveredTransactionId);
    const baselineTime = performance.now() - baselineStart;

    // Optimized implementation (for loop)
    const optStart = performance.now();
    let tOpt = undefined;
    for (let i = 0, len = transactions.length; i < len; i++) {
        if (transactions[i].id === currentHoveredTransactionId) {
            tOpt = transactions[i];
            break;
        }
    }
    const optTime = performance.now() - optStart;

    console.log(`Baseline Time (.find): ${baselineTime.toFixed(2)}ms`);
    console.log(`Optimized Time (for loop): ${optTime.toFixed(2)}ms`);
    console.log(`Found Object: Baseline=${tBase?.id}, Optimized=${tOpt?.id}`);

    // Grouping Baseline (.filter + .forEach)
    const currentHoveredStudentId = 'student-50';
    const groupBaselineStart = performance.now();
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
    const groupBaselineTime = performance.now() - groupBaselineStart;

    // Grouping Optimized (for loop without intermediate array allocation)
    const groupOptStart = performance.now();
    let updatedCountOpt = 0;
    for (let i = 0, len = transactions.length; i < len; i++) {
        const tx = transactions[i];
        if (tx.studentId === currentHoveredStudentId && (tx.status === 'DUE' || tx.status === 'PARTIALLY_PAID')) {
            updatedCountOpt++;
        }
    }
    const groupOptTime = performance.now() - groupOptStart;

    console.log(`Group Baseline Time (.filter + .forEach): ${groupBaselineTime.toFixed(2)}ms`);
    console.log(`Group Optimized Time (for loop): ${groupOptTime.toFixed(2)}ms`);
    console.log(`Updated Count: Baseline=${updatedCountBaseline}, Optimized=${updatedCountOpt}`);
};

for(let i=0; i<5; i++) runBenchmark();
