// data/creditFactors.ts

// This is the schematic of the great machine, the detailed breakdown of the components
// that constitute the user's credit score. Each factor is a gear, a lever that,
// when understood and adjusted, can improve the overall performance. This data
// is crucial for the `CreditHealthView`, as it transforms the opaque, mysterious
// credit score into a transparent, understandable system. It is the key to demystifying
// credit and empowering the user to take control.

import type { CreditFactor } from '../types';

/**
 * @description A detailed breakdown of the factors that contribute to a credit score.
 * This data is used in the `CreditHealthView` to provide users with a transparent
 * look at what influences their score. Each factor has a name, a status rating, and
 * a user-friendly description explaining its impact.
 */
export const MOCK_CREDIT_FACTORS: CreditFactor[] = [
    { name: 'Payment History', status: 'Excellent', description: 'You have no missed payments on record. Keep up the great work!' },
    { name: 'Credit Utilization', status: 'Good', description: 'Your credit utilization is 22%, which is good. Aim to keep it below 30%.' },
    { name: 'Credit Age', status: 'Good', description: 'Your average credit account age is 6 years. The longer, the better.' },
    { name: 'New Credit', status: 'Excellent', description: 'You have not opened any new credit lines recently, which is positive.' },
    { name: 'Credit Mix', status: 'Fair', description: 'Your credit mix could be improved with different types of loans, such as a mortgage.' },
];
