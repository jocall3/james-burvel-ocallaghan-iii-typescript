// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, FormProvider, SubmitHandler, useController, useFormContext } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Label, FieldGroup, Button } from "../../common/ui-components"; // Assuming a generic Button component exists
import "./AddressForm.css"; // A new CSS file for styling the "epic" experience.

// --- addressService.ts (Simulated External API Layer) ---
// This file simulates an external address validation/geocoding/autocomplete service.
// In a real application, this would make actual API calls to services like
// Google Places API, a dedicated address validation API, or a custom backend
// that integrates with LLMs like Gemini for enrichment.

interface AddressPrediction {
  id: string;
  description: string;
  matched_substrings?: { offset: number; length: number }[];
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings?: { offset: number; length: number }[];
  };
}

interface GeocodedLocation {
  latitude: number;
  longitude: number;
}

interface ValidatedAddress {
  line1: string;
  line2?: string;
  locality: string; // City
  region: string; // State/Province
  postal_code: string;
  country: string; // Country Code
  latitude?: number;
  longitude?: number;
  validationInsights?: string[]; // AI-powered insights/corrections
  is_valid: boolean;
  standardized_address: string;
}

const MOCK_ADDRESSES = [
  {
    line1: "1600 Amphitheatre Pkwy",
    locality: "Mountain View",
    region: "CA",
    postal_code: "94043",
    country: "US",
    latitude: 37.4220,
    longitude: -122.0841,
    standardized_address: "1600 Amphitheatre Pkwy, Mountain View, CA 94043, US"
  },
  {
    line1: "1 Infinite Loop",
    locality: "Cupertino",
    region: "CA",
    postal_code: "95014",
    country: "US",
    latitude: 37.3318,
    longitude: -122.0312,
    standardized_address: "1 Infinite Loop, Cupertino, CA 95014, US"
  },
  {
    line1: "10 Downing St",
    locality: "London",
    region: "England",
    postal_code: "SW1A 2AA",
    country: "GB",
    latitude: 51.5034,
    longitude: -0.1276,
    standardized_address: "10 Downing St, London SW1A 2AA, UK"
  },
  {
    line1: "21 Rue de Rivoli",
    locality: "Paris",
    region: "Ile-de-France",
    postal_code: "75004",
    country: "FR",
    latitude: 48.8576,
    longitude: 2.3533,
    standardized_address: "21 Rue de Rivoli, 75004 Paris, France"
  },
  {
    line1: "Burj Khalifa",
    locality: "Dubai",
    region: "Dubai",
    postal_code: "50000",
    country: "AE",
    latitude: 25.1972,
    longitude: 55.2744,
    standardized_address: "Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd - Downtown Dubai - Dubai - United Arab Emirates"
  }
];

const simulateNetworkDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const addressService = {
  /**
   * Simulates AI-powered address auto-completion.
   * In a real app, this would query Google Places API, OpenCage, etc.
   * @param query User's input string.
   */
  async autocompleteAddress(query: string): Promise<AddressPrediction[]> {
    await simulateNetworkDelay();
    if (!query || query.length < 3) return [];
    const lowerQuery = query.toLowerCase();

    return MOCK_ADDRESSES.filter(addr =>
      addr.standardized_address.toLowerCase().includes(lowerQuery)
    ).map((addr, index) => ({
      id: `pred-${index}-${Math.random().toString(36).substr(2, 9)}`,
      description: addr.standardized_address,
      structured_formatting: {
        main_text: addr.line1,
        secondary_text: `${addr.locality}, ${addr.region}, ${addr.country}`,
      },
    }));
  },

  /**
   * Simulates AI-powered address validation and standardization.
   * Could leverage Gemini for semantic understanding, typo correction, and enrichment.
   * @param address The address object to validate.
   */
  async validateAndStandardizeAddress(address: Partial<ValidatedAddress>): Promise<ValidatedAddress> {
    await simulateNetworkDelay(500);

    const fullAddress = `${address.line1 || ''} ${address.line2 || ''} ${address.locality || ''} ${address.region || ''} ${address.postal_code || ''} ${address.country || ''}`.trim();
    const lowerFullAddress = fullAddress.toLowerCase();

    const matchedAddress = MOCK_ADDRESSES.find(addr =>
      addr.standardized_address.toLowerCase().includes(lowerFullAddress) ||
      (address.line1 && lowerFullAddress.includes(addr.line1.toLowerCase()) &&
       address.locality && lowerFullAddress.includes(addr.locality.toLowerCase()))
    );

    if (matchedAddress) {
      return {
        ...address,
        ...matchedAddress, // Overwrite with standardized data
        is_valid: true,
        validationInsights: ["Address successfully validated and standardized by AI."],
        standardized_address: matchedAddress.standardized_address
      } as ValidatedAddress;
    } else {
      // Simulate Gemini-like suggestions/corrections
      let insights: string[] = [];
      let correctedAddress: Partial<ValidatedAddress> = { ...address };
      let isValid = true; // Assume plausible if components exist

      if (!address.line1 && (address.locality || address.postal_code)) {
         insights.push("Gemini suggests adding a street number and name for better accuracy.");
         isValid = false;
      }
      if (address.locality && address.locality.toLowerCase() === 'london' && address.country?.toLowerCase() !== 'gb' && address.country !== 'US') {
          insights.push("Gemini suggests 'London' might be in the UK. Did you mean 'London, GB'?");
          correctedAddress.country = 'GB';
          correctedAddress.region = correctedAddress.region || 'England';
      }
      if (address.postal_code && address.country === 'US' && !/^\d{5}(-\d{4})?$/.test(address.postal_code)) {
          insights.push("Postal code format seems incorrect for US. Expecting ##### or #####-####.");
          isValid = false;
      }
      if (address.country && address.country.length !== 2) {
          insights.push("Country code should be 2 letters (e.g., US, GB). Gemini offers 'United States' for 'USA'.");
          isValid = false;
      }
      if (!address.line1 && !address.locality && !address.country) {
          insights.push("Please provide more address details for a comprehensive AI validation.");
          isValid = false;
      } else if (insights.length === 0) {
        insights.push("Gemini finds no exact match but components seem plausible. Consider a map check!");
      }

      return {
        ...address,
        ...correctedAddress,
        is_valid: isValid,
        validationInsights: insights,
        standardized_address: fullAddress, // Return original if not fully matched
      };
    }
  },

  /**
   * Simulates geocoding an address.
   * @param address The address object to geocode.
   */
  async geocodeAddress(address: Partial<ValidatedAddress>): Promise<GeocodedLocation | null> {
    await simulateNetworkDelay(400);

    const fullAddress = `${address.line1 || ''} ${address.locality || ''} ${address.region || ''} ${address.country || ''}`.trim();
    const lowerFullAddress = fullAddress.toLowerCase();

    const matchedAddress = MOCK_ADDRESSES.find(addr =>
      addr.standardized_address.toLowerCase().includes(lowerFullAddress) ||
      (address.line1 && lowerFullAddress.includes(addr.line1.toLowerCase()) &&
       address.locality && lowerFullAddress.includes(addr.locality.toLowerCase()))
    );

    if (matchedAddress && matchedAddress.latitude && matchedAddress.longitude) {
      return { latitude: matchedAddress.latitude, longitude: matchedAddress.longitude };
    }

    // Fallback for non-mocked addresses (simulated imprecise geocoding)
    if (address.latitude && address.longitude) {
      return { latitude: address.latitude, longitude: address.longitude };
    }

    // Default to a central point if nothing matches for a generic "epic" feel
    if (address.country === 'US') {
        return { latitude: 39.8283, longitude: -98.5795 }; // Center of US
    } else if (address.country === 'GB') {
        return { latitude: 54.5260, longitude: -0.7865 }; // Center of UK
    } else if (address.country === 'FR') {
        return { latitude: 46.2276, longitude: 2.2137 }; // Center of France
    } else if (address.country === 'AE') {
        return { latitude: 23.4241, longitude: 53.8478 }; // Center of UAE
    }

    return null; // Could not geocode
  },

  /**
   * Simulates fetching countries.
   */
  async fetchCountries(): Promise<{ code: string; name: string }[]> {
    await simulateNetworkDelay(100);
    return [
      { code: "US", name: "United States" },
      { code: "CA", name: "Canada" },
      { code: "GB", name: "United Kingdom" },
      { code: "FR", name: "France" },
      { code: "DE", name: "Germany" },
      { code: "AE", name: "United Arab Emirates" },
      { code: "AU", name: "Australia" },
      { code: "JP", name: "Japan" },
      { code: "CN", name: "China" },
      // ... more countries for a global feel
    ];
  }
};

