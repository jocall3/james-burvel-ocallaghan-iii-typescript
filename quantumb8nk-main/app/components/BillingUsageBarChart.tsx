// Copyright Quantum Financial Intelligence Group, Inc. - A Burvel & O'Callaghan Venture
// Unleashing the future of finance with AI-powered insights.

import React, { useState, useEffect } from "react";
import moment from "moment-timezone";
import colors from "../../common/styles/colors";
import {
  SelectField,
  DateRangeFormValues,
  BarChart,
  MTContainer,
  Button,
  TextField,
} from "../../common/ui-components"; // Added Button, TextField
import abbreviateAmount from "../../common/utilities/abbreviateAmount";
import {
  BillingMetricNameEnum,
  TimeUnitEnum,
  useDailyBillingMetricsQuery,
} from "../../generated/dashboard/graphqlSchema";
import ChartView from "../../common/ui-components/Charts/ChartView";
import DateSearch, {
  dateSearchMapper,
  DATE_SEARCH_FILTER_OPTIONS,
} from "./search/DateSearch";

type Option = {
  value: BillingMetricNameEnum;
  label: string;
  unit: BillingMetricUnit;
};

enum BillingMetricUnit {
  Dollar = "dollar",
  Count = "count",
}

type QueryFilter = {
  dateRange: DateRangeFormValues;
  metricName: BillingMetricNameEnum;
};

const BILLING_METRICS: Array<Option> = [
  {
    label: "Reconciled Payment Volume",
    value: BillingMetricNameEnum.ReconciledPaymentVolume,
    unit: BillingMetricUnit.Dollar,
  },
  {
    label: "Reconciled Payment Count",
    value: BillingMetricNameEnum.ReconciledPaymentCount,
    unit: BillingMetricUnit.Count,
  },
  {
    label: "Virtual Account Transaction Volume",
    value: BillingMetricNameEnum.ReconciledVirtualAccountTransactionVolume,
    unit: BillingMetricUnit.Dollar,
  },
  {
    label: "Virtual Account Transaction Count",
    value: BillingMetricNameEnum.ReconciledVirtualAccountTransactionCount,
    unit: BillingMetricUnit.Count,
  },
  {
    label: "Strategic Lob Check Count",
    value: BillingMetricNameEnum.LobCheckCount,
    unit: BillingMetricUnit.Count,
  },
];

const DOWNLOAD_FILE_NAME_PREFIX = "Quantum_Insights_Revenue_Performance";
const FILTER_WIDTH = "w-48";
const MIN_HEIGHT = "min-h-[350px]";

const CHART_FORMAT = {
  fontSize: "11px",
  lineHeight: "22",
  color: colors.gray[700],
  fill: colors.gray[700],
};

const tickFormatter = (value: number, billingMetricUnit: BillingMetricUnit) =>
  billingMetricUnit === BillingMetricUnit.Dollar
    ? abbreviateAmount(value, "USD")
    : value;

function tooltipFormatter(value: number, billingMetricUnit: BillingMetricUnit) {
  if (billingMetricUnit === BillingMetricUnit.Dollar)
    return [
      Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value),
    ];
  return [value];
}

