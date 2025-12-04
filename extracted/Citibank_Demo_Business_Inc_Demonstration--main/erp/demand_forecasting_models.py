import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import random

# --- Constants & Configuration ---
FORECAST_HORIZON_DAYS = 90
CONFIDENCE_INTERVAL_LEVEL = 0.95 # e.g., 0.95 for 95% confidence interval

# External market indicators' simulated impact strength on demand
EXTERNAL_DATA_SIMULATION_STRENGTH = {
    "economic_index_sensitivity": 0.05,  # 5% demand change per unit change in economic index
    "competitor_promo_demand_reduction": -0.10, # -10% demand if competitor has promo
    "seasonal_peak_demand_boost": 0.15 # 15% demand boost during peak season
}

class MockGeminiAPIClient:
    """
    A high-performance, fault-tolerant client for Gemini, designed for handling
    complex `responseSchema` interactions, with built-in observability –
    a reliable conduit to profound intelligence.

    For this blueprint, it simulates the `generateContent` method to return
    structured, AI-crafted responses based on defined schemas, mimicking
    the clarity and insight of a visionary.
    """
    def generate_content(self, prompt: str, response_schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulates the Gemini API's generateContent method to produce structured,
        AI-like responses based on the provided schema. This method embodies
        the intelligent translation of complex data into actionable insights.

        In a production environment, this would involve complex prompt engineering,
        orchestration of actual API calls to Gemini, robust error handling,
        and schema validation.
        """
        print(f"MockGeminiAPIClient: Processing a profound prompt for schema: {list(response_schema.keys())[0] if response_schema else 'N/A'}")

        # Simulating response generation based on expected top-level schema keys
        if "forecast_data" in response_schema.get("properties", {}):
            # Simulate the granular, probabilistic forecast data
            forecasts = []
            today = datetime.now()
            for i in range(FORECAST_HORIZON_DAYS):
                date = (today + timedelta(days=i)).strftime("%Y-%m-%d")
                
                # Placeholder for actual complex SKU/location specific forecast simulation
                sku_forecasts = []
                # For mock, generate a few random SKUs for each day
                num_mock_skus = random.randint(5, 15) 
                for _ in range(num_mock_skus): 
                    sku_id = f"SKU-{random.randint(1000, 9999)}"
                    location_id = f"LOC-{random.randint(1, 5)}" # Simulate multiple locations
                    predicted_demand = round(random.uniform(50, 500), 2)
                    
                    # Generate confidence intervals
                    margin_of_error = random.uniform(0.05, 0.15) * predicted_demand
                    lower_bound = round(predicted_demand - margin_of_error, 2)
                    upper_bound = round(predicted_demand + margin_of_error, 2)
                    
                    # Simulate potential vulnerability
                    vulnerability_flag = random.random() < 0.05 # 5% chance of vulnerability
                    
                    sku_forecasts.append({
                        "sku_id": sku_id,
                        "predicted_demand": predicted_demand,
                        f"lower_bound_{int(CONFIDENCE_INTERVAL_LEVEL*100)}": lower_bound,
                        f"upper_bound_{int(CONFIDENCE_INTERVAL_LEVEL*100)}": upper_bound,
                        "location_id": location_id,
                        "vulnerability_flag": vulnerability_flag
                    })
                forecasts.append({
                    "date": date,
                    "sku_forecasts": sku_forecasts
                })
            
            # Crafting an AI-like summary and vulnerabilities with visionary clarity
            summary = (
                "Our latest AI-driven demand forecast reveals robust growth across key product lines, "
                "with an anticipated 12% average increase in demand over the next quarter. "
                "The European market shows particular dynamism, while North American demand "
                "stabilizes, guided by resilient consumer spending patterns. Seasonal peaks "
                "in Q4 are projected to be exceptionally strong, driven by strategic promotional alignment."
            )
            vulnerabilities = [
                "Emergent supply chain congestion in Southeast Asia poses a moderate risk for high-volume electronics components, potentially impacting fulfillment rates for ~5% of our SKUs.",
                "Localized economic shifts in certain APAC regions could introduce minor demand volatility for luxury goods; continuous monitoring is advised.",
                "A nascent competitor's aggressive pricing strategy in the wearables segment may marginally affect market share by 1-2% if not proactively addressed."
            ]

            return {
                "forecast_data": forecasts,
                "summary": summary,
                "vulnerabilities": vulnerabilities,
                "confidence_interval_level": CONFIDENCE_INTERVAL_LEVEL
            }
        
        elif "scenario_impact_analysis" in response_schema.get("properties", {}):
            # Simulate scenario impact analysis with depth
            scenario_name = "Global Microchip Shortage & Its Ripple Effects"
            impact_description = (
                "This 'what-if' scenario projects the profound operational and financial implications "
                "of a prolonged global microchip shortage. We anticipate a 20-25% reduction "
                "in manufacturing capacity for all electronics-dependent SKUs, leading to a "
                "projected 18% decrease in fulfillment rates over the next two fiscal quarters. "
                "Raw material costs for affected components are estimated to surge by 15-30%, "
                "impacting gross margins. Customer satisfaction scores could see a temporary dip "
                "of 5-8 points due to extended lead times and stockouts, necessitating transparent "
                "communication and proactive customer support."
            )
            key_metrics_impact = {
                "revenue_change_percent": -12.5,
                "fulfillment_rate_change_percent": -18.0,
                "lead_time_change_days": 45.0, # Average increase in lead time
                "gross_margin_impact_percent": -7.0 # Negative impact on gross margin
            }
            mitigation_strategies = [
                "**Diversification of Supplier Base:** Immediately onboard and qualify secondary and tertiary suppliers for critical microchip components across multiple geopolitical regions.",
                "**Strategic Inventory Buffering:** Increase safety stock for high-demand, high-margin SKUs least impacted by the shortage, while prioritizing existing chip inventory for critical product lines.",
                "**Product Redesign & Substitution:** Explore fast-track product redesigns to utilize alternative, more readily available chipsets where feasible, or offer alternative product versions.",
                "**Transparent Customer Communication:** Proactively inform key clients about potential delays, offering solutions, and managing expectations to preserve long-term relationships.",
                "**Investment in Long-Term Procurement Agreements:** Secure longer-term, higher-volume contracts with key suppliers to stabilize future supply and pricing."
            ]
            return {
                "scenario_name": scenario_name,
                "impact_description": impact_description,
                "key_metrics_impact": key_metrics_impact,
                "mitigation_strategies": mitigation_strategies
            }

        return {"error": "Mocked response not defined for this profound schema."}

class DemandForecastingDataProcessor:
    """
    The meticulous curator for hyper-contextualized demand forecasting.
    This pipeline ingests, cleans, and engineers features from diverse data
    sources to prepare them for AI model consumption. It transforms raw data
    into a profound tapestry of insights, crucial for the predictive models,
    thereby weaving foresight into the very fabric of operational precision.
    """
    def __init__(self, historical_data_window_years: int = 3):
        self.historical_data_window_years = historical_data_window_years
        print(f"DemandForecastingDataProcessor initialized, poised to gather a {historical_data_window_years}-year window of wisdom.")

    def _generate_mock_historical_data(self, start_date: datetime, end_date: datetime, num_skus: int = 200, num_locations: int = 5) -> pd.DataFrame:
        """
        Generates realistic mock historical sales, inventory, and promotional data,
        simulating the intricate dance of business.
        """
        data = []
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # Consistent set of SKUs and locations for better merging
        sku_ids = [f"SKU-{i+1}" for i in range(num_skus)]
        location_ids = [f"LOC-{j+1}" for j in range(num_locations)]

        for date in date_range:
            for sku_id in sku_ids:
                for location_id in location_ids:
                    base_sales = random.randint(10, 100)
                    
                    # Simulate robust seasonality (e.g., higher sales in Q4)
                    month = date.month
                    seasonality_factor = 1 + np.sin(2 * np.pi * (month - 3) / 12) * 0.5 # Peaks around June, troughs around December
                    if month in [10, 11, 12]: # Holiday season boost
                        seasonality_factor += 0.7 

                    # Simulate promotional uplift
                    is_promo = random.random() < 0.15 # 15% chance of promo
                    promo_effect = random.uniform(0.2, 0.5) * base_sales if is_promo else 0 # 20-50% sales boost
                    
                    sales = base_sales * seasonality_factor + promo_effect + random.gauss(0, 5)
                    sales = max(0, round(sales)) # Sales cannot be negative
                    
                    inventory = random.randint(100, 1000) - sales # Inventory depletion
                    inventory = max(50, inventory) # Minimum inventory level
                    
                    data.append({
                        "date": date,
                        "sku_id": sku_id,
                        "location_id": location_id,
                        "sales": sales,
                        "inventory_level": inventory,
                        "is_promotional_period": is_promo,
                        "promo_type": random.choice(["Discount", "BOGO", "Bundle"]) if is_promo else None
                    })
        return pd.DataFrame(data)

    def _generate_mock_external_data(self, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        """
        Generates mock external market indicators, casting its gaze outward to
        discern the subtle influences on the market's pulse.
        """
        data = []
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        for date in date_range:
            # Simulate an evolving economic index
            economic_index = random.uniform(0.9, 1.1) + np.sin(date.toordinal() / 100) * 0.05
            
            # Simulate competitor activity bursts
            competitor_promo_active = random.random() < 0.08 # 8% chance of competitor promo
            
            # Simplified seasonal pattern
            is_peak_season = date.month in [11, 12, 1] # e.g., holiday and post-holiday shopping
            
            # Geopolitical event risk (random fluctuation for simulation)
            geopolitical_event_risk = random.uniform(0, 0.1) # 0.1 indicates higher risk
            
            data.append({
                "date": date,
                "economic_index": economic_index,
                "competitor_promo_active": competitor_promo_active,
                "is_peak_season": is_peak_season,
                "geopolitical_event_risk": geopolitical_event_risk
            })
        return pd.DataFrame(data)

    def load_and_preprocess_data(self) -> pd.DataFrame:
        """
        Loads and preprocesses diverse data sources, integrating historical sales,
        promotional data, inventory levels, and external market indicators.
        It generates a rich, hyper-contextualized feature set, meticulously
        prepared for the discerning eye of the forecasting AI.
        """
        end_date = datetime.now()
        start_date_historical = end_date - timedelta(days=365 * self.historical_data_window_years)
        # Extend external data window to cover historical data and future forecast horizon
        start_date_external = end_date - timedelta(days=365 * (self.historical_data_window_years + 1)) 

        print("Generating a tapestry of mock historical sales, inventory, and promotional data...")
        historical_df = self._generate_mock_historical_data(start_date_historical, end_date)
        
        print("Gathering whispers of mock external market indicators...")
        external_df = self._generate_mock_external_data(start_date_external, end_date + timedelta(days=FORECAST_HORIZON_DAYS))

        # Merge dataframes on date. Left join ensures all historical sales data is kept.
        merged_df = pd.merge(historical_df, external_df, on="date", how="left")
        
        # Feature Engineering: The alchemy of transforming raw data into predictive signals
        print("Performing the alchemy of feature engineering: crafting lagged features, rolling means, and temporal insights...")
        merged_df['day_of_week'] = merged_df['date'].dt.dayofweek
        merged_df['month'] = merged_df['date'].dt.month
        merged_df['year'] = merged_df['date'].dt.year
        merged_df['week_of_year'] = merged_df['date'].dt.isocalendar().week.astype(int)
        
        # Lagged sales features, critical for time series forecasting
        merged_df = merged_df.sort_values(by=['sku_id', 'location_id', 'date'])
        for lag in [7, 14, 28, 90]: # weekly, bi-weekly, monthly, quarterly lags
            merged_df[f'sales_lag_{lag}'] = merged_df.groupby(['sku_id', 'location_id'])['sales'].shift(lag)
        
        # Rolling mean sales to capture trends
        merged_df[f'sales_rolling_mean_30'] = merged_df.groupby(['sku_id', 'location_id'])['sales'].transform(lambda x: x.rolling(window=30, min_periods=1).mean())
        
        # Incorporate external data impacts as direct features
        merged_df['demand_modifier_economic'] = merged_df['economic_index'].apply(lambda x: 1 + (x - 1) * EXTERNAL_DATA_SIMULATION_STRENGTH["economic_index_sensitivity"])
        merged_df['demand_modifier_competitor'] = merged_df['competitor_promo_active'].apply(lambda x: 1 + EXTERNAL_DATA_SIMULATION_STRENGTH["competitor_promo_demand_reduction"] if x else 1)
        merged_df['demand_modifier_season'] = merged_df['is_peak_season'].apply(lambda x: 1 + EXTERNAL_DATA_SIMULATION_STRENGTH["seasonal_peak_demand_boost"] if x else 1)
        
        # Fill NaN values created by lagging, typically with 0 or a sophisticated imputation strategy
        merged_df.fillna(0, inplace=True) # In production, a more nuanced imputation would be employed
        
        print("The data tapestry is complete, rich with hyper-contextualized features. Shape:", merged_df.shape)
        return merged_df

class DemandForecastingModel:
    """
    The very core of hyper-contextualized AI demand forecasting. This class
    employs ensemble AI models that delve deeply into the past, discerning
    not only historical sales but also casting its gaze outward to external
    market indicators. With this vast understanding, it predicts future
    inventory needs with remarkable accuracy, providing granular, probabilistic
    forecasts and illuminating potential supply chain vulnerabilities.
    It is the engine of foresight, providing clarity in an uncertain world.
    """
    def __init__(self, gemini_client: MockGeminiAPIClient):
        self.gemini_client = gemini_client
        self.models: Dict[str, Any] = {} # In a real system, this would hold trained ML models (e.g., Prophet, XGBoost)
        self.unique_skus: List[str] = []
        self.unique_locations: List[str] = []
        print("DemandForecastingModel initialized. Ready to leverage the profound wisdom of ensemble AI.")

    def _train_mock_ensemble_model(self, preprocessed_data: pd.DataFrame):
        """
        Simulates the rigorous training of an ensemble of AI models.
        In a production system, this would involve actual model training
        (e.g., using a combination of ARIMA, Prophet, Gradient Boosting Machines,
        or even deep learning models like LSTMs), tailored for each SKU and location.
        For this blueprint, it signifies the preparedness for such an endeavor.
        """
        print("Simulating the 'training' of our visionary ensemble AI models for demand forecasting...")
        
        self.unique_skus = preprocessed_data['sku_id'].unique().tolist()
        self.unique_locations = preprocessed_data['location_id'].unique().tolist()
        
        # In a real scenario, self.models would store actual trained objects,
        # perhaps a dictionary mapping (sku_id, location_id) to a combined ensemble model.
        # Example: self.models[(sku, loc)] = TrainedEnsembleModel(...)
        
        # For this mock, we simply indicate that the "training" has prepared the system
        # to generate diverse forecasts for these entities.
        print(f"Mock ensemble model 'trained' for {len(self.unique_skus)} SKUs across {len(self.unique_locations)} locations, ready for predictive insights.")

    def predict_demand(self, preprocessed_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Generates granular, probabilistic demand forecasts for thousands of SKUs
        across multiple geographic locations. It leverages the underlying ensemble
        AI models and formats the output through the Gemini API client, conforming
        to a complex, detailed response schema, thereby providing clarity and foresight.

        Args:
            preprocessed_data (pd.DataFrame): The feature-engineered dataset from
                                              the DemandForecastingDataProcessor.

        Returns:
            Dict[str, Any]: A dictionary containing the AI-generated forecast data,
                            summary, and identified vulnerabilities, all conforming
                            to the expected response schema, a true beacon of insight.
        """
        if not self.unique_skus or not self.unique_locations:
            self._train_mock_ensemble_model(preprocessed_data) # Ensure models are "trained" for context

        print("Invoking hyper-contextualized AI models to predict the future's demand...")

        # Define the complex response schema for Gemini, meticulously mirroring the blueprint's description.
        # This schema ensures the AI's output is structured, actionable, and comprehensive.
        forecast_response_schema = {
            "type": "object",
            "properties": {
                "forecast_data": {
                    "type": "array",
                    "description": "A daily breakdown of predicted demand across all SKUs and locations.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "date": {"type": "string", "format": "date", "description": "The date for which the forecast is made."},
                            "sku_forecasts": {
                                "type": "array",
                                "description": "List of individual SKU forecasts for the given date.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "sku_id": {"type": "string", "description": "Unique identifier for the Stock Keeping Unit."},
                                        "predicted_demand": {"type": "number", "description": "The AI's most probable prediction for demand."},
                                        f"lower_bound_{int(CONFIDENCE_INTERVAL_LEVEL*100)}": {"type": "number", "description": f"The lower bound of the {int(CONFIDENCE_INTERVAL_LEVEL*100)}% confidence interval for demand."},
                                        f"upper_bound_{int(CONFIDENCE_INTERVAL_LEVEL*100)}": {"type": "number", "description": f"The upper bound of the {int(CONFIDENCE_INTERVAL_LEVEL*100)}% confidence interval for demand."},
                                        "location_id": {"type": "string", "nullable": True, "description": "The geographic location for this specific SKU forecast."},
                                        "vulnerability_flag": {"type": "boolean", "description": "True if potential supply chain vulnerability or demand shock is detected for this SKU/period."}
                                    },
                                    "required": ["sku_id", "predicted_demand", f"lower_bound_{int(CONFIDENCE_INTERVAL_LEVEL*100)}", f"upper_bound_{int(CONFIDENCE_INTERVAL_LEVEL*100)}"]
                                }
                            }
                        },
                        "required": ["date", "sku_forecasts"]
                    }
                },
                "summary": {"type": "string", "description": "A high-level, executive summary of the overall demand forecast trends, key drivers, and emerging patterns."},
                "vulnerabilities": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of identified potential supply chain vulnerabilities, market shifts, or internal operational risks flagged by the AI."
                },
                "confidence_interval_level": {"type": "number", "description": "The confidence level used for the probabilistic forecast intervals (e.g., 0.95 for 95%)."}
            },
            "required": ["forecast_data", "summary", "vulnerabilities", "confidence_interval_level"]
        }

        # In a production system, the raw, aggregated outputs from the ensemble models
        # would be intelligently synthesized by Gemini into this structured format.
        # For this blueprint, the MockGeminiAPIClient simulates this intelligent synthesis.
        forecast_prompt = "Generate a comprehensive, hyper-contextualized demand forecast for the next 90 days, integrating all historical and external market insights. Provide granular SKU/location level predictions with probabilistic confidence intervals, and highlight all detected supply chain vulnerabilities."
        ai_response = self.gemini_client.generate_content(forecast_prompt, forecast_response_schema)
        
        print("Demand forecast profoundly generated and meticulously structured by AI, illuminating the path forward.")
        return ai_response

    def simulate_scenario(self, scenario_description: str, scenario_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates "what-if" scenario simulations to evaluate the ripple effect of
        various disruptions or opportunities. This feature transcends mere data;
        it provides a deep wellspring of insight, ensuring every decision is
        informed by wisdom, offering clarity in an uncertain world.

        Args:
            scenario_description (str): A natural language description of the hypothetical event
                                        (e.g., "Global supply chain disruption due to a natural disaster").
            scenario_params (Dict[str, Any]): Specific parameters defining the scenario's magnitude
                                               (e.g., {"supply_reduction_percent": 0.30, "duration_days": 60}).

        Returns:
            Dict[str, Any]: An AI-generated, detailed impact analysis and
                            proactive mitigation strategies, a true guide through uncertainty.
        """
        print(f"Initiating a visionary 'what-if' scenario simulation: '{scenario_description}' with parameters: {scenario_params}")

        # Define the schema for scenario analysis, ensuring structured, actionable insights.
        scenario_response_schema = {
            "type": "object",
            "properties": {
                "scenario_name": {"type": "string", "description": "The name or concise description of the simulated scenario."},
                "impact_description": {"type": "string", "description": "A detailed narrative explaining the scenario's projected impact on demand, sales, inventory, and other operational metrics across the value chain."},
                "key_metrics_impact": {
                    "type": "object",
                    "description": "Quantified impacts on crucial business metrics.",
                    "properties": {
                        "revenue_change_percent": {"type": "number", "description": "Estimated percentage change in total revenue."},
                        "fulfillment_rate_change_percent": {"type": "number", "description": "Estimated percentage change in order fulfillment rates."},
                        "lead_time_change_days": {"type": "number", "nullable": True, "description": "Average increase in lead times for affected products in days."},
                        "gross_margin_impact_percent": {"type": "number", "nullable": True, "description": "Estimated percentage impact on gross profit margin."}
                    }
                },
                "mitigation_strategies": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Proactive, AI-generated strategies to mitigate negative impacts or capitalize on emerging opportunities presented by the scenario."
                }
            },
            "required": ["scenario_name", "impact_description", "key_metrics_impact", "mitigation_strategies"]
        }

        # The AI's profound analytical capabilities are leveraged here to dissect the scenario.
        scenario_prompt = f"Conduct a hyper-contextualized simulation and detailed impact analysis for the following 'what-if' scenario: '{scenario_description}'. Incorporate the given parameters: {scenario_params}. Articulate the full ripple effect on our operational precision, financial stability, and customer relationships, and propose robust, actionable mitigation strategies."
        ai_response = self.gemini_client.generate_content(scenario_prompt, scenario_response_schema)

        print(f"Scenario simulation for '{scenario_description}' is complete, offering profound insights and guiding towards proactive resilience.")
        return ai_response

# --- Example Usage (for testing and demonstration purposes) ---
if __name__ == "__main__":
    print("--- Orchestrating the Demo Bank Platform's Demand Forecasting Engine ---")
    gemini_mock = MockGeminiAPIClient()
    data_processor = DemandForecastingDataProcessor(historical_data_window_years=2)
    forecasting_system = DemandForecastingModel(gemini_mock)

    print("\n--- Step 1: Crafting the Data Tapestry for Foresight ---")
    processed_data = data_processor.load_and_preprocess_data()
    print("A glimpse into the processed data, a foundation for future insights:\n", processed_data.head())

    print("\n--- Step 2: Unveiling the Future: Generating Demand Forecasts ---")
    try:
        forecast_results = forecasting_system.predict_demand(processed_data)
        print("\nAI-Generated Demand Forecast: A Beacon of Clarity:")
        print(f"  Summary of Wisdom: {forecast_results.get('summary')}")
        print(f"  Identified Vulnerabilities: {forecast_results.get('vulnerabilities')}")
        print(f"  First 2 Days of Granular Forecast Data (sample SKU):")
        
        if forecast_results.get('forecast_data'):
            for entry in forecast_results['forecast_data'][:2]: # Display first 2 days
                print(f"    Date: {entry['date']}")
                # Find a sample SKU to display consistently, or pick one
                sample_sku_forecast = next((sf for sf in entry['sku_forecasts'] if sf['location_id'] == 'LOC-1'), entry['sku_forecasts'][0]) # Prioritize LOC-1 if exists, else first
                
                print(f"      SKU: {sample_sku_forecast['sku_id']} (Location: {sample_sku_forecast['location_id']}), "
                      f"Predicted Demand: {sample_sku_forecast['predicted_demand']:.2f}, "
                      f"Range ({int(CONFIDENCE_INTERVAL_LEVEL*100)}%): "
                      f"[{sample_sku_forecast[f'lower_bound_{int(CONFIDENCE_INTERVAL_LEVEL*100)}']:.2f}-"
                      f"{sample_sku_forecast[f'upper_bound_{int(CONFIDENCE_INTERVAL_LEVEL*100)}']:.2f}], "
                      f"Vulnerable: {sample_sku_forecast['vulnerability_flag']}")
        
    except Exception as e:
        print(f"An unforeseen challenge during demand forecast generation: {e}")

    print("\n--- Step 3: Charting the Unknown: Simulating a 'What-If' Scenario ---")
    scenario_desc = "Impact of a global economic downturn leading to a 15% reduction in consumer discretionary spending for six months."
    scenario_params = {"economic_downturn_severity": 0.15, "duration_months": 6, "affected_segments": ["luxury_goods", "electronics"]}
    
    try:
        scenario_analysis = forecasting_system.simulate_scenario(scenario_desc, scenario_params)
        print("\nAI-Generated Scenario Analysis: Guiding Through Uncertainty:")
        print(f"  Scenario Title: {scenario_analysis.get('scenario_name')}")
        print(f"  Profound Impact Description: {scenario_analysis.get('impact_description')}")
        print(f"  Key Metrics Impact (Percentage): {scenario_analysis.get('key_metrics_impact')}")
        print(f"  Visionary Mitigation Strategies: {scenario_analysis.get('mitigation_strategies')}")
    except Exception as e:
        print(f"An unexpected anomaly during scenario simulation: {e}")

    print("\n--- The Engine of Operations' Demand Forecasting Module: Demonstration Complete ---")