// --- SmartAddressInput.tsx (Custom Input Component with Autocomplete & AI Hints) ---

interface SmartAddressInputProps {
  name: string;
  label: string;
  placeholder?: string;
  isDisabled?: boolean;
  type?: "text" | "select";
  onAddressChange?: (field: string, value: string) => void;
  isMainAutocompleteField?: boolean; // Indicates if this field drives the full address autocomplete
  options?: { value: string; label: string }[]; // For select fields
}

// A simple debounce hook (can be replaced by a library like 'use-debounce')
const useDebounceHook = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


const SmartAddressInput: React.FC<SmartAddressInputProps> = ({
  name,
  label,
  placeholder,
  isDisabled,
  type = "text",
  onAddressChange,
  isMainAutocompleteField = false,
  options,
}) => {
  const { field, fieldState } = useController({ name });
  const { setValue, trigger, getValues } = useFormContext();
  const [suggestions, setSuggestions] = useState<{ id: string; description: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedValue = useDebounceHook(field.value, 500);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMainAutocompleteField && typeof debouncedValue === 'string' && debouncedValue.length > 2) {
      setIsLoading(true);
      addressService.autocompleteAddress(debouncedValue).then(preds => {
        setSuggestions(preds);
        setIsLoading(false);
      }).catch(error => {
        console.error("Autocomplete error:", error);
        setIsLoading(false);
      });
    } else {
      setSuggestions([]);
    }
  }, [debouncedValue, isMainAutocompleteField]);

  const handleSelectSuggestion = useCallback(async (description: string) => {
    setIsLoading(true);
    // In a real app, this would query a backend for full address details based on the prediction ID
    const validated = await addressService.validateAndStandardizeAddress({ standardized_address: description });

    if (validated) {
        // Assuming the form structure is flat for address fields (e.g., 'line1', 'locality')
        // We set all relevant fields based on the validated result.
        setValue('line1', validated.line1 || '', { shouldValidate: true });
        setValue('line2', validated.line2 || '', { shouldValidate: true });
        setValue('locality', validated.locality || '', { shouldValidate: true });
        setValue('region', validated.region || '', { shouldValidate: true });
        setValue('postal_code', validated.postal_code || '', { shouldValidate: true });
        setValue('country', validated.country || '', { shouldValidate: true });

        trigger(); // Re-validate the entire form
    }
    setIsLoading(false);
    setSuggestions([]);
    setIsFocused(false);
  }, [setValue, trigger]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    field.onChange(e);
    onAddressChange?.(name, e.target.value);
  };

  const inputComponent = type === "select" ? (
    <select
      {...field}
      id={name}
      disabled={isDisabled}
      className={`form-field ${fieldState.error ? "error" : ""}`}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        field.onBlur();
        setTimeout(() => { // Small delay to allow click on suggestion if it exists
            if (!suggestionsRef.current?.contains(document.activeElement)) {
                setIsFocused(false);
            }
        }, 100);
      }}
      onChange={handleChange}
    >
      <option value="">{placeholder || `Select ${label}`}</option>
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ) : (
    <input
      {...field}
      ref={inputRef}
      id={name}
      type={type}
      placeholder={placeholder || label}
      disabled={isDisabled}
      className={`form-field ${fieldState.error ? "error" : ""}`}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        field.onBlur();
        setTimeout(() => {
            if (!suggestionsRef.current?.contains(document.activeElement)) {
                setIsFocused(false);
            }
        }, 100);
      }}
      onChange={handleChange}
    />
  );

  return (
    <FieldGroup className="smart-address-input-group">
      <Label htmlFor={name}>{label}</Label>
      {inputComponent}
      {isLoading && isFocused && (isMainAutocompleteField || type === "text") && (
        <div className="autocomplete-loader">Loading suggestions...</div>
      )}
      {isFocused && suggestions.length > 0 && (isMainAutocompleteField || type === "text") && (
        <div ref={suggestionsRef} className="autocomplete-dropdown">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="autocomplete-item"
              onMouseDown={(e) => { // Use onMouseDown to prevent blur before click registers
                e.preventDefault(); // Prevent input from losing focus immediately
                handleSelectSuggestion(suggestion.description);
              }}
            >
              {suggestion.description}
            </div>
          ))}
        </div>
      )}
      {fieldState.error && (
        <p className="error-message">{fieldState.error.message}</p>
      )}
    </FieldGroup>
  );
};