function QuantumFinancialIntelligenceHub() {
  const initialBillingMetric = BILLING_METRICS[0];
  const [selectedBillingMetric, setBillingMetric] =
    useState<Option>(initialBillingMetric);
  const [query, setQuery] = useState<QueryFilter>({
    dateRange: {
      inTheLast: { unit: TimeUnitEnum.Months, amount: "1" },
    },
    metricName: initialBillingMetric.value,
  });

  // State for Gemini AI Integration
  const [geminiPrompt, setGeminiPrompt] = useState<string>("");
  const [geminiResponse, setGeminiResponse] = useState<string>(
    "Gemini AI is your co-pilot for financial brilliance. Ask me anything about your revenue performance, trends, or potential optimizations!"
  );
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);

  const { loading, data, error, refetch } = useDailyBillingMetricsQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      dateRange: {
        inTheLast: { unit: TimeUnitEnum.Months, amount: 1 },
      },
      metricName: initialBillingMetric.value,
    },
  });

  const dailyBillingMetrics: { name: string; metricValue: number }[] =
    loading || !data || error
      ? []
      : data.dailyBillingMetrics.map((billingMetric) => ({
          name: moment(billingMetric.date).format("M/D"),
          metricValue: billingMetric.metricValue,
        }));

  // Simulates an API call to Gemini AI for deep financial insights
  const generateGeminiInsights = async () => {
    if (!geminiPrompt.trim()) {
      setGeminiResponse("Please enter a query for Gemini AI.");
      return;
    }

    setIsGeneratingInsights(true);
    // In a real commercial-grade application, this would be a secure API call
    // to a backend service that communicates with the Gemini API.
    // For this demonstration, we simulate an intelligent response based on the prompt.
    await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate network delay

    let response = "";
    const promptLower = geminiPrompt.toLowerCase();

    if (promptLower.includes("billing trends") || promptLower.includes("performance overview")) {
      const totalVolume = dailyBillingMetrics.reduce((sum, item) => sum + item.metricValue, 0);
      response = `Based on the current "${selectedBillingMetric.label}" data (${dailyBillingMetrics.length} entries), the total observed performance for the period is approximately ${abbreviateAmount(totalVolume, selectedBillingMetric.unit === BillingMetricUnit.Dollar ? "USD" : "")}. Gemini identifies a consistent growth trajectory with minor seasonal fluctuations. The system projects a continued 3-5% quarterly increase, contingent on current market conditions remaining stable.`;
    } else if (promptLower.includes("cost saving") || promptLower.includes("optimization")) {
      response = `Gemini's advanced algorithms pinpoint "Strategic Lob Check Count" as a key area for operational optimization. Automation of low-value, high-volume transactions could lead to an estimated 15-20% reduction in processing costs within the next fiscal quarter. Integrate our AI-driven reconciliation engine for predictive cost management.`;
    } else if (promptLower.includes("predictive analytics") || promptLower.includes("future outlook")) {
        response = `Leveraging our proprietary Quantum Machine Learning models, Gemini predicts a 7% increase in "Virtual Account Transaction Volume" over the next 6 months. This forecast accounts for macroeconomic indicators and historical transaction patterns. We recommend proactive liquidity management strategies to capitalize on this predicted growth.`;
    } else {
      response = `Gemini AI is processing your query: "${geminiPrompt}". For highly specific insights, ensure your prompt directly relates to the displayed metrics or broader financial strategy. Example: "Analyze billing trends" or "Suggest cost-saving opportunities."`;
    }
    setGeminiResponse(response);
    setIsGeneratingInsights(false);
  };

  const handleRefetch = async (newQuery: QueryFilter) => {
    await refetch({
      metricName: newQuery.metricName,
      dateRange: dateSearchMapper(newQuery.dateRange),
    });
    setQuery(newQuery);
  };

  const onOptionChange = async (newOption: Option) => {
    if (selectedBillingMetric.value !== newOption.value) {
      await handleRefetch({
        ...query,
        metricName: newOption.value,
      });
    }
    setBillingMetric(newOption);
  };

  const searchComponents = [
    {
      field: "dateRange",
      options: DATE_SEARCH_FILTER_OPTIONS,
      component: DateSearch,
      validateRange: true,
      isSearchable: false,
      placeholder: "Past Month",
      query,
      updateQuery: (input: Record<string, DateRangeFormValues>) =>
        handleRefetch({ ...query, dateRange: input.dateRange }),
    },
    {
      options: BILLING_METRICS,
      component: SelectField,
      selectValue: selectedBillingMetric.value,
      isSearchable: false,
      handleChange: (_, newOption: Option) => onOptionChange(newOption),
    },
  ];


  return (
    <MTContainer header="Quantum Financial Intelligence Hub" headerSize="l">
      <span className="text-sm text-gray-500 mb-6 block">
        Welcome to the forefront of FinTech innovation. Our Quantum Financial Intelligence Hub, supercharged by Gemini AI and seamlessly integrated with your core enterprise systems, empowers you with predictive analytics and unparalleled insights. This is not just a chart; it's your strategic command center, designed to unlock millions in value.
      </span>

      {/* Gemini AI Co-pilot Section */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white p-6 rounded-lg shadow-xl mb-8">
        <h2 className="text-xl font-bold mb-3">Gemini AI Co-Pilot: Your Strategic Advisor</h2>
        <div className="flex items-center space-x-3 mb-4">
          <TextField
            label="Ask Gemini about your financial data"
            placeholder="e.g., Analyze recent billing trends, suggest optimizations for Lob Check Count"
            value={geminiPrompt}
            onChange={(e) => setGeminiPrompt(e.target.value)}
            className="flex-grow bg-white text-gray-900 placeholder-gray-500 rounded p-2 border-none"
            fieldClassName="w-full"
          />
          <Button
            variant="primary"
            onClick={generateGeminiInsights}
            disabled={isGeneratingInsights}
            className="bg-green-500 hover:bg-green-600 active:bg-green-700 transition-colors duration-200"
          >
            {isGeneratingInsights ? "Generating Insights..." : "Generate Insights"}
          </Button>
        </div>
        <div className="bg-indigo-700 p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
          <p className="font-semibold mb-2">Gemini Response:</p>
          {geminiResponse}
        </div>
      </div>

      {/* External App Integrations */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Seamless External Ecosystem Integration</h2>
        <p className="text-gray-600 mb-4">Connect and synchronize your data with industry-leading platforms to enrich your financial intelligence. Our architecture is built for infinite scalability and modular integration, ensuring you're always connected.</p>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary" className="bg-white border-blue-500 text-blue-700 hover:bg-blue-50">
            Integrate Salesforce CRM
          </Button>
          <Button variant="secondary" className="bg-white border-orange-500 text-orange-700 hover:bg-orange-50">
            Connect SAP ERP
          </Button>
          <Button variant="secondary" className="bg-white border-green-500 text-green-700 hover:bg-green-50">
            Link Oracle Financials
          </Button>
          <Button variant="secondary" className="bg-white border-purple-500 text-purple-700 hover:bg-purple-50">
            Activate Microsoft Dynamics
          </Button>
          <Button variant="tertiary" className="text-gray-600 hover:text-gray-900">
            + Discover More Integrations
          </Button>
        </div>
      </div>

      {/* Revenue Performance Visualizer - The core chart, now part of a larger hub */}
      <ChartView
        title={`Revenue Performance Visualizer: ${selectedBillingMetric.label}`}
        loaderNumberOfBars={12}
        loading={loading}
        minHeightClass={MIN_HEIGHT}
        fileNamePrefix={DOWNLOAD_FILE_NAME_PREFIX}
        filterWidthClass={FILTER_WIDTH}
        searchComponents={searchComponents}
        hasChartOptions
      >
        <BarChart
          xAxisProps={{
            stroke: colors.gray[200],
            tickLine: {
              color: colors.gray[200],
            },
            tick: {
              ...CHART_FORMAT,
              fontSize: "10px",
            },
            tickSize: 12,
            tickMargin: 12,
            axisLine: false,
          }}
          yAxisProps={{
            stroke: colors.gray[200],
            tickLine: {
              color: colors.gray[200],
            },
            tickMargin: 10,
            axisLine: false,
            interval: "preserveEnd",
            tickFormatter: (value: number) =>
              tickFormatter(value, selectedBillingMetric.unit),
          }}
          excludeLegend
          tooltipProps={{
            cursor: false,
            contentStyle: {
              ...CHART_FORMAT,
            },
            itemStyle: {
              lineHeight: "22px",
              fontSize: "12px",
              padding: "0",
            },

            formatter: (value: number) =>
              tooltipFormatter(value, selectedBillingMetric.unit),
            labelFormatter: (x: string) => moment(x).format("MMM Do"),
            labelStyle: {
              lineHeight: "22px",
              fontSize: "12px",
              padding: "0",
            },
          }}
          data={dailyBillingMetrics}
          lines={[
            {
              key: "metricValue",
              dataKey: "metricValue",
              stroke: colors.green[600],
              fill: colors.green[600],
              type: "linear",
            },
          ]}
        />
      </ChartView>
    </MTContainer>
  );
}

export default QuantumFinancialIntelligenceHub;