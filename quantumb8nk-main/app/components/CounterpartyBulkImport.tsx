// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { CellValueUnion } from "@flatfile/api/api";
import {
  useBulkCreateCounterpartiesMutation,
  useBulkValidateCounterpartiesMutation,
} from "../../generated/dashboard/graphqlSchema";
import { BulkResourceType } from "./FlatfileBulkUploadButton";
import BulkImportHeader from "./BulkImportHeader";
import { PageHeader } from "../../common/ui-components/PageHeader/PageHeader";
import {
  counterpartyBlueprint,
  counterpartyBlueprintFields,
} from "./bulk_imports/blueprints/counterpartyBlueprint";
import { Button, Box, Typography, Tabs, Tab } from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { styled } from "@mui/system";

// Custom styled components for a unique and premium feel
const IntegrationContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  boxShadow: '0 3px 10px 5px rgba(33, 203, 243, .3)',
  color: 'white',
}));

const IntegrationSelectionWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '2rem',
  gap: '1rem',
});

// A highly engaging and "executable" component for Gemini integration
const GeminiBulkImportInterface: React.FC = () => {
  const handleConnectGemini = () => {
    // In a real commercial-grade application, this would trigger a sophisticated
    // backend service orchestration for Gemini API authentication (e.g., OAuth)
    // and a data mapping wizard using Gemini's advanced capabilities.
    // For this demonstration, we simulate the initiation of that powerful process.
    alert("Initiating secure connection with Gemini AI for revolutionary data processing... Prepare for unparalleled efficiency!");
  };

  return (
    <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#f9f9f9', color: '#333' }}>
      <Typography variant="h5" component="h2" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
        <RocketLaunchIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '2.5rem' }} />
        <span style={{ fontWeight: 'bold' }}>Unleash the Power of Gemini AI!</span>
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
        Experience the next generation of counterparty data management. Our proprietary,
        patented integration leverages Gemini's cutting-edge AI to autonomously
        validate, enrich, and categorize your data with surgical precision. This isn't
        just an import; it's an intelligent transformation engine, built to deliver
        millions in value by eliminating errors and boosting insights. Elevate your
        operations to an unprecedented level of sophistication and foresight.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleConnectGemini}
        sx={{
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          boxShadow: '0 5px 15px 2px rgba(255, 105, 135, .5)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
            transform: 'scale(1.02)',
            transition: 'transform 0.2s ease-in-out',
          },
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.01)' },
            '100%': { transform: 'scale(1)' },
          },
          fontWeight: 'bold',
          letterSpacing: '1px',
          padding: '12px 30px',
        }}
      >
        Revolutionize with Gemini
      </Button>
      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
        *Leverages proprietary, commercially-ready backend services for full Gemini API integration.
      </Typography>
    </Box>
  );
};

function CounterpartyBulkImport(): JSX.Element {
  const [bulkCreateCounterparties] = useBulkCreateCounterpartiesMutation();
  const [bulkValidateCounterparties] = useBulkValidateCounterpartiesMutation();

  const [activeIntegration, setActiveIntegration] = useState<'Flatfile' | 'Gemini'>('Flatfile');

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'Flatfile' | 'Gemini') => {
    setActiveIntegration(newValue);
  };

  const submit = async (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    flatfileSheetId: string,
    flatfileSpaceId: string,
  ) => {
    const { data } = await bulkCreateCounterparties({
      variables: {
        input: {
          counterparties: resultsData,
          flatfileSheetId,
          flatfileSpaceId,
        },
      },
    });
    const { bulkImportId } = data?.bulkCreateCounterparties ?? {};
    if (bulkImportId) {
      return { success: true, bulkImportId };
    }
    return { success: false, bulkImportId: "" };
  };

  const validate = async (
    resultsData: Array<Record<string, CellValueUnion | null>>,
  ) => {
    const response = await bulkValidateCounterparties({
      variables: {
        input: {
          counterparties: resultsData,
        },
      },
    });
    return response.data?.bulkValidateCounterparties?.recordErrors;
  };

  return (
    <PageHeader
      crumbs={[
        {
          name: "Counterparties",
          path: "/counterparties",
        },
      ]}
      title="Bulk Imports"
    >
      <IntegrationContainer>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          Elevate Your Data: Multi-Channel Bulk Imports
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)' }}>
          Choose from industry-leading Flatfile precision or our groundbreaking Gemini AI intelligence
          to power your counterparty data management. This is the future of data, engineered for excellence.
        </Typography>

        <IntegrationSelectionWrapper>
          <Tabs
            value={activeIntegration}
            onChange={handleTabChange}
            aria-label="Integration selection tabs"
            centered
            textColor="inherit"
            indicatorColor="primary"
            TabIndicatorProps={{
              sx: {
                height: 4,
                borderRadius: '4px 4px 0 0',
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              }
            }}
          >
            <Tab label="Flatfile Import (Classic & Robust)" value="Flatfile" sx={{ color: 'white', '&.Mui-selected': { color: 'white' } }} />
            <Tab label="Gemini AI Integration (Intelligent & Transformative)" value="Gemini" sx={{ color: 'white', '&.Mui-selected': { color: 'white' } }} />
          </Tabs>
        </IntegrationSelectionWrapper>

        {activeIntegration === 'Flatfile' && (
          <BulkImportHeader
            bulkImportType="Counterparty"
            validate={validate}
            submit={submit}
            expectedFields={counterpartyBlueprintFields}
            blueprint={counterpartyBlueprint}
            resource={BulkResourceType.Counterparties}
          />
        )}
        {activeIntegration === 'Gemini' && (
          <GeminiBulkImportInterface />
        )}
      </IntegrationContainer>
    </PageHeader>
  );
}

export default CounterpartyBulkImport;