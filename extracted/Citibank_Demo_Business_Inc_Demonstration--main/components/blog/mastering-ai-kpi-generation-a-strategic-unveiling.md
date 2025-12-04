```python
"""
This module implements the core Agentic AI system for Key Performance Indicator (KPI) generation,
transforming a descriptive concept into a functional, commercial-grade component.
Business value: This sophisticated architecture automates the end-to-end process of deriving actionable KPIs from raw data,
transforming a laborious, error-prone manual endeavor into a transparent, auditable, and continuously learning intelligence
pipeline. It drastically reduces time-to-insight from months to minutes, enabling real-time strategic agility and data-driven
decision-making. By integrating robust governance, security, and feedback mechanisms, this system ensures the reliability,
trustworthiness, and compliance of all generated insights, protecting against regulatory risks while unlocking new revenue
streams through proactive business optimization. This intelligent automation empowers enterprises to move beyond reactive
reporting to predictive and prescriptive strategies, commanding a significant competitive advantage in dynamic markets.
"""

import enum
import uuid
import datetime
import hashlib
import json
from typing import Dict, Any, List, Optional, Callable

# Placeholder for integration with other core systems described in the overall architecture.
# These would typically be actual classes/modules from other parts of the codebase
# (e.g., identity_system.IdentityProvider, message_bus.MessageQueue).
# For this specific file's implementation, simple 'Any' types are used to signify
# future integration points without introducing external dependencies.

# --- Enums and Data Structures ---

class AIPromptStage(enum.Enum):
    """
    Defines the distinct stages within the AI-driven KPI generation pipeline.
    Business value: Provides clear architectural delineation, enabling modular development, precise error
    tracing, and granular control over the AI's analytical journey. This structured approach ensures transparency
    and auditability, which are critical for high-stakes decision-making and regulatory compliance.
    """
    DATA_INTERPRETATION = "Data Interpretation"
    MODEL_SELECTION = "Model Selection"
    REFINEMENT = "Refinement"
    PREDICTION = "Prediction"
    PRESCRIPTION = "Prescription"
    VALIDATION = "Validation"
    GOVERNANCE_CHECK = "Governance Check"
    FEEDBACK_INTEGRATION = "Feedback Integration"

class KpiGovernance(dict):
    """
    Encapsulates governance parameters for a generated KPI, including access controls, compliance tags,
    and audit trail settings. Inherits from `dict` for easy serialization and direct property access.
    Business value: Elevates KPIs from mere metrics to auditable, compliant, and securely managed strategic assets.
    This ensures data integrity, adheres to regulatory frameworks (e.g., GDPR, CCPA), and provides a transparent
    record for internal and external audits, mitigating legal and reputational risks while safeguarding sensitive
    business intelligence.
    """
    def __init__(self, owner_id: str, access_roles: List[str], compliance_tags: List[str], audit_log_enabled: bool = True, **kwargs):
        super().__init__(**kwargs)
        self['owner_id'] = owner_id
        self['access_roles'] = access_roles
        self['compliance_tags'] = compliance_tags
        self['audit_log_enabled'] = audit_log_enabled
        self['created_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self['last_modified'] = self['created_at']

    def update_governance(self, updater_id: str, **kwargs):
        """
        Updates governance parameters, ensuring an audit trail.
        This method will interact with a centralized audit logging system in a full implementation.
        """
        for key, value in kwargs.items():
            if key in self:
                self[key] = value
        self['last_modified'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        # In a real system, this would trigger an audit log entry for the updater_id,
        # recording the specific changes made to governance.

class KpiDefinition(dict):
    """
    Represents a rich, versioned Key Performance Indicator artifact, encapsulating its definition,
    AI-generated insights, confidence scores, validation status, and user feedback. Inherits from `dict`.
    Business value: Transforms raw data into a fully contextualized, trustworthy, and actionable strategic asset.
    The versioning and embedded metadata (confidence, validation, feedback) provide unparalleled transparency and
    auditability, fostering executive trust in AI-driven insights. This structured approach enables iterative
    improvement and ensures that every KPI becomes a durable, verifiable chapter in the organization's evolving
    intelligence narrative, critical for sustained competitive advantage and rapid adaptation.
    """
    def __init__(self,
                 kpi_id: Optional[str] = None,
                 name: str = "Untitled KPI",
                 description: str = "",
                 definition_query: str = "",
                 generated_value: Any = None,
                 ai_confidence_score: float = 0.0,
                 ai_validation_status: str = "Pending",
                 feedback_scores: Dict[str, Any] = None,
                 governance: Optional[KpiGovernance] = None,
                 version: int = 1,
                 created_at: Optional[str] = None,
                 last_modified: Optional[str] = None,
                 audit_trail: Optional[List[Dict]] = None,
                 **kwargs):
        super().__init__(**kwargs)
        self['kpi_id'] = kpi_id if kpi_id else str(uuid.uuid4())
        self['name'] = name
        self['description'] = description
        self['definition_query'] = definition_query  # The query/logic used to derive the KPI
        self['generated_value'] = generated_value
        self['ai_confidence_score'] = ai_confidence_score
        self['ai_validation_status'] = ai_validation_status # E.g., 'Validated', 'Needs Review', 'Rejected'
        self['feedback_scores'] = feedback_scores if feedback_scores else {}
        self['governance'] = governance if governance else KpiGovernance(owner_id="system", access_roles=["admin", "analyst"], compliance_tags=["internal"])
        self['version'] = version
        self['created_at'] = created_at if created_at else datetime.datetime.now(datetime.timezone.utc).isoformat()
        self['last_modified'] = last_modified if last_modified else self['created_at']
        self['audit_trail'] = audit_trail if audit_trail else []
        self._hash = self._calculate_hash()

    def _calculate_hash(self) -> str:
        """
        Calculates a cryptographic hash of the KPI's core definition for integrity checking.
        This provides tamper-evidence for key attributes.
        """
        data_to_hash = {
            'kpi_id': self['kpi_id'],
            'name': self['name'],
            'definition_query': self['definition_query'],
            'version': self['version'],
            'created_at': self['created_at']
        }
        # Ensure consistent serialization for hashing
        return hashlib.sha256(json.dumps(data_to_hash, sort_keys=True).encode('utf-8')).hexdigest()

    def update_kpi(self, updater_id: str, new_value: Any = None, new_confidence: float = None,
                   new_validation_status: str = None, new_description: str = None, new_governance: Dict = None):
        """
        Updates the KPI, increments its version, and records the change in the audit trail.
        Business value: Ensures full traceability and immutability of KPI evolution, vital for regulatory
        compliance, forensic analysis, and maintaining trust in strategic data. Each update creates a new
        verifiable state, supporting robust data governance and historical trend analysis.
        """
        old_kpi_state = dict(self) # Shallow copy for audit
        
        self['version'] += 1
        self['last_modified'] = datetime.datetime.now(datetime.timezone.utc).isoformat()

        changes = {}
        if new_value is not None and self['generated_value'] != new_value:
            changes['generated_value'] = {'old': self['generated_value'], 'new': new_value}
            self['generated_value'] = new_value
        if new_confidence is not None and self['ai_confidence_score'] != new_confidence:
            changes['ai_confidence_score'] = {'old': self['ai_confidence_score'], 'new': new_confidence}
            self['ai_confidence_score'] = new_confidence
        if new_validation_status is not None and self['ai_validation_status'] != new_validation_status:
            changes['ai_validation_status'] = {'old': self['ai_validation_status'], 'new': new_validation_status}
            self['ai_validation_status'] = new_validation_status
        if new_description is not None and self['description'] != new_description:
            changes['description'] = {'old': self['description'], 'new': new_description}
            self['description'] = new_description
        
        if new_governance is not None:
            old_governance_snapshot = dict(self['governance'])
            self['governance'].update_governance(updater_id, **new_governance)
            if old_governance_snapshot != self['governance']:
                changes['governance'] = {'old': old_governance_snapshot, 'new': dict(self['governance'])}


        current_hash = self._calculate_hash()
        self['audit_trail'].append({
            "timestamp": self['last_modified'],
            "updater_id": updater_id,
            "change_type": "UPDATE",
            "previous_hash": old_kpi_state.get('_hash'),
            "new_hash": current_hash,
            "changes": changes
        })
        self._hash = current_hash # Update current hash

    def add_feedback(self, feedback_type: str, score: Any, comment: str = "", user_id: str = "anonymous"):
        """
        Records user feedback for the KPI, feeding into continuous learning models.
        Business value: Establishes a critical human-in-the-loop mechanism, enabling RLHF (Reinforcement Learning
        from Human Feedback) to continuously refine AI models. This direct feedback loop significantly boosts
        the accuracy, relevance, and usability of AI-generated insights, fostering user adoption and maximizing
        the return on AI investment.
        """
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if feedback_type not in self['feedback_scores']:
            self['feedback_scores'][feedback_type] = []
        self['feedback_scores'][feedback_type].append({
            "timestamp": timestamp,
            "user_id": user_id,
            "score": score,
            "comment": comment
        })
        self['last_modified'] = timestamp
        # In a real system, this would also trigger an event for the AIContinuousLearningModule.

# --- Core AI Components and Interfaces (Simulated) ---

class AISystemComponent:
    """
    Base class for all AI system components, providing common interfaces for logging and configuration.
    Business value: Standardizes interaction patterns across diverse AI microservices, reducing integration
    complexity and accelerating development cycles. This modularity ensures system robustness and ease of
    maintenance, maximizing developer productivity and minimizing operational overhead.
    """
    def __init__(self, component_id: str, config: Dict):
        self.component_id = component_id
        self.config = config
        self._log_history: List[Dict] = [] # Local log for component specific events

    def _log_event(self, event_type: str, details: Dict):
        """
        Records an event for observability and audit within this component.
        In a production environment, this would integrate with a centralized logging solution (e.g., ELK stack, Splunk).
        """
        self._log_history.append({
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "component": self.component_id,
            "event_type": event_type,
            "details": details
        })

    def get_log_history(self) -> List[Dict]:
        """Retrieves the operational log history for the component."""
        return self._log_history

class AIDataSourceSelector(AISystemComponent):
    """
    Simulates the AI's capability to intelligently identify and select optimal data sources
    based on a KPI definition query.
    Business value: Eliminates manual data discovery, significantly accelerating the initial data
    preparation phase. By programmatically matching KPI requirements with available, high-quality
    data sources, it ensures data relevance and integrity, drastically reducing human effort and
    potential for error, thus speeding up time-to-insight for critical business decisions.
    """
    def __init__(self, component_id: str = "data_source_selector", config: Dict = None):
        super().__init__(component_id, config if config else {"available_sources": ["CRM_DB", "ERP_DB", "WEB_ANALYTICS"]})

    def select_sources(self, kpi_query: str) -> List[str]:
        """
        Intelligently selects relevant data sources based on the KPI query.
        For simulation, a simple keyword match is used.
        """
        self._log_event("data_source_selection_request", {"query": kpi_query})
        selected = []
        if "sales" in kpi_query.lower() or "customer" in kpi_query.lower():
            selected.append("CRM_DB")
        if "revenue" in kpi_query.lower() or "inventory" in kpi_query.lower():
            selected.append("ERP_DB")
        if "traffic" in kpi_query.lower() or "user behavior" in kpi_query.lower():
            selected.append("WEB_ANALYTICS")
        
        # Ensure unique sources and provide a consistent order for testability
        selected = sorted(list(set(selected)))
        self._log_event("data_source_selection_complete", {"query": kpi_query, "selected_sources": selected})
        return selected

class AIDataTransformationEngine(AISystemComponent):
    """
    Simulates AI-driven data cleansing, transformation, and feature engineering.
    Business value: Automates the most time-consuming and complex aspect of data preparation,
    ensuring data quality and consistency at scale. This intelligent engine proactively identifies
    and suggests resolutions for data quality issues, dramatically reducing manual effort and
    accelerating the analytical pipeline, leading to more accurate and reliable KPI generation.
    """
    def __init__(self, component_id: str = "data_transformation_engine", config: Dict = None):
        super().__init__(component_id, config if config else {})

    def transform_data(self, raw_data: Dict, kpi_query: str) -> Dict:
        """
        Applies AI-identified transformations to raw data.
        For simulation, this will perform simplified data cleaning and type conversions.
        """
        self._log_event("data_transformation_request", {"raw_data_keys": list(raw_data.keys()), "query": kpi_query})
        transformed_data = raw_data.copy()
        anomalies_detected = []
        transformation_suggestions = []

        # Simulate common data cleaning/transformation operations
        for key, value in raw_data.items():
            # Handle missing/empty strings
            if isinstance(value, str) and value.strip() == "":
                anomalies_detected.append(f"Empty string detected for field '{key}'.")
                transformation_suggestions.append(f"Replace empty '{key}' with NULL or appropriate default.")
                transformed_data[key] = None
            # Flag negative numeric values that might be erroneous for certain metrics
            elif isinstance(value, (int, float)) and value < 0 and "sales" in key.lower() or "revenue" in key.lower():
                anomalies_detected.append(f"Negative value detected for '{key}', which might indicate data error.")
                transformation_suggestions.append(f"Verify or correct negative '{key}' values, possibly setting to 0 or absolute.")
            # Convert currency strings to floats
            elif isinstance(value, str) and value.startswith("$"):
                try:
                    numeric_value = float(value.replace("$", "").replace(",", ""))
                    transformed_data[key] = numeric_value
                    transformation_suggestions.append(f"Converted '{key}' from currency string to float.")
                except ValueError:
                    anomalies_detected.append(f"Failed to convert currency string '{value}' for '{key}' to float.")
            # Standardize date formats (simple simulation)
            elif isinstance(value, str) and ("date" in key.lower() or "timestamp" in key.lower()):
                try:
                    # Attempt a simple ISO format conversion for consistency
                    datetime.datetime.fromisoformat(value.replace("Z", "+00:00")) # Handle Z for UTC
                except ValueError:
                    anomalies_detected.append(f"Unrecognized date format for '{key}': '{value}'.")
                    transformation_suggestions.append(f"Standardize date/timestamp format for '{key}' to ISO 8601.")

        self._log_event("data_transformation_complete", {
            "transformed_data_keys": list(transformed_data.keys()),
            "anomalies_detected": anomalies_detected,
            "transformation_suggestions": transformation_suggestions
        })
        return transformed_data

class AIModelSelector(AISystemComponent):
    """
    Simulates the AI's ability to select the most appropriate analytical model for a given KPI objective.
    Business value: Optimizes the analytical process by automatically matching the best-fit machine
    learning model to the specific business question. This removes the need for expert manual model
    selection, accelerating insight generation, improving predictive accuracy, and ensuring the most
    effective use of computational resources, thereby enhancing ROI from AI investments.
    """
    def __init__(self, component_id: str = "model_selector", config: Dict = None):
        super().__init__(component_id, config if config else {"available_models": ["Regression", "Classification", "Time Series", "Clustering", "Descriptive Analytics"]})

    def select_model(self, kpi_objective: str, data_characteristics: Dict) -> str:
        """
        Selects an appropriate AI model based on the KPI objective and data characteristics.
        """
        self._log_event("model_selection_request", {"objective": kpi_objective, "data_chars": data_characteristics})
        
        # Logic to select the best model based on objective and data properties
        model = "Descriptive Analytics" # Default for general KPI derivation

        objective_lower = kpi_objective.lower()
        if "predict" in objective_lower or "forecast" in objective_lower:
            if data_characteristics.get("has_time_series_features"):
                model = "Time Series"
            elif data_characteristics.get("has_continuous_target"):
                model = "Regression"
            elif data_characteristics.get("has_categorical_target"):
                model = "Classification"
        elif "segment" in objective_lower or "group" in objective_lower:
            model = "Clustering"
        elif "identify" in objective_lower and "anomaly" in objective_lower:
            model = "Anomaly Detection" # Could be another specialized model

        self._log_event("model_selection_complete", {"objective": kpi_objective, "selected_model": model})
        return model

class KpiRefinementAssistant(AISystemComponent):
    """
    Facilitates human-AI interaction for refining KPI definitions and analytical approaches.
    Business value: Bridges the gap between raw AI output and nuanced business understanding,
    ensuring that generated KPIs are perfectly aligned with strategic intent. By enabling iterative
    human feedback and refinement, it significantly improves the practical applicability and
    acceptance of AI insights, transforming them into truly usable strategic instruments and
    fostering stronger human-AI collaboration.
    """
    def __init__(self, component_id: str = "kpi_refinement_assistant", config: Dict = None):
        super().__init__(component_id, config if config else {})

    def refine_kpi_definition(self, kpi_draft: KpiDefinition, user_input: str) -> KpiDefinition:
        """
        Refines a KPI definition based on user feedback.
        Simulates parsing natural language user input to modify KPI attributes.
        """
        self._log_event("kpi_refinement_request", {"kpi_id": kpi_draft['kpi_id'], "user_input": user_input})
        
        # Simulate AI parsing user input and suggesting refinements
        updated_description = kpi_draft['description']
        updated_query = kpi_draft['definition_query']
        
        user_input_lower = user_input.lower()

        if "more specific" in user_input_lower or "narrow the scope" in user_input_lower:
            updated_description += " (Refined for specificity based on user input)."
            updated_query += " AND (additional_specific_condition_example)"
        elif "exclude outliers" in user_input_lower or "remove anomalies" in user_input_lower:
            updated_query += " WHERE NOT IS_OUTLIER(value)"
            updated_description += " (Outliers excluded based on user preference)."
        elif "focus on recent data" in user_input_lower or "last 30 days" in user_input_lower:
            updated_query += " FILTER BY date >= CURDATE() - INTERVAL '30' DAY"
            updated_description += " (Focus on last 30 days of data)."
        elif "increase confidence threshold" in user_input_lower:
            # This would typically adjust a parameter for the AI model, not the KPI definition itself directly
            # For simulation, we'll note it.
            self._log_event("refinement_suggestion", {"action": "adjust_ai_confidence_threshold_param"})

        # Apply updates and record in audit trail
        kpi_draft.update_kpi(
            updater_id="refinement_assistant_agent",
            new_description=updated_description,
            new_governance={'last_modified': datetime.datetime.now(datetime.timezone.utc).isoformat()} # Update timestamp
        )
        # Directly updating definition_query without `update_kpi` call for simplicity in this simulation,
        # a real system might have a specific update method for the query.
        kpi_draft['definition_query'] = updated_query

        self._log_event("kpi_refinement_complete", {"kpi_id": kpi_draft['kpi_id'], "refined_query": kpi_draft['definition_query']})
        return kpi_draft

class AIPredictiveAnalyticsConfigurator(AISystemComponent):
    """
    Configures and executes predictive models based on the selected AI model and data.
    Business value: Enables forward-looking decision-making by automating the setup and execution
    of predictive analytics. This module transforms historical data into actionable forecasts,
    empowering businesses to anticipate market shifts, optimize resource allocation, and proactively
    address potential risks, thereby creating significant strategic advantage and preventing costly
    surprises.
    """
    def __init__(self, component_id: str = "predictive_analytics_configurator", config: Dict = None):
        super().__init__(component_id, config if config else {})

    def run_prediction(self, model_type: str, data: Dict, prediction_horizon: int = 30) -> Dict:
        """
        Runs a predictive model and returns results.
        Simulates different predictive outcomes based on `model_type`.
        """
        self._log_event("predictive_run_request", {"model": model_type, "data_keys": list(data.keys()), "horizon": prediction_horizon})
        
        predicted_value = 0.0
        confidence_interval = (None, None) # Use None for bounds initially
        
        # Simple simulation based on model type and sample data
        base_metric_value = sum(v for k, v in data.items() if isinstance(v, (int, float)) and any(m in k.lower() for m in ["value", "amount", "metric"]))
        if not base_metric_value: # Fallback if no obvious metric found
            base_metric_value = 100.0 # Default starting point for simulation

        if model_type == "Regression":
            predicted_value = base_metric_value * 1.05 + (0.5 * prediction_horizon) # Simulate 5% growth + 0.5 per day
            confidence_interval = (predicted_value * 0.9, predicted_value * 1.1)
        elif model_type == "Time Series":
            predicted_value = base_metric_value * (1 + 0.01 * prediction_horizon) # Simulate 1% growth per period
            confidence_interval = (predicted_value * 0.85, predicted_value * 1.15)
        elif model_type == "Classification":
            # Simulate a classification outcome (e.g., churn probability)
            churn_risk = min(0.4, 0.01 * (prediction_horizon / 7)) # Simulate higher churn risk over time
            predicted_value = {"churn_probability": churn_risk, "segment": "high_risk" if churn_risk > 0.2 else "low_risk"}
            confidence_interval = (None, None) # Not directly applicable for classification probabilities
        elif model_type == "Clustering":
            predicted_value = {"segment_id": "A", "segment_size": 1500, "characteristics": ["high_value", "engaged"]}
            confidence_interval = (None, None)
        else: # Descriptive Analytics or other unspecified models
            predicted_value = base_metric_value # Just return current value as a descriptive result
            confidence_interval = (None, None)

        self._log_event("predictive_run_complete", {"model": model_type, "predicted_value": predicted_value})
        return {
            "predicted_value": predicted_value,
            "prediction_horizon_days": prediction_horizon,
            "confidence_interval": confidence_interval,
            "model_used": model_type
        }

class AIPrescriptiveActionsRecommender(AISystemComponent):
    """
    Generates actionable recommendations based on predictive insights, guiding users towards optimal strategies.
    Business value: Translates complex data analysis into concrete, implementable business actions, driving
    measurable improvements in performance. By providing prescriptive guidance, it empowers decision-makers
    to proactively address challenges and capitalize on opportunities, directly impacting profitability,
    operational efficiency, and competitive positioning.
    """
    def __init__(self, component_id: str = "prescriptive_actions_recommender", config: Dict = None):
        super().__init__(component_id, config if config else {})

    def recommend_actions(self, kpi_id: str, predictive_result: Dict) -> List[str]:
        """
        Recommends actions based on predictive insights.
        """
        self._log_event("prescriptive_recommendation_request", {"kpi_id": kpi_id, "predictive_result": predictive_result})
        
        recommendations = []
        predicted_value = predictive_result.get("predicted_value")

        if isinstance(predicted_value, (int, float)):
            if predicted_value < 100: # Example threshold for underperformance
                recommendations.append(f"Initiate a targeted marketing campaign to boost {kpi_id} by focusing on high-potential segments.")
                recommendations.append("Conduct an internal review of operational workflows to identify and mitigate inefficiencies impacting {kpi_id}.")
                recommendations.append("Explore competitor strategies and market trends to identify new growth levers for {kpi_id}.")
            elif predicted_value > 500: # Example threshold for strong performance
                recommendations.append(f"Scale successful initiatives contributing to the strong performance of {kpi_id} across other regions/products.")
                recommendations.append(f"Allocate additional resources to capitalize on growth trends identified in {kpi_id}.")
                recommendations.append("Invest in R&D or partnership opportunities to sustain momentum and expand market share related to {kpi_id}.")
        elif isinstance(predicted_value, dict) and "churn_probability" in predicted_value:
            churn_prob = predicted_value["churn_probability"]
            if churn_prob > 0.2:
                recommendations.append("Implement proactive customer retention strategies for segments with high churn probability, focusing on personalized engagement.")
                recommendations.append("Analyze recent customer feedback and support interactions to identify root causes of increased churn risk.")
                recommendations.append("Offer targeted incentives or loyalty programs to at-risk customers to improve satisfaction and reduce churn.")
        
        self._log_event("prescriptive_recommendation_complete", {"kpi_id": kpi_id, "recommendations": recommendations})
        return recommendations

class AICognitiveKPIAnalyzer(AISystemComponent):
    """
    Performs deep cognitive analysis to uncover causal factors, anomalies, and underlying drivers of KPI changes.
    Business value: Provides profound "why" insights, moving beyond surface-level metrics to reveal the true
    mechanisms influencing business performance. This capability empowers executives to make truly informed,
    root-cause-driven decisions, eliminating guesswork and enabling targeted, highly effective strategic
    interventions that deliver sustained impact and competitive differentiation.
    """
    def __init__(self, component_id: str = "cognitive_kpi_analyzer", config: Dict = None):
        super().__init__(component_id, config if config else {})

    def analyze_kpi(self, kpi: KpiDefinition, historical_data: List[Dict]) -> Dict:
        """
        Analyzes a KPI for anomalies, causal factors, and cognitive insights.
        `historical_data` is a list of dicts, e.g., `[{"date": "...", "value": 100}]`.
        """
        self._log_event("cognitive_analysis_request", {"kpi_id": kpi['kpi_id']})
        
        anomalies_detected = []
        causal_factors = []
        cognitive_insights = []
        
        # Simulate anomaly detection based on historical trend
        if len(historical_data) >= 2:
            current_value = kpi['generated_value']
            # Assume historical_data is sorted by date, last element is most recent past
            if historical_data and isinstance(current_value, (int, float)):
                past_values = [d.get('value') for d in historical_data if isinstance(d.get('value'), (int, float))]
                if len(past_values) > 1:
                    avg_past_value = sum(past_values[:-1]) / (len(past_values) - 1)
                    if avg_past_value != 0 and abs((current_value - avg_past_value) / avg_past_value) > 0.3: # 30% deviation
                        anomalies_detected.append(f"Significant deviation ({current_value:.2f} vs. historical average {avg_past_value:.2f}) detected for '{kpi['name']}'.")
        
        # Simulate causal factor identification based on KPI name/description
        if "sales" in kpi['name'].lower():
            if kpi['generated_value'] > 1000 and "marketing_campaign" in kpi['description'].lower():
                causal_factors.append("Strong correlation observed between recent marketing campaign and increased sales performance.")
            elif kpi['generated_value'] < 200 and "competitor_activity" in kpi['description'].lower():
                causal_factors.append("Analysis suggests increased competitor activity may be impacting sales figures.")

        # Simulate cognitive insights (broader strategic observations)
        cognitive_insights.append(f"Consider exploring the relationship between customer satisfaction scores and the '{kpi['name']}' KPI for deeper strategic insights.")
        cognitive_insights.append("Evaluate potential external market factors (e.g., economic indicators, seasonal trends) that may influence this KPI's trajectory.")
        
        self._log_event("cognitive_analysis_complete", {"kpi_id": kpi['kpi_id'], "anomalies": anomalies_detected, "causal": causal_factors})
        return {
            "queryRecommendations": ["Consider adding 'customer sentiment score' as a contextual metric.", "Investigate geographical performance variations."],
            "anomaliesDetected": anomalies_detected,
            "prescriptiveSuggestions": [], # Could be populated with more generalized suggestions here
            "cognitiveInsights": cognitive_insights,
            "causalFactors": causal_factors
        }

class KpiPreviewGenerator(AISystemComponent):
    """
    Generates a human-readable preview and visual representation of the generated KPI.
    Business value: Enhances comprehension and rapid validation of AI-generated insights by presenting
    complex data in an intuitive, easily digestible format. This accelerates decision-making cycles
    and fosters greater trust and adoption among non-technical stakeholders, ensuring that valuable
    AI insights are widely understood and acted upon across the organization.
    """
    def __init__(self, component_id: str = "kpi_preview_generator", config: Dict = None):
        super().__init__(component_id, config if config else {})

    def generate_preview(self, kpi: KpiDefinition, analytics_results: Dict) -> Dict:
        """
        Generates a human-readable text preview and a simulated visual representation of the KPI
        and its associated analytics.
        """
        self._log_event("preview_generation_request", {"kpi_id": kpi['kpi_id']})
        
        preview_text = f"**KPI Name:** {kpi['name']}\n"
        preview_text += f"**Description:** {kpi['description']}\n"
        preview_text += f"**Generated Value:** {kpi['generated_value']}\n"
        preview_text += f"**AI Confidence:** {kpi['ai_confidence_score']:.2f}\n"
        preview_text += f"**Validation Status:** {kpi['ai_validation_status']}\n\n"
        
        if analytics_results.get('predictive_results'):
            pred = analytics_results['predictive_results']
            preview_text += "**Prediction:**\n"
            preview_text += f"  - Predicted Value: {pred.get('predicted_value')}\n"
            if pred.get('confidence_interval') and all(bound is not None for bound in pred['confidence_interval']):
                preview_text += f"  - Confidence Interval: {pred['confidence_interval'][0]:.2f} - {pred['confidence_interval'][1]:.2f}\n"
            preview_text += f"  - Model Used: {pred.get('model_used')}\n"
            preview_text += f"  - Horizon: {pred.get('prediction_horizon_days')} days\n\n"

        if analytics_results.get('prescriptive_actions'):
            preview_text += "**Prescriptive Actions:**\n"
            for action in analytics_results['prescriptive_actions']:
                preview_text += f"  - {action}\n"
            preview_text += "\n"

        if analytics_results.get('cognitive_insights'):
            cognitive_data = analytics_results['cognitive_insights']
            if cognitive_data.get('cognitiveInsights') or cognitive_data.get('anomaliesDetected') or cognitive_data.get('causalFactors'):
                preview_text += "**Cognitive Insights & Analysis:**\n"
                for insight in cognitive_data.get('cognitiveInsights', []):
                    preview_text += f"  - Insight: {insight}\n"
                for anomaly in cognitive_data.get('anomaliesDetected', []):
                    preview_text += f"  - Anomaly: {anomaly}\n"
                for causal in cognitive_data.get('causalFactors', []):
                    preview_text += f"  - Causal Factor: {causal}\n"
                preview_text += "\n"

        # Simulate a basic visual representation. In a real application, this would generate
        # data for a charting library or an image URL.
        visual_representation = {
            "type": "chart_config", # Indicates it's configuration for a chart
            "chart_type": "gauge" if isinstance(kpi['generated_value'], (int, float)) else "bar",
            "title": f"KPI: {kpi['name']}",
            "data_points": [{"label": "Current Value", "value": kpi['generated_value']}],
            "meta": {
                "ai_confidence": kpi['ai_confidence_score'],
                "prediction_horizon": analytics_results.get('predictive_results', {}).get('prediction_horizon_days')
            }
        }
        
        self._log_event("preview_generation_complete", {"kpi_id": kpi['kpi_id'], "preview_length": len(preview_text)})
        return {
            "text_preview": preview_text,
            "visual_representation": visual_representation
        }

class AISecurityAuditor(AISystemComponent):
    """
    Simulates a dynamic security auditor that assesses risk, compliance, and privacy violations
    during KPI generation.
    Business value: Implements a "shift-left" security posture, proactively identifying and mitigating
    governance, privacy, and compliance risks throughout the AI pipeline. This real-time vigilance
    protects sensitive data, ensures regulatory adherence (e.g., CCPA, GDPR), and prevents costly
    security incidents, safeguarding corporate reputation and avoiding significant financial penalties.
    """
    def __init__(self, component_id: str = "ai_security_auditor", config: Dict = None):
        super().__init__(component_id, config if config else {})
        self.risk_threshold = config.get("risk_threshold", 0.7)
        self.sensitive_keywords = ["pii", "ssn", "credit_card", "health_info", "customer_id", "email"]

    def audit_kpi_definition(self, kpi: KpiDefinition, raw_data_context: Dict) -> Dict:
        """
        Audits a KPI definition and associated data for security, compliance, and privacy risks.
        Checks for sensitive data mentions and compliance requirements.
        """
        self._log_event("security_audit_request", {"kpi_id": kpi['kpi_id']})
        
        risk_score = 0.0
        compliance_issues = []
        privacy_violations = []

        # Check KPI description and definition query for sensitive keywords
        for keyword in self.sensitive_keywords:
            if keyword in kpi['description'].lower() or keyword in kpi['definition_query'].lower():
                risk_score += 0.4
                privacy_violations.append(f"Potential sensitive information ('{keyword}') detected in KPI definition.")
                compliance_issues.append("Requires enhanced privacy review (e.g., GDPR, CCPA).")
                break # Only flag once per KPI definition

        # Check raw data context keys for sensitive fields
        for data_key in raw_data_context.keys():
            for keyword in self.sensitive_keywords:
                if keyword in data_key.lower():
                    risk_score += 0.3
                    privacy_violations.append(f"Sensitive data field ('{data_key}') detected in raw data context.")
                    compliance_issues.append("Requires data anonymization or masking.")
                    break # Only flag once per sensitive data key

        # Check for financial data (requiring specific compliance like PCI-DSS, SOX)
        if "financial transaction" in kpi['description'].lower() or \
           any(kw in kpi['definition_query'].lower() for kw in ["transaction_amount", "balance", "credit_score"]):
            risk_score += 0.3
            compliance_issues.append("Financial data involved; requires PCI-DSS/SOX compliance verification.")

        # Check for missing access controls or default open permissions
        if not kpi['governance'].get('access_roles') or "public" in kpi['governance'].get('access_roles', []):
            risk_score += 0.2
            compliance_issues.append("Missing or overly permissive access controls for KPI definition.")

        is_blocked = risk_score > self.risk_threshold
        self._log_event("security_audit_complete", {"kpi_id": kpi['kpi_id'], "risk_score": risk_score, "blocked": is_blocked})
        
        return {
            "riskScore": risk_score,
            "complianceIssues": compliance_issues,
            "privacyViolations": privacy_violations,
            "is_blocked": is_blocked # Simulate blocking high-risk KPIs
        }

class AIFeedbackMechanism(AISystemComponent):
    """
    Captures and processes user feedback on AI-generated KPIs, feeding into continuous learning.
    Business value: Powers a critical human-in-the-loop learning system (RLHF), ensuring AI models
    are continually aligned with business needs and user expectations. This direct feedback loop
    significantly enhances the relevance, accuracy, and usability of AI insights over time, driving
    higher adoption rates and maximizing the long-term value of AI investments.
    """
    def __init__(self, component_id: str = "ai_feedback_mechanism", config: Dict = None):
        super().__init__(component_id, config if config else {})
        self.feedback_queue: List[Dict] = [] # Simulate an in-repo message queue for feedback

    def submit_feedback(self, kpi_id: str, user_id: str, feedback_type: str, score: Any, comment: str = ""):
        """
        Submits feedback to a queue for asynchronous processing by continuous learning modules.
        """
        feedback_entry = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "kpi_id": kpi_id,
            "user_id": user_id,
            "feedback_type": feedback_type, # E.g., 'relevance', 'accuracy', 'usability'
            "score": score,               # E.g., 1-5, 'thumbs_up', 'true/false'
            "comment": comment
        }
        self.feedback_queue.append(feedback_entry)
        self._log_event("feedback_submitted", feedback_entry)

    def process_feedback_batch(self) -> List[Dict]:
        """
        Retrieves and clears a batch of feedback for processing.
        This simulates reading from a message queue.
        """
        batch = list(self.feedback_queue)
        self.feedback_queue.clear() # Clear the queue after processing
        self._log_event("feedback_batch_processed", {"count": len(batch)})
        return batch

class AIContinuousLearningModule(AISystemComponent):
    """
    Manages the adaptive intelligence of the AI system by tracking learning cycles,
    processing feedback, and coordinating model updates.
    Business value: Ensures the AI system remains perpetually relevant and precise,
    counteracting model drift and adapting to evolving business dynamics. By automating
    model retraining and deployment based on real-world performance and user feedback,
    it secures a durable AI advantage, continuously enhancing prediction accuracy and
    prescriptive power, maximizing long-term ROI.
    """
    def __init__(self, component_id: str = "ai_continuous_learning_module", config: Dict = None):
        super().__init__(component_id, config if config else {"model_versions": {"default_model": 1.0}, "feedback_impact_factor": 0.01})
        self.learning_cycles = 0
        self.processed_feedback_count = 0
        self.model_updates_count = 0

    def incorporate_feedback(self, feedback_batch: List[Dict]):
        """
        Incorporates processed feedback to simulate model improvement.
        This simulates Reinforcement Learning from Human Feedback (RLHF).
        """
        if not feedback_batch:
            self._log_event("incorporate_feedback_skipped", {"reason": "no_feedback"})
            return

        self._log_event("incorporate_feedback_start", {"batch_size": len(feedback_batch)})
        self.processed_feedback_count += len(feedback_batch)
        
        # Simulate RLHF by adjusting a hypothetical model performance metric
        # A more sophisticated system would retrain models or fine-tune parameters here.
        positive_feedback_count = sum(1 for fb in feedback_batch if fb.get('score') in ['relevant', 'accurate', 'usable'] or (isinstance(fb.get('score'), int) and fb.get('score', 0) > 3))
        
        if positive_feedback_count > len(feedback_batch) / 2: # If majority feedback is positive
            current_version = self.config["model_versions"].get("default_model", 1.0)
            self.config["model_versions"]["default_model"] = round(current_version + self.config["feedback_impact_factor"], 2) # Simulate slight model improvement
            self.model_updates_count += 1
            self._log_event("model_updated", {"reason": "positive_feedback_batch", "new_version": self.config["model_versions"]["default_model"]})
        elif (len(feedback_batch) - positive_feedback_count) > len(feedback_batch) / 2: # If majority feedback is negative
            current_version = self.config["model_versions"].get("default_model", 1.0)
            self.config["model_versions"]["default_model"] = round(max(0.9, current_version - self.config["feedback_impact_factor"]), 2) # Simulate slight model degradation or re-evaluation
            self.model_updates_count += 1
            self._log_event("model_updated", {"reason": "negative_feedback_batch_re_evaluation", "new_version": self.config["model_versions"]["default_model"]})
            
        self.learning_cycles += 1
        self._log_event("incorporate_feedback_complete", {"new_model_version": self.config["model_versions"]["default_model"]})

# --- Orchestration and Public Interface ---

class AISystemMonitoringDashboard(AISystemComponent):
    """
    Provides critical operational visibility into the AI system's performance, health, and usage metrics.
    Business value: Enables proactive operational management, ensuring system reliability, performance,
    and cost-efficiency. By offering real-time insights into latency, resource utilization, and model
    drift, it allows operators to swiftly identify and address issues, minimize downtime, and
    maintain optimal performance, thereby maximizing system uptime and reducing operational costs.
    """
    def __init__(self, component_id: str = "ai_system_monitoring_dashboard", config: Dict = None):
        super().__init__(component_id, config if config else {})
        self.overall_status = "OPERATIONAL"
        self.latency_ms = 50
        self.cpu_usage_percent = 25
        self.model_drift_score = 0.1 # 0-1, higher is worse, indicating potential need for retraining
        self.kpi_generated_count = 0
        self.audit_events_count = 0
        self.security_alerts_count = 0
        self.last_update = datetime.datetime.now(datetime.timezone.utc).isoformat()

    def update_metrics(self, kpi_generated: int = 0, audit_events: int = 0, security_alerts: int = 0):
        """
        Simulates updating dashboard metrics based on system activity.
        In a production system, this would receive events from a metrics pipeline (e.g., Prometheus, Datadog).
        """
        self.kpi_generated_count += kpi_generated
        self.audit_events_count += audit_events
        self.security_alerts_count += security_alerts
        
        # Simulate dynamic metrics fluctuations for realism
        self.latency_ms = max(40, self.latency_ms + (uuid.uuid4().int % 20 - 10)) # Fluctuates between ~30-70ms
        self.cpu_usage_percent = max(10, min(90, self.cpu_usage_percent + (uuid.uuid4().int % 30 - 15))) # Fluctuates between ~10-90%
        self.model_drift_score = min(0.9, self.model_drift_score + (uuid.uuid4().int % 10 - 5) / 100.0) # drift can increase/decrease slowly
        
        self.last_update = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self._log_event("metrics_updated", self.get_status())

    def get_status(self) -> Dict:
        """Retrieves the current status and key metrics of the AI system for display."""
        return {
            "overallStatus": self.overall_status,
            "latencyMs": self.latency_ms,
            "cpuUsagePercent": self.cpu_usage_percent,
            "model_drift_score": round(self.model_drift_score, 2), # Round for cleaner display
            "kpiGeneratedCount": self.kpi_generated_count,
            "auditEventsCount": self.audit_events_count,
            "securityAlertsCount": self.security_alerts_count,
            "lastUpdate": self.last_update
        }

class AIEcosystemMarketplace(AISystemComponent):
    """
    Simulates a marketplace for pluggable AI components and services, enabling extensibility.
    Business value: Establishes an open, extensible framework for integrating specialized AI models
    and third-party services, future-proofing the AI architecture. This marketplace fosters innovation,
    allows for rapid expansion of capabilities without core re-engineering, and drives new revenue
    opportunities by enabling partners to contribute valuable AI plugins, ensuring the system remains
    at the forefront of AI innovation.
    """
    def __init__(self, component_id: str = "ai_ecosystem_marketplace", config: Dict = None):
        super().__init__(component_id, config if config else {})
        # Stores class paths or callable references for available plugins.
        # In a real system, this would dynamically load modules or connect to external services.
        self.available_plugins: Dict[str, str] = {
            "fraud_detection_plugin": "components.agents.FraudDetectorAgent", # Placeholder reference to another agent type
            "sentiment_analyzer": "components.nlp.SentimentAnalyzerService" # Placeholder reference
        }

    def register_plugin(self, plugin_name: str, plugin_class_path: str):
        """Registers a new AI plugin in the marketplace."""
        if plugin_name in self.available_plugins:
            self._log_event("plugin_registration_failed", {"plugin_name": plugin_name, "reason": "already_exists"})
            raise ValueError(f"Plugin '{plugin_name}' already exists.")
        self.available_plugins[plugin_name] = plugin_class_path
        self._log_event("plugin_registered", {"plugin_name": plugin_name, "path": plugin_class_path})

    def get_plugin_details(self, plugin_name: str) -> Optional[str]:
        """Retrieves the class path or details for a registered plugin."""
        self._log_event("plugin_lookup", {"plugin_name": plugin_name})
        return self.available_plugins.get(plugin_name)

class KPIGenerationAgent:
    """
    An agent abstraction that orchestrates the end-to-end AI-driven KPI generation pipeline.
    This agent coordinates various specialized AI components, applies governance, and integrates
    with feedback mechanisms to produce high-value, auditable KPIs.
    Business value: This intelligent agent automates complex analytical workflows, significantly
    reducing the operational burden on data scientists and analysts. It ensures consistent,
    governed, and high-quality KPI generation at scale, freeing human talent for higher-value
    strategic tasks and accelerating the entire analytical lifecycle for mission-critical insights.
    """
    def __init__(self, agent_id: str, identity_provider: Any = None, message_queue: Any = None):
        self.agent_id = agent_id
        # These are integration points for other core systems in the Money20/20 architecture.
        # identity_provider would handle user authentication and RBAC.
        # message_queue would facilitate inter-agent communication (pub/sub).
        self.identity_provider = identity_provider # Interface for Digital Identity & Security
        self.message_queue = message_queue       # Interface for inter-agent communication
        self.components = {
            "data_source_selector": AIDataSourceSelector(),
            "data_transformation_engine": AIDataTransformationEngine(),
            "model_selector": AIModelSelector(),
            "kpi_refinement_assistant": KpiRefinementAssistant(),
            "predictive_analytics_configurator": AIPredictiveAnalyticsConfigurator(),
            "prescriptive_actions_recommender": AIPrescriptiveActionsRecommender(),
            "cognitive_kpi_analyzer": AICognitiveKPIAnalyzer(),
            "kpi_preview_generator": KpiPreviewGenerator(),
            "security_auditor": AISecurityAuditor(),
            "feedback_mechanism": AIFeedbackMechanism(),
            "learning_module": AIContinuousLearningModule(),
            "monitoring_dashboard": AISystemMonitoringDashboard(),
            "marketplace": AIEcosystemMarketplace()
        }
        self.audit_log: List[Dict] = [] # Agent-specific audit trail
        self._log_event("agent_initialized", {"agent_id": self.agent_id})

    def _log_event(self, event_type: str, details: Dict):
        """
        Records an event in the agent's audit log.
        In a production system, this would also send to a central audit log service (e.g., via message queue).
        """
        self.audit_log.append({
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "agent_id": self.agent_id,
            "event_type": event_type,
            "details": details
        })
        # If a message_queue is available, publish to an audit topic
        if self.message_queue:
            self.message_queue.publish("audit_logs", {"source": "KPIGenerationAgent", "event": details})

    def get_component(self, name: str) -> AISystemComponent:
        """Retrieves an internal component by name, providing access to its specific functionality."""
        if name not in self.components:
            raise ValueError(f"Component '{name}' not found in KPIGenerationAgent.")
        return self.components[name]

    def _authorize_action(self, user_id: str, action: str, resource: str) -> bool:
        """
        Simulates authorization check against a digital identity provider.
        Business value: Enforces strict Role-Based Access Control (RBAC), preventing unauthorized access
        and manipulation of sensitive KPI data and AI processes. This is foundational for data security,
        regulatory compliance, and maintaining data integrity, protecting against internal and external threats.
        """
        if self.identity_provider:
            # A real identity provider would have a method like this
            return self.identity_provider.authorize(user_id, action, resource)
        # For simulation, default to allowing actions if no identity provider is configured.
        return True

    def simulateAIGenerationPipeline(self,
                                     user_id: str,
                                     initial_kpi_name: str,
                                     initial_kpi_description: str,
                                     raw_data_payload: Dict,
                                     kpi_objective: str,
                                     refinement_prompt: Optional[str] = None) -> KpiDefinition:
        """
        Coordinates the multi-modal, multi-stage pipeline for AI-driven KPI generation.
        This function orchestrates the flow through data preparation, AI model application,
        human-in-the-loop refinement, security auditing, and insight generation.
        Business value: This orchestrator function is the cerebral cortex of the entire KPI generation system.
        It automates the intricate dance of specialized AI microservices, ensuring a coherent, transparent,
        and auditable analytical progression. By seamlessly guiding data from raw form to actionable
        prescriptive insights, it dramatically accelerates strategic decision-making, mitigates operational
        complexity, and provides a robust, repeatable process for generating trustworthy business intelligence
        at scale, driving unparalleled operational efficiency and strategic agility.
        """
        if not self._authorize_action(user_id, "generate_kpi", initial_kpi_name):
            raise PermissionError(f"User {user_id} not authorized to generate KPI: {initial_kpi_name}")

        self._log_event("pipeline_start", {"user_id": user_id, "kpi_name": initial_kpi_name, "objective": kpi_objective})

        # Stage 1: Initial KPI Definition
        kpi = KpiDefinition(
            name=initial_kpi_name,
            description=initial_kpi_description,
            definition_query=f"Derive {initial_kpi_name} from data related to '{kpi_objective}' for predictive analytics.",
            governance=KpiGovernance(owner_id=user_id, access_roles=["analyst", "stakeholder"], compliance_tags=["internal_use", "business_metric"])
        )
        self._log_event("kpi_initialized", {"kpi_id": kpi['kpi_id'], "version": kpi['version']})

        # Stage 2: Data Source Selection (DATA_INTERPRETATION)
        selected_sources = self.components["data_source_selector"].select_sources(kpi_objective)
        self._log_event("data_sources_selected", {"kpi_id": kpi['kpi_id'], "sources": selected_sources})
        # In a real system, data would be fetched from these sources. For simulation, `raw_data_payload` is used.

        # Stage 3: Data Transformation and Quality (DATA_INTERPRETATION)
        transformed_data = self.components["data_transformation_engine"].transform_data(raw_data_payload, kpi['definition_query'])
        self._log_event("data_transformed", {"kpi_id": kpi['kpi_id'], "data_keys": list(transformed_data.keys())})

        # Stage 4: AI Security Audit (GOVERNANCE_CHECK) - Proactive check on definition and data
        audit_results = self.components["security_auditor"].audit_kpi_definition(kpi, transformed_data)
        self._log_event("security_audit_performed", {"kpi_id": kpi['kpi_id'], "audit_results": audit_results})
        if audit_results['is_blocked']:
            self.components["monitoring_dashboard"].update_metrics(security_alerts=1)
            raise PermissionError(f"KPI generation blocked due to high security/compliance risk: {audit_results['complianceIssues']}. Risk Score: {audit_results['riskScore']:.2f}")

        # Stage 5: Model Selection (MODEL_SELECTION)
        # Simplified data characteristics for simulation
        data_characteristics = {
            "has_time_series_features": any("date" in k.lower() for k in transformed_data.keys()),
            "has_continuous_target": any(isinstance(v, (int, float)) for v in transformed_data.values()),
            "has_categorical_target": False # Extend with actual data analysis
        }
        selected_model = self.components["model_selector"].select_model(kpi_objective, data_characteristics)
        self._log_event("model_selected", {"kpi_id": kpi['kpi_id'], "model": selected_model})

        # Stage 6: KPI Refinement (REFINEMENT)
        if refinement_prompt:
            kpi = self.components["kpi_refinement_assistant"].refine_kpi_definition(kpi, refinement_prompt)
            self._log_event("kpi_refined", {"kpi_id": kpi['kpi_id']})

        # Stage 7: Predictive Analytics (PREDICTION)
        predictive_results = self.components["predictive_analytics_configurator"].run_prediction(selected_model, transformed_data)
        # Update KPI with generated value and initial confidence
        kpi.update_kpi(updater_id=self.agent_id, new_value=predictive_results['predicted_value'], new_confidence=0.85)
        self._log_event("predictive_analytics_run", {"kpi_id": kpi['kpi_id'], "results_summary": {"predicted_value": predictive_results['predicted_value'], "model": predictive_results['model_used']}})

        # Stage 8: Prescriptive Actions (PRESCRIPTION)
        prescriptive_actions = self.components["prescriptive_actions_recommender"].recommend_actions(kpi['kpi_id'], predictive_results)
        self._log_event("prescriptive_actions_generated", {"kpi_id": kpi['kpi_id'], "actions_count": len(prescriptive_actions)})

        # Stage 9: Cognitive KPI Analysis
        # Simulate some historical data for analysis (should come from a data store in reality)
        historical_data_sim = [
            {"date": (datetime.date.today() - datetime.timedelta(days=i)).isoformat(), "value": (kpi['generated_value'] * (1 - i*0.01) if isinstance(kpi['generated_value'], (int, float)) else 100 * (1 - i*0.01))}
            for i in range(5, 0, -1)
        ]
        cognitive_insights_data = self.components["cognitive_kpi_analyzer"].analyze_kpi(kpi, historical_data_sim)
        self._log_event("cognitive_analysis_run", {"kpi_id": kpi['kpi_id'], "insights_count": len(cognitive_insights_data.get('cognitiveInsights', []))})

        # Stage 10: KPI Preview Generation
        full_analytics_context = {
            "predictive_results": predictive_results,
            "prescriptive_actions": prescriptive_actions,
            "cognitive_insights": cognitive_insights_data
        }
        kpi_preview = self.components["kpi_preview_generator"].generate_preview(kpi, full_analytics_context)
        self._log_event("kpi_preview_generated", {"kpi_id": kpi['kpi_id'], "preview_summary": kpi_preview['text_preview'][:100] + "..."})
        
        # Final update to KPI object with full context and set validation status for human review
        final_description = f"{kpi['description']}\n\n--- AI-Generated Insights Summary ---\n{kpi_preview['text_preview']}"
        kpi.update_kpi(updater_id=self.agent_id, new_validation_status="Needs Review", new_description=final_description)
        
        # Update monitoring dashboard with pipeline completion metrics
        self.components["monitoring_dashboard"].update_metrics(kpi_generated=1, audit_events=len(kpi['audit_trail']), security_alerts=1 if audit_results['is_blocked'] else 0)

        self._log_event("pipeline_complete", {"kpi_id": kpi['kpi_id'], "final_status": kpi['ai_validation_status'], "final_version": kpi['version']})
        return kpi

    def provide_feedback_on_kpi(self, user_id: str, kpi: KpiDefinition, feedback_type: str, score: Any, comment: str = ""):
        """
        Allows a user to provide feedback on a generated KPI, which feeds into the continuous learning module.
        Business value: Direct integration of user feedback into the AI's continuous learning cycle,
        critical for adapting models to real-world utility and evolving business needs. This human-in-the-loop
        mechanism ensures the AI remains relevant and highly accurate, driving adoption and maximizing
        the long-term value of the AI system by continually refining its intelligence.
        """
        if not self._authorize_action(user_id, "provide_feedback", kpi['kpi_id']):
            raise PermissionError(f"User {user_id} not authorized to provide feedback on KPI {kpi['kpi_id']}")
        
        kpi.add_feedback(feedback_type, score, comment, user_id)
        self.components["feedback_mechanism"].submit_feedback(kpi['kpi_id'], user_id, feedback_type, score, comment)
        self._log_event("feedback_recorded", {"kpi_id": kpi['kpi_id'], "user_id": user_id, "type": feedback_type, "score": score})

    def run_learning_cycle(self):
        """
        Triggers a learning cycle in the AIContinuousLearningModule using collected feedback.
        Business value: Automates the process of AI model improvement, transforming user interactions
        and operational data into enhanced predictive and prescriptive capabilities. This ensures the
        AI system's intelligence continually matures, delivering increasingly accurate and relevant
        insights without manual intervention, securing a sustained competitive edge.
        """
        self._log_event("learning_cycle_start", {})
        feedback_batch = self.components["feedback_mechanism"].process_feedback_batch()
        self.components["learning_module"].incorporate_feedback(feedback_batch)
        self._log_event("learning_cycle_completed", {"feedback_processed_count": len(feedback_batch), "new_model_version": self.components["learning_module"].config["model_versions"]["default_model"]})


# Exported components, classes, and functions from this module as required by instructions.
__all__ = [
    "AIPromptStage",
    "KpiGovernance",
    "KpiDefinition",
    "AISystemComponent",
    "AIDataSourceSelector",
    "AIDataTransformationEngine",
    "AIModelSelector",
    "KpiRefinementAssistant",
    "AIPredictiveAnalyticsConfigurator",
    "AIPrescriptiveActionsRecommender",
    "AICognitiveKPIAnalyzer",
    "KpiPreviewGenerator",
    "AISecurityAuditor",
    "AIFeedbackMechanism",
    "AIContinuousLearningModule",
    "AISystemMonitoringDashboard",
    "AIEcosystemMarketplace",
    "KPIGenerationAgent"
]
```