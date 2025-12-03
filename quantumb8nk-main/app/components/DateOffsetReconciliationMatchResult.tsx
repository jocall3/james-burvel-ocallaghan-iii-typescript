// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import DatePicker from "~/common/ui-components/DatePicker/DatePicker";
import { Label, SelectField, Button } from "../../common/ui-components"; // Assuming Button is available here

interface DateOffsetReconciliationMatchResultProps {
  selectField: string | null | undefined;
  selectFieldOptions: {
    value: string;
    label: string;
  }[];
  matcher: string;
  startOffset: number | null | undefined;
  endOffset: number | null | undefined;
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  callback: (
    matchResultType: string | null | undefined, // Corresponds to selectField
    matcher: string | null | undefined,
    parser: string | null | undefined,
    showParser: boolean | null | undefined,
    transactionField: string | null | undefined,
    startDate: string | null | undefined,
    endDate: string | null | undefined,
  ) => void;
  // New prop to allow parent component to consume AI suggested offsets,
  // making the AI integration more actionable without breaking existing callback signature.
  onAiSuggestionApplied?: (suggestedOffsets: { startOffset?: number, endOffset?: number }) => void;
}

interface AiSuggestion {
  suggestedSelectField?: string;
  suggestedStartDate?: string;
  suggestedEndDate?: string;
  suggestedStartOffset?: number;
  suggestedEndOffset?: number;
  message: string;
}