// --- AddressMapPreview.tsx (Map Component) ---

// Fix for default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface AddressMapPreviewProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
}

const AddressMapPreview: React.FC<AddressMapPreviewProps> = ({ latitude, longitude, zoom = 13 }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2); // Initial view
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && latitude !== undefined && longitude !== undefined) {
      const newLatLng = new L.LatLng(latitude, longitude);

      // Update marker
      if (markerRef.current) {
        markerRef.current.setLatLng(newLatLng);
      } else {
        markerRef.current = L.marker(newLatLng).addTo(mapInstanceRef.current);
      }

      // Center map on new location
      mapInstanceRef.current.setView(newLatLng, zoom);
    } else if (mapInstanceRef.current && markerRef.current) {
      // If coordinates are removed, remove the marker
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
      mapInstanceRef.current.setView([0,0], 2); // Reset view
    }
  }, [latitude, longitude, zoom]);

  return <div ref={mapRef} style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}></div>;
};

// --- AddressForm.tsx (Main Component) ---

interface AddressFormData {
  line1: string;
  line2?: string;
  locality: string; // City
  region: string; // State/Province
  postal_code: string;
  country: string; // Country Code
  latitude?: number;
  longitude?: number;
}

interface AddressFormProps {
  fieldName: string;
  isDisabled?: boolean;
  initialAddress?: Partial<AddressFormData>;
  addressName: string;
  shouldValidate?: boolean;
  onSubmitSuccess?: (data: AddressFormData) => void;
  onDeepIntegrationTrigger?: (address: AddressFormData) => void; // For external app integration like a CRM or a detailed AI service
}

// Define the validation schema using yup
const addressSchema = yup.object().shape({
  line1: yup.string().required("Address Line 1 is required").min(3, "Must be at least 3 characters"),
  line2: yup.string().nullable(),
  locality: yup.string().required("City is required"),
  region: yup.string().required("State/Province is required"),
  postal_code: yup.string().required("Postal Code is required").matches(/^[a-zA-Z0-9 -]+$/, "Invalid postal code format (e.g. 90210 or SW1A 2AA)"),
  country: yup.string().required("Country is required"),
  latitude: yup.number().nullable().optional(),
  longitude: yup.number().nullable().optional(),
});

