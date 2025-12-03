import { QuantumCoreClient } from '../src/QuantumCoreClient';
import {
  Budget,
  FinancialGoal,
  GoalCreationRequest,
  GoalUpdateRequest,
  AIInsight,
  BudgetCreationRequest,
  BudgetCategory,
} from '../src/types';

// --- Setup ---
// Assume QuantumCoreClient is initialized with the user's access token
const client = new QuantumCoreClient({
  accessToken: 'YOUR_ACCESS_TOKEN',
  baseUrl: 'https://virtserver.swaggerhub.com/JOCALL3_1/jamesburvelocallaghaniiiapi/1.0',
});

/**
 * Example Script: Personal Financial Planning with Quantum Core 3.0
 * Focuses on: Budgets & Financial Planning, Financial Goals & Strategic Planning, AI Advisor
 */
async function runFinancialPlanningExample() {
  console.log("--- Starting Personal Financial Planning Example ---");

  const userId = 'user-quantum-visionary-001'; // Placeholder for the authenticated user

  try {
    // 1. AI Advisor Interaction: Get initial context/advice
    console.log("\n1. Engaging Quantum AI Advisor for initial planning context...");
    const advisorResponse = await client.ai.advisor.chat({
      message: "I want to create a budget for next month and set a new 5-year savings goal. What are my current spending trends?",
    });
    console.log(`Quantum Response: ${advisorResponse.text.substring(0, 100)}...`);

    // Extract relevant data from AI response (simulated)
    const spendingTrends = await client.transactions.insights.getSpendingTrends();
    console.log(`Current Spending Trend: ${spendingTrends.overallTrend} (${spendingTrends.percentageChange}% change)`);

    // 2. Create a New Budget (Monthly)
    const budgetName = "October 2024 Living Expenses";
    const budgetStartDate = '2024-10-01';
    const budgetEndDate = '2024-10-31';
    const budgetTotal = 3200.00;

    const budgetRequest: BudgetCreationRequest = {
      name: budgetName,
      period: 'monthly',
      startDate: budgetStartDate,
      endDate: budgetEndDate,
      totalAmount: budgetTotal,
      categories: [
        { name: "Rent/Mortgage", allocated: 1600.00 },
        { name: "Groceries", allocated: 500.00 },
        { name: "Utilities", allocated: 200.00 },
      ],
      alertThreshold: 80,
      aiAutoPopulate: true, // Let AI fill in the rest based on history
    };

    console.log(`\n2. Creating new budget: ${budgetName} (Total: $${budgetTotal.toFixed(2)})`);
    const newBudget: Budget = await client.budgets.createBudget(budgetRequest);
    console.log(`Budget Created Successfully! ID: ${newBudget.id}`);
    console.log(`AI Auto-populated Categories: ${newBudget.categories.length} total categories.`);
    
    // Simulate spending in one category
    const groceryTxn = {
        id: 'txn_budget_test_001',
        accountId: 'acc_chase_checking_4567', // Assume this account is linked
        type: 'expense',
        category: 'Groceries',
        description: 'Weekly Grocery Run',
        amount: 150.00,
        currency: 'USD',
        date: '2024-10-05',
    };
    // In a real scenario, transactions would arrive via webhook or polling.
    // Here, we manually update the budget object for demonstration purposes:
    const updatedGroceryCategory = newBudget.categories.find(c => c.name === 'Groceries')!;
    updatedGroceryCategory.spent += groceryTxn.amount;
    updatedGroceryCategory.remaining = updatedGroceryCategory.allocated - updatedGroceryCategory.spent;
    
    console.log(`Simulated spending of $${groceryTxn.amount.toFixed(2)} in Groceries.`);

    // 3. Get Detailed Budget to check progress and AI insights
    console.log(`\n3. Retrieving detailed budget status for ID: ${newBudget.id}`);
    const detailedBudget = await client.budgets.getBudgetDetails(newBudget.id);
    
    const groceryStatus = detailedBudget.categories.find(c => c.name === 'Groceries');
    console.log(`Groceries Spent: $${groceryStatus?.spent.toFixed(2)} / Allocated: $${groceryStatus?.allocated.toFixed(2)}`);
    
    if (detailedBudget.aiRecommendations && detailedBudget.aiRecommendations.length > 0) {
        console.log(`AI Budget Insight: ${detailedBudget.aiRecommendations[0].title}`);
    } else {
        console.log("No specific AI budget insights generated yet.");
    }

    // 4. Create a Long-Term Financial Goal (e.g., Down Payment)
    const goalName = "House Down Payment Fund";
    const goalRequest: GoalCreationRequest = {
      name: goalName,
      type: 'home_purchase',
      targetAmount: 100000.00,
      targetDate: '2030-12-31',
      initialContribution: 5000.00,
      generateAIPlan: true, // Crucial: Request AI planning
      riskTolerance: 'conservative',
    };

    console.log(`\n4. Creating new financial goal: ${goalName} ($100k by 2030)`);
    const newGoal: FinancialGoal = await client.goals.createFinancialGoal(goalRequest);
    console.log(`Goal Created Successfully! ID: ${newGoal.id}`);
    
    if (newGoal.aiStrategicPlan) {
        console.log(`AI Strategic Plan Summary: ${newGoal.aiStrategicPlan.summary}`);
        console.log(`First AI Step: ${newGoal.aiStrategicPlan.steps[0].title}`);
    }

    // 5. Update the Goal (e.g., adjust risk tolerance and force plan recalculation)
    const updateRequest: GoalUpdateRequest = {
        riskTolerance: 'moderate',
        generateAIPlan: true,
    };

    console.log(`\n5. Updating goal risk tolerance and forcing AI plan recalculation...`);
    const updatedGoal = await client.goals.updateFinancialGoal(newGoal.id, updateRequest);
    console.log(`Goal Updated. New Status: ${updatedGoal.status}`);
    if (updatedGoal.aiStrategicPlan) {
        console.log(`Recalculated AI Plan Summary: ${updatedGoal.aiStrategicPlan.summary.substring(0, 80)}...`);
    }

    // 6. List all goals to confirm creation
    console.log("\n6. Listing all financial goals:");
    const goalList = await client.goals.listFinancialGoals({ limit: 5, offset: 0 });
    console.log(`Total Goals Found: ${goalList.total}`);
    goalList.data.forEach(g => console.log(` - ${g.name} (${g.status})`));

    // 7. Clean up (Optional: Delete the created budget and goal)
    console.log("\n7. Cleaning up created resources...");
    await client.budgets.deleteBudget(newBudget.id);
    console.log(`Budget ${newBudget.id} deleted.`);
    await client.goals.deleteFinancialGoal(newGoal.id);
    console.log(`Goal ${newGoal.id} deleted.`);

  } catch (error) {
    console.error("\n--- An error occurred during the Financial Planning Example ---");
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(error);
    }
  } finally {
    console.log("\n--- Financial Planning Example Finished ---");
  }
}

// Execute the example function
// runFinancialPlanningExample();