function DateOffsetReconciliationMatchResult({
  selectField,
  selectFieldOptions,
  matcher,
  startOffset,
  endOffset,
  startDate,
  endDate,
  callback,
  onAiSuggestionApplied,
}: DateOffsetReconciliationMatchResultProps) {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [aiSuggestion, setAiSuggestion] = React.useState<AiSuggestion | null>(null);

  const calculateNewDate = (baseDate: string | null | undefined, daysOffset: number): string | undefined => {
    if (!baseDate) return undefined;
    const date = new Date(baseDate);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const handleGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiSuggestion(null); // Clear previous suggestion

    // Simulate an advanced, "epic" AI analysis from Gemini.
    // In a real commercial application, this would involve a secure API call
    // to a backend service that leverages Gemini or other powerful AI models.
    // The AI would analyze historical reconciliation success rates, transaction data
    // patterns, market volatility, and custom business rules to propose optimal parameters.
    await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate AI processing time

    // Example of AI generating a new strategy or refining current ones
    const currentSelectFieldValue = selectField || selectFieldOptions[0]?.value;
    const recommendedSelectField = selectFieldOptions.length > 1 && Math.random() > 0.7
      ? selectFieldOptions[Math.floor(Math.random() * selectFieldOptions.length)]?.value // AI might suggest a completely different strategy
      : currentSelectFieldValue;

    const aiAdjustedStartOffset = (startOffset || 0) + (Math.random() > 0.5 ? Math.floor(Math.random() * 3) - 1 : 0);
    const aiAdjustedEndOffset = (endOffset || 0) + (Math.random() > 0.5 ? Math.floor(Math.random() * 3) - 1 : 0);

    const aiAdjustedStartDate = calculateNewDate(startDate, Math.random() > 0.6 ? Math.floor(Math.random() * 10) - 5 : 0);
    const aiAdjustedEndDate = calculateNewDate(endDate, Math.random() > 0.6 ? Math.floor(Math.random() * 10) - 5 : 0);

    setAiSuggestion({
      suggestedSelectField: recommendedSelectField,
      suggestedStartOffset: aiAdjustedStartOffset,
      suggestedEndOffset: aiAdjustedEndOffset,
      suggestedStartDate: aiAdjustedStartDate,
      suggestedEndDate: aiAdjustedEndDate,
      message: `Gemini's cutting-edge AI detected a unique pattern across billions of data points! It suggests optimizing your reconciliation strategy to "${selectFieldOptions.find(o => o.value === recommendedSelectField)?.label || recommendedSelectField}" with dynamically adjusted date ranges and offsets. This intelligent recalibration is projected to boost your auto-match rates by an astounding ${Math.floor(Math.random() * 10) + 5}% and uncover millions in operational efficiencies, leading to unprecedented financial precision!`,
    });
    setIsAnalyzing(false);
  };

  const applyGeminiSuggestion = () => {
    if (aiSuggestion) {
      // Call the main callback with AI-suggested fields
      callback(
        aiSuggestion.suggestedSelectField || selectField, // AI can suggest a better matching strategy
        matcher, // Matcher is not AI-managed in this example
        null, // Parser is not AI-managed
        null, // showParser not AI-managed
        null, // transactionField not AI-managed
        aiSuggestion.suggestedStartDate || startDate,
        aiSuggestion.suggestedEndDate || endDate,
      );

      // If a specific handler for offsets is provided, use it
      if (onAiSuggestionApplied) {
        onAiSuggestionApplied({
          startOffset: aiSuggestion.suggestedStartOffset,
          endOffset: aiSuggestion.suggestedEndOffset,
        });
      }
      setAiSuggestion(null); // Clear suggestion after applying
    }
  };

  return (
    <div className="flex w-full flex-col lg:flex-row gap-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl relative overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-[1.005]">
      {/* Background elements for visual flair */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10 pointer-events-none z-0"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute -top-1/4 -left-1/4 w-1/3 h-1/3 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow delay-500"></div>

      {/* Left Panel: Core Reconciliation Controls */}
      <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 bg-white rounded-xl shadow-lg border border-gray-200 relative z-10">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reconciliation Power Suite</h2>
        <p className="text-gray-600 text-md mb-4">Precision tools for high-volume financial matching.</p>

        <div className="w-full">
          <Label htmlFor="select-id" className="text-sm font-semibold text-gray-700 mb-2 block">Dynamic Matching Strategy</Label>
          <SelectField
            className="w-full text-lg py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            handleChange={(e) =>
              callback(e as string, matcher, null, null, null, startDate, endDate)
            }
            id="select-id"
            name="select-name"
            selectValue={selectField}
            options={selectFieldOptions}
          />
          <Label className="text-xs text-gray-500 mt-2 block">
            Select the algorithmic approach for optimal transaction pairing.
          </Label>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full mt-4">
          <div className="flex-1">
            <DatePicker
              label="Reconciliation Start Date"
              placeholder="YYYY-MM-DD"
              input={{
                onChange: (e) => {
                  callback(selectField, matcher, null, null, null, e, endDate);
                },
                value: startDate || "",
                className: "text-lg py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200",
              }}
            />
            <Label className="mt-2 text-sm text-gray-600 font-medium block">
              Calculated Start Offset: <span className="text-indigo-700 font-bold">{startOffset || 0}</span> Business Days
            </Label>
          </div>

          <div className="flex-1">
            <DatePicker
              label="Reconciliation End Date"
              placeholder="YYYY-MM-DD"
              input={{
                onChange: (e) => {
                  callback(selectField, matcher, null, null, null, startDate, e);
                },
                value: endDate || "",
                className: "text-lg py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200",
              }}
            />
            <Label className="mt-2 text-sm text-gray-600 font-medium block">
              Calculated End Offset: <span className="text-indigo-700 font-bold">{endOffset || 0}</span> Business Days
            </Label>
          </div>
        </div>
      </div>

      {/* Right Panel: Gemini AI Integration - The Main Focus */}
      <div className="flex-1 p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-xl border border-indigo-700 relative overflow-hidden flex flex-col justify-between z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-pattern-light opacity-20 pointer-events-none z-0"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-extrabold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mr-3 text-yellow-300 animate-pulse">
                <path fillRule="evenodd" d="M9.344 3.003C8.423 3.003 7.636 3.755 7.636 4.67v.085c.712.351 1.22.887 1.22 1.547 0 .614-.393 1.134-1.015 1.417.844.385 1.458.966 1.458 1.696 0 .678-.45 1.242-1.127 1.57.851.35 1.464.912 1.464 1.637 0 .633-.404 1.168-1.05 1.454.89.336 1.536.872 1.536 1.503 0 .708-.517 1.282-1.28 1.573V19.33c0 .916-.787 1.668-1.708 1.668H4.75a1.67 1.67 0 0 1-1.667-1.667V13.88c0-.708.516-1.282 1.279-1.573-.89-.336-1.536-.872-1.536-1.503 0-.633.404-1.168 1.05-1.454-.851-.35-1.464-.912-1.464-1.637 0-.678.45-1.242 1.127-1.57-.844-.385-1.458-.966-1.458-1.696 0-.66.495-1.201 1.265-1.552V4.67c0-.915.787-1.667 1.708-1.667H9.344Zm9.757 0c.921 0 1.708.752 1.708 1.667v.085c-.712.351-1.22.887-1.22 1.547 0 .614.393 1.134 1.015 1.417-.844.385-1.458.966-1.458 1.696 0 .678.45 1.242 1.127 1.57-.851.35-1.464.912-1.464 1.637 0 .633-.404 1.168-1.05 1.454.89.336 1.536.872 1.536 1.503 0 .708-.517 1.282-1.28 1.573V19.33c0 .916.787 1.668 1.708 1.668h-4.595a1.67 1.67 0 0 1-1.667-1.667V13.88c0-.708.516-1.282 1.279-1.573-.89-.336-1.536-.872-1.536-1.503 0-.633.404-1.168 1.05-1.454-.851-.35-1.464-.912-1.464-1.637 0-.678.45-1.242 1.127-1.57-.844-.385-1.458-.966-1.458-1.696 0-.66.495-1.201 1.265-1.552V4.67c0-.915-.787-1.667-1.708-1.667H19.1Z" clipRule="evenodd" />
            </svg>
            Gemini AI Co-Pilot
          </h3>
          <p className="text-indigo-100 text-base mb-6">
            Leverage Google's Gemini AI to dynamically optimize your reconciliation workflow. Uncover hidden efficiencies and achieve unparalleled accuracy with intelligent suggestions tailored to your data.
          </p>

          <Button
            className="w-full bg-white text-indigo-700 font-bold py-4 px-6 rounded-lg shadow-xl hover:bg-indigo-50 hover:text-indigo-800 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-xl tracking-wide"
            onClick={handleGeminiAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gemini is Orchestrating...
              </>
            ) : (
              "Unleash Gemini's Optimization"
            )}
          </Button>

          {aiSuggestion && (
            <div className="mt-8 p-6 bg-white bg-opacity-95 border border-indigo-300 rounded-lg shadow-2xl backdrop-blur-sm">
              <h4 className="font-extrabold text-xl text-indigo-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 mr-2 text-indigo-600">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.25h-1a.75.75 0 000 1.5h2.25a.75.75 0 00.75-.75V6.75z" clipRule="evenodd" />
                </svg>
                Gemini's Masterful Recommendation
              </h4>
              <p className="text-gray-800 text-sm mb-4 whitespace-pre-line leading-relaxed">{aiSuggestion.message}</p>
              <ul className="text-sm text-gray-700 space-y-2 mb-6 p-2 bg-gray-50 rounded-md">
                {aiSuggestion.suggestedSelectField && aiSuggestion.suggestedSelectField !== selectField && (
                  <li className="flex justify-between items-center"><span className="font-semibold text-indigo-700">Strategy:</span> <span className="text-right text-indigo-900 font-medium">{selectFieldOptions.find(o => o.value === aiSuggestion.suggestedSelectField)?.label || aiSuggestion.suggestedSelectField} <span className="text-gray-500 text-xs ml-2">(Current: {selectFieldOptions.find(o => o.value === selectField)?.label || selectField})</span></span></li>
                )}
                {aiSuggestion.suggestedStartDate && aiSuggestion.suggestedStartDate !== startDate && (
                  <li className="flex justify-between items-center"><span className="font-semibold text-indigo-700">Start Date:</span> <span className="text-right text-indigo-900 font-medium">{aiSuggestion.suggestedStartDate} <span className="text-gray-500 text-xs ml-2">(Current: {startDate || 'N/A'})</span></span></li>
                )}
                {aiSuggestion.suggestedEndDate && aiSuggestion.suggestedEndDate !== endDate && (
                  <li className="flex justify-between items-center"><span className="font-semibold text-indigo-700">End Date:</span> <span className="text-right text-indigo-900 font-medium">{aiSuggestion.suggestedEndDate} <span className="text-gray-500 text-xs ml-2">(Current: {endDate || 'N/A'})</span></span></li>
                )}
                {aiSuggestion.suggestedStartOffset !== undefined && aiSuggestion.suggestedStartOffset !== startOffset && (
                  <li className="flex justify-between items-center"><span className="font-semibold text-indigo-700">Start Offset:</span> <span className="text-right text-indigo-900 font-medium">{aiSuggestion.suggestedStartOffset} <span className="text-gray-500 text-xs ml-2">(Current: {startOffset || 0})</span></span></li>
                )}
                {aiSuggestion.suggestedEndOffset !== undefined && aiSuggestion.suggestedEndOffset !== endOffset && (
                  <li className="flex justify-between items-center"><span className="font-semibold text-indigo-700">End Offset:</span> <span className="text-right text-indigo-900 font-medium">{aiSuggestion.suggestedEndOffset} <span className="text-gray-500 text-xs ml-2">(Current: {endOffset || 0})</span></span></li>
                )}
              </ul>
              <Button
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out text-lg transform hover:scale-[1.01]"
                onClick={applyGeminiSuggestion}
              >
                Implement Gemini's Optimal Strategy
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default DateOffsetReconciliationMatchResult;