function AddressForm({
  fieldName, // Retained for compatibility but less critical with flat structure
  isDisabled,
  initialAddress,
  addressName, // Retained for compatibility
  shouldValidate = true, // Default to true for modern forms
  onSubmitSuccess,
  onDeepIntegrationTrigger,
}: AddressFormProps) {
  const methods = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: initialAddress,
    mode: "onBlur", // Validate on blur for better UX
  });

  const { handleSubmit, watch, setValue, getValues, formState: { isSubmitting } } = methods;

  // Watch all address fields to trigger geocoding and validation dynamically
  const watchedAddress = watch(["line1", "line2", "locality", "region", "postal_code", "country"]);
  const currentAddress: Partial<AddressFormData> = {
    line1: watchedAddress[0],
    line2: watchedAddress[1],
    locality: watchedAddress[2],
    region: watchedAddress[3],
    postal_code: watchedAddress[4],
    country: watchedAddress[5],
  };

  const [geocodedCoords, setGeocodedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [validationInsights, setValidationInsights] = useState<string[]>([]);
  const [countries, setCountries] = useState<{ value: string; label: string }[]>([]);

  // Fetch countries on component mount
  useEffect(() => {
    addressService.fetchCountries().then(data => {
      setCountries(data.map(c => ({ value: c.code, label: c.name })));
    });
  }, []);

  // Effect to geocode and validate address as it changes (debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Only trigger if at least some core parts of the address are present
      if (currentAddress.line1 || currentAddress.locality || currentAddress.country) {
        // AI-powered validation and insights first
        const validatedResult = await addressService.validateAndStandardizeAddress(currentAddress);
        setValidationInsights(validatedResult.validationInsights || []);

        // Geocoding based on (potentially AI-corrected) address
        const geoResult = await addressService.geocodeAddress({
          line1: validatedResult.line1,
          locality: validatedResult.locality,
          region: validatedResult.region,
          country: validatedResult.country,
          postal_code: validatedResult.postal_code,
        });

        setGeocodedCoords(geoResult);
        if (geoResult) {
            setValue('latitude', geoResult.latitude, { shouldDirty: true });
            setValue('longitude', geoResult.longitude, { shouldDirty: true });
        } else {
            setValue('latitude', undefined, { shouldDirty: true });
            setValue('longitude', undefined, { shouldDirty: true });
        }
      } else {
        setGeocodedCoords(null);
        setValidationInsights([]);
        setValue('latitude', undefined, { shouldDirty: true });
        setValue('longitude', undefined, { shouldDirty: true });
      }
    }, 1000); // Debounce geocoding and validation to avoid excessive API calls

    return () => clearTimeout(delayDebounceFn);
  }, [currentAddress, setValue]);

  const onSubmit: SubmitHandler<AddressFormData> = async (data) => {
    console.log("Address Form Submitted:", data);
    // Simulate a successful submission
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSubmitSuccess?.(data);

    // Trigger deep integration with external apps like a hypothetical "Gemini Address Analyzer"
    if (onDeepIntegrationTrigger) {
        onDeepIntegrationTrigger(data);
    }
  };

  // Function to simulate a "Gemini-powered Deep Analysis"
  const handleDeepAnalysis = async () => {
      const currentFullAddress = getValues();
      if (onDeepIntegrationTrigger) {
          console.log("Triggering deep Gemini analysis for:", currentFullAddress);
          onDeepIntegrationTrigger(currentFullAddress); // Pass to a parent handler
      } else {
          alert("Initiating Gemini-powered deep address analysis... (check console)");
          console.log("Gemini is analyzing the address for historical context, delivery challenges, economic insights, and more:", currentFullAddress);
          setValidationInsights(prev => [...prev, "Gemini has initiated a deep-dive analysis. Results coming soon to your dashboard!"]);
      }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="address-form-epic">
        <h2>Intelligent Address Entry <span className="gemini-tag">Powered by Gemini & AI</span></h2>
        <p className="form-description">
          Enter your address with unparalleled precision. Our AI-powered system provides real-time validation,
          predictive auto-completion, and insightful suggestions to ensure ultimate accuracy and streamline operations.
        </p>

        <div className="subsection-row">
          <SmartAddressInput
            name="line1"
            label="Address Line 1"
            placeholder="Street address, P.O. Box, company name, c/o"
            isDisabled={isDisabled}
            isMainAutocompleteField={true} // This field will trigger global autocomplete
          />
          <SmartAddressInput
            name="line2"
            label="Address Line 2"
            placeholder="Apartment, suite, unit, building, floor, etc."
            isDisabled={isDisabled}
          />
        </div>
        <div className="subsection-row">
          <SmartAddressInput
            name="locality"
            label="City"
            placeholder="City"
            isDisabled={isDisabled}
          />
          <SmartAddressInput
            name="region"
            label="State / Province"
            placeholder="State or Province"
            isDisabled={isDisabled}
          />
        </div>

        <div className="subsection-row">
          <SmartAddressInput
            name="postal_code"
            label="Postal Code"
            placeholder="Postal Code"
            isDisabled={isDisabled}
          />
          <SmartAddressInput
            name="country"
            label="Country"
            placeholder="Select a country"
            isDisabled={isDisabled}
            options={countries} // Pass fetched countries to the select input
            type="select" // Indicate it's a select field
          />
        </div>

        {validationInsights.length > 0 && (
          <div className="gemini-insights-card">
            <h3><span className="gemini-icon">✨</span> AI Powered Address Insights:</h3>
            <ul>
              {validationInsights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {geocodedCoords && (
          <div className="map-preview-section">
            <h3>Geocoded Location Preview</h3>
            <AddressMapPreview
              latitude={geocodedCoords.latitude}
              longitude={geocodedCoords.longitude}
            />
             <p className="map-description">
              <span className="gemini-icon">🌐</span> Visualizing your address for ultimate clarity.
              AI ensures pinpoint accuracy, reducing delivery errors and optimizing logistics.
            </p>
          </div>
        )}

        <div className="form-actions">
          <Button
            type="submit"
            disabled={isSubmitting || isDisabled}
            className="submit-button"
          >
            {isSubmitting ? "Processing..." : "Validate & Save Address"}
          </Button>
          <Button
            type="button"
            onClick={handleDeepAnalysis}
            disabled={isDisabled}
            className="deep-analysis-button"
          >
            <span className="gemini-icon">🧠</span> Gemini Deep Analysis
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default AddressForm;