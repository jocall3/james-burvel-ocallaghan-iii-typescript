import { ChartType } from '../components/DashboardChart';

// ================================================================================================
// HELPER FUNCTIONS & CONSTANTS
// ================================================================================================
const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

const generateTimeSeries = (points: number, min: number, max: number, key: string, startDate?: Date) => {
    const data = [];
    const start = startDate || new Date(2024, 0, 1);
    for (let i = 0; i < points; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        data.push({
            name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            [key]: Math.floor(Math.random() * (max - min + 1)) + min,
        });
    }
    return data;
};

const generateCategorical = (categories: string[], min: number, max: number, key: string) => {
    return categories.map(cat => ({
        name: cat,
        [key]: Math.floor(Math.random() * (max - min + 1)) + min,
    }));
};

interface ChartConfig {
    id: string;
    category: string;
    title: string;
    type: ChartType;
    data: any[];
    config: any;
}


// ================================================================================================
// DATA GENERATION FUNCTION
// ================================================================================================
export const getDashboardChartsData = (context: any): ChartConfig[] => {
    if (!context || !context.transactions || context.transactions.length === 0) {
        return Array.from({length: 100}, (_,i) => ({
            id: `loading-${i}`, category: 'Personal Finance', title: `Chart ${i+1}`, type: 'bar', data: [], config: {dataKeys: []}
        }));
    }

    const { 
        transactions, assets, budgets, portfolioAssets, corporateTransactions, 
        accessLogs, fraudCases, mlModels, payRuns, apiUsage, incidents 
    } = context;
    
    let charts: ChartConfig[] = [];

    // ================================================================================================
    // CATEGORY: Personal Finance (15 Charts)
    // ================================================================================================
    charts.push({
        id: 'pf-1', category: 'Personal Finance', title: 'Income vs. Expense', type: 'bar',
        data: transactions.reduce((acc: any[], tx: any) => {
            const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
            let monthData = acc.find(d => d.name === month);
            if (!monthData) { monthData = { name: month, income: 0, expense: 0 }; acc.push(monthData); }
            if (tx.type === 'income') monthData.income += tx.amount;
            else monthData.expense += tx.amount;
            return acc;
        }, []).reverse(),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'income', name: 'Income', color: COLORS[2] }, { key: 'expense', name: 'Expense', color: COLORS[4] }] }
    });
    charts.push({
        id: 'pf-2', category: 'Personal Finance', title: 'Daily Net Flow', type: 'line',
        data: generateTimeSeries(30, -500, 500, 'net'),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'net', name: 'Net Flow', color: COLORS[0] }] }
    });
    charts.push({
        id: 'pf-3', category: 'Personal Finance', title: 'Spending by Category', type: 'pie',
        data: transactions.filter((t:any) => t.type === 'expense').reduce((acc: any[], tx: any) => {
            let cat = acc.find(c => c.name === tx.category);
            if(!cat) { cat = {name: tx.category, value: 0}; acc.push(cat); }
            cat.value += tx.amount;
            return acc;
        }, []),
        config: { dataKey: 'value', nameKey: 'name', colors: COLORS }
    });
    charts.push({
        id: 'pf-4', category: 'Personal Finance', title: 'Carbon Footprint by Category', type: 'bar',
        data: generateCategorical(['Dining', 'Shopping', 'Travel'], 10, 200, 'co2'),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'co2', name: 'kg CO₂', color: COLORS[1] }] }
    });
    // ... 11 more personal finance charts
    for (let i = 5; i <= 15; i++) {
        charts.push({
            id: `pf-${i}`, category: 'Personal Finance', title: `Personal Metric ${i-4}`, type: 'area',
            data: generateTimeSeries(30, 100, 1000, `metric${i}`),
            config: { xAxisKey: 'name', dataKeys: [{ key: `metric${i}`, name: `Metric ${i-4}`, color: COLORS[i % COLORS.length] }] }
        });
    }


    // ================================================================================================
    // CATEGORY: Investment Analysis (15 Charts)
    // ================================================================================================
     charts.push({
        id: 'inv-1', category: 'Investment Analysis', title: 'Portfolio by Asset Class', type: 'pie',
        data: portfolioAssets.reduce((acc: any[], asset: any) => {
            let item = acc.find(a => a.name === asset.assetClass);
            if (!item) { item = { name: asset.assetClass, value: 0 }; acc.push(item); }
            item.value += asset.value;
            return acc;
        }, []),
        config: { dataKey: 'value', nameKey: 'name', colors: COLORS, innerRadius: 40 }
    });
     charts.push({
        id: 'inv-2', category: 'Investment Analysis', title: 'Portfolio by Region', type: 'bar',
        data: portfolioAssets.reduce((acc: any[], asset: any) => {
            let item = acc.find(a => a.name === asset.region);
            if (!item) { item = { name: asset.region, value: 0 }; acc.push(item); }
            item.value += asset.value;
            return acc;
        }, []),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'value', name: 'Value', color: COLORS[0] }] }
    });
    charts.push({
        id: 'inv-3', category: 'Investment Analysis', title: 'Top 5 Holdings 24h Change', type: 'bar',
        data: portfolioAssets.sort((a:any,b:any)=>b.value-a.value).slice(0,5).map((a:any)=>({name: a.ticker, change: a.change24h})),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'change', name: '% Change', color: COLORS[2] }], domain: [-3, 3] }
    });
    charts.push({
        id: 'inv-4', category: 'Investment Analysis', title: 'Asset Performance vs. Value', type: 'radar', // Changed to radar
        data: assets.map((a:any) => ({ subject: a.name, value: a.value/1000, performance: a.performanceYTD, fullMark: 50 })),
        config: { angleKey: 'subject', dataKeys: [{key: 'performance', name: 'YTD Perf %', color: COLORS[3]}]}
    });
    // ... 11 more investment charts
    for (let i = 5; i <= 15; i++) {
        charts.push({
            id: `inv-${i}`, category: 'Investment Analysis', title: `Market Index ${i-4}`, type: 'line',
            data: generateTimeSeries(30, 15000, 16000, `index${i}`),
            config: { xAxisKey: 'name', dataKeys: [{ key: `index${i}`, name: `Index ${i-4}`, color: COLORS[i % COLORS.length] }] }
        });
    }

    // ================================================================================================
    // CATEGORY: Budget & Spending (10 Charts)
    // ================================================================================================
    charts.push({
        id: 'bud-1', category: 'Budget & Spending', title: 'Budget Utilization', type: 'bar',
        data: budgets.map((b: any) => ({ name: b.name, used: (b.spent / b.limit) * 100 })),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'used', name: '% Used', color: COLORS[5] }], domain: [0, 100] }
    });
     charts.push({
        id: 'bud-2', category: 'Budget & Spending', title: 'Spending vs Limit', type: 'bar',
        data: budgets.map((b: any) => ({ name: b.name, spent: b.spent, limit: b.limit })),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'spent', name: 'Spent', color: COLORS[0] }, {key: 'limit', name: 'Limit', color: COLORS[1]}] }
    });
    // ... 8 more budget charts
    for (let i = 3; i <= 10; i++) {
        charts.push({
            id: `bud-${i}`, category: 'Budget & Spending', title: `Spending Habit ${i-2}`, type: 'area',
            data: generateTimeSeries(30, 20, 150, `habit${i}`),
            config: { xAxisKey: 'name', dataKeys: [{ key: `habit${i}`, name: `Habit ${i-2}`, color: COLORS[i % COLORS.length] }] }
        });
    }

    // ================================================================================================
    // CATEGORY: Corporate Finance (15 Charts)
    // ================================================================================================
    charts.push({
        id: 'corp-1', category: 'Corporate Finance', title: 'Corporate Spend by Card', type: 'bar',
        data: corporateTransactions.reduce((acc: any[], tx: any) => {
            let card = acc.find(c => c.name === tx.holderName);
            if(!card) { card = {name: tx.holderName, spent: 0}; acc.push(card); }
            card.spent += tx.amount;
            return acc;
        }, []),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'spent', name: 'Spent', color: COLORS[3] }], interval: 0 }
    });
    charts.push({
        id: 'corp-2', category: 'Corporate Finance', title: 'Pay Run History', type: 'line',
        data: payRuns.map((p:any) => ({name: p.payDate, amount: p.totalAmount})).reverse(),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'amount', name: 'Total Payroll', color: COLORS[4] }] }
    });
    // ... 13 more corporate charts
    for (let i = 3; i <= 15; i++) {
        charts.push({
            id: `corp-${i}`, category: 'Corporate Finance', title: `Corp Metric ${i-2}`, type: 'bar',
            data: generateCategorical(['Q1', 'Q2', 'Q3', 'Q4'], 10000, 50000, `metric${i}`),
            config: { xAxisKey: 'name', dataKeys: [{ key: `metric${i}`, name: `Metric ${i-2}`, color: COLORS[i % COLORS.length] }] }
        });
    }

    // ================================================================================================
    // CATEGORY: Platform Analytics (15 Charts)
    // ================================================================================================
    charts.push({
        id: 'plat-1', category: 'Platform Analytics', title: 'API Calls (24h)', type: 'bar',
        data: apiUsage.map((u: any) => ({ name: u.endpoint.slice(4), calls: u.calls24h })),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'calls', name: 'Calls', color: COLORS[6] }], interval: 0 }
    });
     charts.push({
        id: 'plat-2', category: 'Platform Analytics', title: 'API Latency (ms)', type: 'line',
        data: apiUsage.map((u: any) => ({ name: u.endpoint.slice(4), latency: u.avgLatency })),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'latency', name: 'Latency', color: COLORS[0] }], interval: 0 }
    });
    // ... 13 more platform charts
    for (let i = 3; i <= 15; i++) {
        charts.push({
            id: `plat-${i}`, category: 'Platform Analytics', title: `Platform KPI ${i-2}`, type: 'area',
            data: generateTimeSeries(30, 500, 2000, `kpi${i}`),
            config: { xAxisKey: 'name', dataKeys: [{ key: `kpi${i}`, name: `KPI ${i-2}`, color: COLORS[i % COLORS.length] }] }
        });
    }
    
    // ================================================================================================
    // CATEGORY: Security & Compliance (10 Charts)
    // ================================================================================================
    charts.push({
        id: 'sec-1', category: 'Security & Compliance', title: 'Access Events by Risk', type: 'pie',
        data: accessLogs.reduce((acc: any[], log: any) => {
            let risk = acc.find(r => r.name === log.riskLevel);
            if(!risk) { risk = {name: log.riskLevel, value: 0}; acc.push(risk); }
            risk.value++;
            return acc;
        }, []),
        config: { dataKey: 'value', nameKey: 'name', colors: [COLORS[4], COLORS[3], COLORS[2]] }
    });
     charts.push({
        id: 'sec-2', category: 'Security & Compliance', title: 'Fraud Case Status', type: 'bar',
        data: fraudCases.reduce((acc: any[], cs: any) => {
            let status = acc.find(s => s.name === cs.status);
            if(!status) { status = {name: cs.status, count: 0}; acc.push(status); }
            status.count++;
            return acc;
        }, []),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'count', name: 'Cases', color: COLORS[1] }] }
    });
    // ... 8 more security charts
    for (let i = 3; i <= 10; i++) {
        charts.push({
            id: `sec-${i}`, category: 'Security & Compliance', title: `Security Event ${i-2}`, type: 'line',
            data: generateTimeSeries(30, 0, 50, `event${i}`),
            config: { xAxisKey: 'name', dataKeys: [{ key: `event${i}`, name: `Event ${i-2}`, color: COLORS[i % COLORS.length] }] }
        });
    }

    // ================================================================================================
    // CATEGORY: Business Growth (10 Charts)
    // ================================================================================================
    charts.push({
        id: 'biz-1', category: 'Business Growth', title: 'ML Model Accuracy', type: 'line',
        data: mlModels[0].performanceHistory.map((h: any) => ({name: new Date(h.date).getMonth()+1, accuracy: h.accuracy})),
        config: { xAxisKey: 'name', dataKeys: [{ key: 'accuracy', name: 'Accuracy', color: COLORS[0] }], domain: ['dataMin - 1', 'dataMax + 1'] }
    });
     // ... 9 more business charts
    for (let i = 2; i <= 10; i++) {
        charts.push({
            id: `biz-${i}`, category: 'Business Growth', title: `Growth Metric ${i-1}`, type: 'area',
            data: generateTimeSeries(12, 100*i, 200*i, `metric${i}`),
            config: { xAxisKey: 'name', dataKeys: [{ key: `metric${i}`, name: `Metric ${i-1}`, color: COLORS[i % COLORS.length] }] }
        });
    }

    // ================================================================================================
    // CATEGORY: Developer & Infra (10 Charts)
    // ================================================================================================
    charts.push({
        id: 'dev-1', category: 'Developer & Infra', title: 'Incident Severity', type: 'pie',
        data: incidents.reduce((acc: any[], inc: any) => {
            let sev = acc.find(s => s.name === inc.severity);
            if(!sev) { sev = {name: inc.severity, value: 0}; acc.push(sev); }
            sev.value++;
            return acc;
        }, []),
        config: { dataKey: 'value', nameKey: 'name', colors: [COLORS[4], COLORS[3]] }
    });
    // ... 9 more dev charts
     for (let i = 2; i <= 10; i++) {
        charts.push({
            id: `dev-${i}`, category: 'Developer & Infra', title: `Infra KPI ${i-1}`, type: 'line',
            data: generateTimeSeries(24, 80, 99, `kpi${i}`),
            config: { xAxisKey: 'name', dataKeys: [{ key: `kpi${i}`, name: `KPI ${i-1}`, color: COLORS[i % COLORS.length] }] }
        });
    }
    
    return charts.slice(0, 100); // Ensure exactly 100 charts
};