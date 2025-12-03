/**
 * KpiSentimentAnalysisModel: Configuration for Content Tone and Sentiment Analysis
 *
 * This module defines interfaces and a curated list of configurations for sentiment
 * analysis models. These models are crucial for ensuring that generated or evaluated
 * content adheres to specific tonal requirements, such as being 'funny', 'factual',
 * 'informative', or 'neutral'. This directly supports the broader content strategy
 * and brand voice within the visionary enterprise.
 *
 * Business Value & Strategic Intent:
 * - **Brand Consistency**: Ensures all automated and human-generated content aligns with the desired brand voice, preventing off-brand messaging.
 * - **Audience Engagement**: Allows tailoring content sentiment to better resonate with target audiences, leading to higher interaction and satisfaction.
 * - **Content Quality Assurance**: Integrates automated tonal checks into content pipelines, reducing manual review time and ensuring compliance with content guidelines.
 * - **Ethical Communication**: Prevents the unintentional generation of offensive, biased, or misleading sentiment, supporting responsible AI deployment.
 * - **Strategic Content Optimization**: Provides measurable insights into content performance based on sentiment, enabling continuous improvement and A/B testing of tonal approaches.
 *
 * This file serves as a blueprint for configuring how our AI systems perceive and manage
 * the emotional and factual dimensions of text-based content, vital for maintaining
 * integrity and impact in a hyper-personalized communication landscape.
 */

/**
 * Enumeration for predefined tone categories that a sentiment model might target or detect.
 * These categories help classify the emotional or stylistic intent of content.
 */
export enum ToneCategory {
  Positive = 'positive',
  Negative = 'negative',
  Neutral = 'neutral',
  Funny = 'funny',
  Humorous = 'humorous',
  Sarcastic = 'sarcastic',
  Informative = 'informative',
  Factual = 'factual',
  Serious = 'serious',
  Engaging = 'engaging',
  Controversial = 'controversial',
  Inspirational = 'inspirational',
  Persuasive = 'persuasive',
  Empathetic = 'empathetic',
}

/**
 * Defines the structure for a sentiment analysis model configuration.
 * This configuration dictates how content is analyzed or generated to meet specific
 * emotional, factual, or stylistic requirements.
 */
export interface KpiSentimentAnalysisModel {
  id: string; // Unique identifier for the sentiment model configuration (e.g., 'FUNNY_BLOG_MODEL_V1')
  name: string; // Human-readable name (e.g., 'Humorous Blog Content Analyzer v1.0')
  description: string; // Detailed explanation of what this model configuration aims to achieve, including its primary use case.
  targetTone: ToneCategory[]; // An array of desired primary tone categories for content (e.g., ['Funny', 'Factual']).
  sentimentCategories: string[]; // Specific, granular sentiment labels the underlying model can output (e.g., 'joy', 'amusement', 'neutrality', 'surprise').
  analysisMethod: 'NLP_ML_Model' | 'Rule_Based' | 'Hybrid_AI_Rules' | 'Human_Review_Guidelines'; // The primary method used for sentiment analysis.
  confidenceThreshold?: number; // Optional: A minimum confidence score (0.0 to 1.0) required for a classification to be considered valid.
  evaluationMetrics?: string[]; // Metrics used to evaluate the model's performance (e.g., 'precision', 'recall', 'F1-score', 'human_agreement_score', 'tone_adherence_rate').
  integrationTargets: string[]; // List of pipelines or applications where this model configuration is primarily integrated and used (e.g., 'blog_generation_pipeline', 'social_media_monitor', 'customer_feedback_analysis').
  owner?: string; // Suggested department or role responsible for the model's development and maintenance.
  lastUpdated: string; // ISO 8601 date string representing the last time this configuration was updated.
  isActive: boolean; // Boolean flag to indicate if this model configuration is currently active and in use.
  exampleUseCases?: string[]; // Illustrative examples of content types or scenarios where this model is applied.
  languageSupport?: string[]; // A list of language codes (e.g., 'en-US', 'es-ES') indicating the languages the model is effective in.
  version: string; // Version identifier for the model configuration.
}

/**
 * A curated list of KpiSentimentAnalysisModel definitions, providing concrete configurations
 * for various content generation and evaluation needs within the visionary enterprise.
 */
