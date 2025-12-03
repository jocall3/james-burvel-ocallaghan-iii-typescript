-- SQL database schema for storing comprehensive customer profiles and interaction data for the CRM module.

-- Table: companies
-- Stores information about organizations or businesses associated with customers.
CREATE TABLE IF NOT EXISTS companies (
    company_id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    employee_count INTEGER,
    annual_revenue DECIMAL(18, 2),
    website VARCHAR(255),
    phone_number VARCHAR(50),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: customers
-- Stores core profile information for individual customers or contacts.
CREATE TABLE IF NOT EXISTS customers (
    customer_id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    company_id BIGINT REFERENCES companies(company_id) ON DELETE SET NULL, -- Link to company if applicable
    customer_type VARCHAR(50) NOT NULL DEFAULT 'Lead', -- e.g., 'Lead', 'Prospect', 'Customer', 'Partner'
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- e.g., 'Active', 'Inactive', 'Churned', 'Converted'
    lead_source VARCHAR(255),
    lead_score DECIMAL(5, 2), -- AI-driven lead scoring (e.g., 0.00 to 100.00)
    predicted_clv DECIMAL(18, 2), -- AI-driven Predicted Customer Lifetime Value
    churn_risk_score DECIMAL(5, 2), -- AI-driven churn risk (e.g., 0.00 to 100.00)
    next_best_action TEXT, -- AI-driven suggestion for the next best engagement action
    last_interaction_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookup of customers by company
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers (company_id);
-- Index for faster lookup of customers by email
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email ON customers (email);


-- Table: products_services
-- Catalog of products or services offered by the platform.
CREATE TABLE IF NOT EXISTS products_services (
    product_id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: customer_product_interest
-- Stores which products/services a customer has shown interest in.
CREATE TABLE IF NOT EXISTS customer_product_interest (
    customer_id BIGINT REFERENCES customers(customer_id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products_services(product_id) ON DELETE CASCADE,
    interest_level VARCHAR(50), -- e.g., 'High', 'Medium', 'Low', 'Purchased'
    expressed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, product_id)
);

-- Table: deals
-- Tracks sales opportunities or ongoing engagements.
CREATE TABLE IF NOT EXISTS deals (
    deal_id BIGSERIAL PRIMARY KEY,
    deal_name VARCHAR(255) NOT NULL,
    customer_id BIGINT REFERENCES customers(customer_id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES companies(company_id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL, -- e.g., 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'
    amount DECIMAL(18, 2),
    expected_close_date DATE,
    actual_close_date DATE,
    deal_health_score DECIMAL(5, 2), -- AI-driven health score for the deal
    predicted_close_probability DECIMAL(5, 2), -- AI-driven probability of closing the deal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookup of deals by customer
CREATE INDEX IF NOT EXISTS idx_deals_customer_id ON deals (customer_id);
-- Index for faster lookup of deals by company
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals (company_id);


-- Table: interactions
-- Records all touchpoints and communications with customers.
CREATE TABLE IF NOT EXISTS interactions (
    interaction_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    interaction_type VARCHAR(100) NOT NULL, -- e.g., 'Call', 'Email', 'Meeting', 'Website Visit', 'Social Media', 'Content Download', 'In-App Message'
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subject VARCHAR(255),
    notes TEXT, -- Content of interaction for NLP/sentiment analysis
    sentiment_score DECIMAL(5, 2), -- AI-derived sentiment (e.g., -1.00 to 1.00)
    channel VARCHAR(100), -- e.g., 'Email', 'Phone', 'LinkedIn', 'Website', 'App', 'API'
    associated_deal_id BIGINT REFERENCES deals(deal_id) ON DELETE SET NULL, -- Link to deal if applicable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookup of interactions by customer and date
CREATE INDEX IF NOT EXISTS idx_interactions_customer_id_date ON interactions (customer_id, interaction_date DESC);
-- Index for faster lookup of interactions by type
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions (interaction_type);


-- Table: customer_behavioral_data
-- Stores granular behavioral events from various sources (website, app, etc.).
CREATE TABLE IF NOT EXISTS customer_behavioral_data (
    behavior_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- e.g., 'page_view', 'button_click', 'form_submit', 'video_watched'
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_data JSONB, -- Flexible JSON field for storing event-specific details (e.g., URL, item_id, duration)
    source_channel VARCHAR(100), -- e.g., 'website', 'mobile_app', 'third_party_integration'
    ip_address INET, -- IP address from where the event originated
    user_agent TEXT, -- User-agent string of the client
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookup of behavioral data by customer and event type
CREATE INDEX IF NOT EXISTS idx_behavioral_customer_event ON customer_behavioral_data (customer_id, event_type);


-- Table: customer_segments
-- Defines the various segments customers can belong to (e.g., High-Value, At-Risk, New Prospect).
CREATE TABLE IF NOT EXISTS customer_segments (
    segment_id BIGSERIAL PRIMARY KEY,
    segment_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    segment_criteria JSONB, -- JSON representation of the rules or AI model parameters defining this segment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: customer_segment_membership
-- Junction table linking customers to their assigned segments.
CREATE TABLE IF NOT EXISTS customer_segment_membership (
    customer_id BIGINT REFERENCES customers(customer_id) ON DELETE CASCADE,
    segment_id BIGINT REFERENCES customer_segments(segment_id) ON DELETE CASCADE,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, segment_id)
);

-- Trigger to update `updated_at` column automatically
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_companies_timestamp
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER update_customers_timestamp
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER update_products_services_timestamp
BEFORE UPDATE ON products_services
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER update_deals_timestamp
BEFORE UPDATE ON deals
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER update_interactions_timestamp
BEFORE UPDATE ON interactions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER update_customer_segments_timestamp
BEFORE UPDATE ON customer_segments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();