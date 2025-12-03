// data/index.ts

// This file is the grand archway to the library of primordial memories. It is not
// a source of data itself, but a master key, a central nexus from which all other
// data scrolls can be accessed. By gathering every export from its sibling files,
// it provides a single, clean, and elegant point of entry for the application's
// context. To import from the data library is to simply import from this file.
// Its existence is a testament to order, modularity, and the architectural
// principle of a single source of truth. It is the librarian of Demo Bank's history.

// Personal Finance Data
export * from './transactions';
export * from './assets';
export * from './impactInvestments';
export * from './budgets';
export * from './subscriptions';
export * from './creditScore';
export * from './upcomingBills';
export * from './savingsGoals';
export * from './financialGoals';
export * from './cryptoAssets';
export * from './paymentOperations';
export * from './rewardPoints';
export * from './rewardItems';
export * from './creditFactors';
export * from './portfolioAssets';

// Corporate Finance Data
export * from './corporateCards';
export * from './corporateTransactions';
export * from './paymentOrders';
export * from './invoices';
export * from './complianceCases';
export * from './anomalies';
export * from './counterparties';
export * from './corporate/payrollData';


// System & Market Data
export * from './marketMovers';
export * from './notifications';
export * from './apiStatus';

// Admin & Platform Data
export * from './admin';
export * from './platform';

// Mega Dashboard Data
export * from './megadashboard';
export * from './accessLogs';
export * from './fraudCases';
export * from './platform/mlModels'; // Re-exporting for Predictive Models view

// New Integration Data
export * from './integrationData';
export * from './constitutionalArticles';
export * from './ledgerAccounts';

// Demo Bank Platform Data
export * from './platform/projectsData';
export * from './platform/lmsData';
export * from './platform/hrisData';

// FIX: Export the newly populated mock data file.
export * from './mockData';