export const kpiSentimentAnalysisModels: KpiSentimentAnalysisModel[] = [
  {
    id: 'BLOG_FUN_FACTS_V1',
    name: 'Humorous & Factual Blog Content Model',
    description: 'This model configuration is specifically designed for generating blog posts that are both entertaining and informative. It prioritizes a funny and engaging tone while ensuring all presented information is factually accurate. It strictly avoids any negative, sarcastic, or misleading sentiments.',
    targetTone: [ToneCategory.Funny, ToneCategory.Factual, ToneCategory.Informative, ToneCategory.Engaging],
    sentimentCategories: ['amusement', 'joy', 'curiosity', 'neutral', 'surprise'],
    analysisMethod: 'Hybrid_AI_Rules', // Combines deep learning for humor generation with rule-based fact-checking.
    confidenceThreshold: 0.78, // High confidence required for humor classification, even higher for factual accuracy.
    evaluationMetrics: ['humor_detection_F1', 'factual_recall', 'reader_engagement_score', 'negative_sentiment_suppression'],
    integrationTargets: ['blog_content_generation_pipeline', 'marketing_campaign_content', 'internal_communication_portal'],
    owner: 'Content AI & Editorial',
    lastUpdated: '2024-03-20T11:30:00Z',
    isActive: true,
    exampleUseCases: ['Marketing blogs on complex tech topics', 'Explainer articles with a lighthearted approach', 'Social media long-form content'],
    languageSupport: ['en-US'],
    version: '1.0.1'
  },
  {
    id: 'ARTICLE_FACTUAL_NEUTRAL_V2',
    name: 'Strictly Factual & Neutral Article Model',
    description: 'Ensures that all generated or reviewed articles adhere to a strictly factual, objective, and neutral tone. It explicitly filters out any form of humor, personal opinion, emotional bias, or sensationalism, making it ideal for regulatory reports and scientific publications.',
    targetTone: [ToneCategory.Factual, ToneCategory.Informative, ToneCategory.Neutral, ToneCategory.Serious],
    sentimentCategories: ['neutral', 'objective', 'formal'],
    analysisMethod: 'Rule_Based', // Emphasizes strict rules for factual verification and tone filtering.
    confidenceThreshold: 0.95, // Very high confidence for factual accuracy and neutrality.
    evaluationMetrics: ['factual_accuracy_score', 'bias_detection_rate', 'objectivity_index', 'humor_false_positive_rate'],
    integrationTargets: ['scientific_publication_pipeline', 'regulatory_compliance_reports', 'financial_market_analysis'],
    owner: 'Legal & Research Division',
    lastUpdated: '2024-03-18T15:00:00Z',
    isActive: true,
    exampleUseCases: ['Investment reports', 'Research papers', 'Legal briefs', 'Official press releases'],
    languageSupport: ['en-US', 'de-DE', 'ja-JP'],
    version: '2.1.0'
  },
  {
    id: 'SOCIAL_MEDIA_ENGAGE_V3',
    name: 'Engaging & Positive Social Media Content Model',
    description: 'Aimed at optimizing content for social media platforms to maximize positive engagement. This model balances light humor with an overall positive and inspirational sentiment, ensuring content is shareable and builds brand affinity. It has a lower tolerance for negative or aggressive language.',
    targetTone: [ToneCategory.Positive, ToneCategory.Engaging, ToneCategory.Humorous, ToneCategory.Inspirational],
    sentimentCategories: ['joy', 'excitement', 'inspiration', 'amusement'],
    analysisMethod: 'NLP_ML_Model', // Leverages advanced NLP for understanding nuanced social media language.
    confidenceThreshold: 0.70, // Allows for some creative flexibility while maintaining overall positivity.
    evaluationMetrics: ['engagement_rate', 'positive_sentiment_ratio', 'shareability_score', 'brand_perception_lift'],
    integrationTargets: ['social_media_post_automation', 'digital_advertisement_creation', 'community_response_generation'],
    owner: 'Marketing & PR',
    lastUpdated: '2024-03-22T09:00:00Z',
    isActive: true,
    exampleUseCases: ['Twitter campaigns', 'Instagram stories', 'LinkedIn company updates', 'Promotional captions'],
    languageSupport: ['en-US', 'es-MX', 'fr-CA'],
    version: '3.0.5'
  },
  {
    id: 'CUSTOMER_SERVICE_EMPATHY_V1',
    name: 'Empathetic Customer Service Response Model',
    description: 'Configures an AI model to generate customer service responses that are empathetic, helpful, and reassuring. It focuses on de-escalating negative sentiment and providing clear, supportive information.',
    targetTone: [ToneCategory.Empathetic, ToneCategory.Informative, ToneCategory.Neutral],
    sentimentCategories: ['calm', 'supportive', 'understanding', 'helpful', 'neutral'],
    analysisMethod: 'Hybrid_AI_Rules',
    confidenceThreshold: 0.85,
    evaluationMetrics: ['customer_satisfaction_score', 'issue_resolution_rate', 'empathy_score_audit', 'negative_sentiment_reduction'],
    integrationTargets: ['customer_support_chatbot', 'email_response_automation', 'live_chat_assistant'],
    owner: 'Customer Experience & AI',
    lastUpdated: '2024-03-10T14:15:00Z',
    isActive: true,
    exampleUseCases: ['Automated FAQ responses', 'Complaint handling via chat', 'Personalized support emails'],
    languageSupport: ['en-US', 'es-ES', 'pt-BR'],
    version: '1.2.0'
  },
  {
    id: 'INTERNAL_RANT_ANALYZER_V1',
    name: 'Internal Employee Rant Analyzer for Feedback',
    description: 'This configuration is for analyzing internal employee feedback or "rants" in suggestion boxes or forums. It aims to extract underlying issues and general sentiment (even if initially negative) while filtering out personal attacks. It does not try to be funny, but understands frustration.',
    targetTone: [ToneCategory.Negative, ToneCategory.Serious, ToneCategory.Informative],
    sentimentCategories: ['frustration', 'anger', 'concern', 'suggestion', 'neutral'],
    analysisMethod: 'NLP_ML_Model',
    confidenceThreshold: 0.65, // Lower threshold to catch nuanced or subtle negative feedback.
    evaluationMetrics: ['issue_identification_accuracy', 'sentiment_drift_detection', 'actionable_insight_extraction_rate'],
    integrationTargets: ['employee_feedback_system', 'HR_sentiment_dashboard', 'organizational_health_reports'],
    owner: 'HR & People Analytics',
    lastUpdated: '2024-03-25T10:00:00Z',
    isActive: true,
    exampleUseCases: ['Anonymous employee surveys', 'Internal forum posts', 'Employee suggestion box analysis'],
    languageSupport: ['en-US'],
    version: '1.0.0'
  },
];