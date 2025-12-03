import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, Outlet } from "react-router-dom";
import axios from "axios";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { v4 as uuidv4 } from "uuid";
import {
  RiDashboardLine, RiSettings3Line, RiUserLine, RiLoginBoxLine, RiChat1Line, RiPlugLine, RiMoneyDollarBoxLine, RiPieChartLine, RiCustomerService2Line, RiMailLine, RiProjector2Line, RiBugLine, RiCloudLine, RiGithubFill, RiSlackFill, RiBuildingLine, RiMapPinUserLine
} from "react-icons/ri";

// --- Configuration & Environment Variables ---
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api";
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "YOUR_GEMINI_CLIENT_SIDE_KEY_IF_APPLICABLE"; // Should ideally be proxied via backend
const APP_NAME = process.env.REACT_APP_APP_NAME || "Citibank NextGen AI Platform";

const externalServiceConfig = {
  stripe: {
    enabled: process.env.REACT_APP_STRIPE_ENABLED === "true",
    publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  },
  sendgrid: {
    enabled: process.env.REACT_APP_SENDGRID_ENABLED === "true",
    // API key managed securely on backend
  },
  twilio: {
    enabled: process.env.REACT_APP_TWILIO_ENABLED === "true",
    // API key managed securely on backend
  },
  hubspot: {
    enabled: process.env.REACT_APP_HUBSPOT_ENABLED === "true",
    portalId: process.env.REACT_APP_HUBSPOT_PORTAL_ID,
  },
  jira: {
    enabled: process.env.REACT_APP_JIRA_ENABLED === "true",
    baseUrl: process.env.REACT_APP_JIRA_BASE_URL,
  },
  slack: {
    enabled: process.env.REACT_APP_SLACK_ENABLED === "true",
    clientId: process.env.REACT_APP_SLACK_CLIENT_ID,
  },
  github: {
    enabled: process.env.REACT_APP_GITHUB_ENABLED === "true",
    clientId: process.env.REACT_APP_GITHUB_CLIENT_ID,
  },
  awsS3: {
    enabled: process.env.REACT_APP_AWS_S3_ENABLED === "true",
    bucketName: process.env.REACT_APP_AWS_S3_BUCKET_NAME,
    region: process.env.REACT_APP_AWS_S3_REGION,
  },
  googleCloudStorage: {
    enabled: process.env.REACT_APP_GCS_ENABLED === "true",
    bucketName: process.env.REACT_APP_GCS_BUCKET_NAME,
  },
  datadog: {
    enabled: process.env.REACT_APP_DATADOG_ENABLED === "true",
    applicationId: process.env.REACT_APP_DATADOG_APPLICATION_ID,
    clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN,
  },
  sentry: {
    enabled: process.env.REACT_APP_SENTRY_ENABLED === "true",
    dsn: process.env.REACT_APP_SENTRY_DSN,
  },
  mixpanel: {
    enabled: process.env.REACT_APP_MIXPANEL_ENABLED === "true",
    token: process.env.REACT_APP_MIXPANEL_TOKEN,
  },
  segment: {
    enabled: process.env.REACT_APP_SEGMENT_ENABLED === "true",
    writeKey: process.env.REACT_APP_SEGMENT_WRITE_KEY,
  },
  firebase: {
    enabled: process.env.REACT_APP_FIREBASE_ENABLED === "true",
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  },
  auth0: {
    enabled: process.env.REACT_APP_AUTH0_ENABLED === "true",
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  },
  paypal: {
    enabled: process.env.REACT_APP_PAYPAL_ENABLED === "true",
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
  },
  intercom: {
    enabled: process.env.REACT_APP_INTERCOM_ENABLED === "true",
    appId: process.env.REACT_APP_INTERCOM_APP_ID,
  },
  zendesk: {
    enabled: process.env.REACT_APP_ZENDESK_ENABLED === "true",
    subdomain: process.env.REACT_APP_ZENDESK_SUBDOMAIN,
  },
  zoom: {
    enabled: process.env.REACT_APP_ZOOM_ENABLED === "true",
    apiKey: process.env.REACT_APP_ZOOM_API_KEY, // Backend key
  },
  calendly: {
    enabled: process.env.REACT_APP_CALENDLY_ENABLED === "true",
    apiKey: process.env.REACT_APP_CALENDLY_API_KEY, // Backend key
  },
  notion: {
    enabled: process.env.REACT_APP_NOTION_ENABLED === "true",
    apiKey: process.env.REACT_APP_NOTION_API_KEY, // Backend key
  },
  mondayCom: {
    enabled: process.env.REACT_APP_MONDAY_COM_ENABLED === "true",
    apiKey: process.env.REACT_APP_MONDAY_COM_API_KEY, // Backend key
  },
  asana: {
    enabled: process.env.REACT_APP_ASANA_ENABLED === "true",
    apiKey: process.env.REACT_APP_ASANA_API_KEY, // Backend key
  },
  trello: {
    enabled: process.env.REACT_APP_TRELLO_ENABLED === "true",
    apiKey: process.env.REACT_APP_TRELLO_API_KEY, // Backend key
  },
  googleAnalytics: {
    enabled: process.env.REACT_APP_GA_ENABLED === "true",
    trackingId: process.env.REACT_APP_GA_TRACKING_ID,
  },
  googleMaps: {
    enabled: process.env.REACT_APP_GMAPS_ENABLED === "true",
    apiKey: process.env.REACT_APP_GMAPS_API_KEY, // Client-side safe, but backend proxy for sensitive calls
  },
  openAI: {
    enabled: process.env.REACT_APP_OPENAI_ENABLED === "true",
    // API key managed securely on backend
  },
  cohere: {
    enabled: process.env.REACT_APP_COHERE_ENABLED === "true",
    // API key managed securely on backend
  },
  algolia: {
    enabled: process.env.REACT_APP_ALGOLIA_ENABLED === "true",
    appId: process.env.REACT_APP_ALGOLIA_APP_ID,
    searchApiKey: process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY, // Client-side safe
  },
  cloudinary: {
    enabled: process.env.REACT_APP_CLOUDINARY_ENABLED === "true",
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY, // Client-side safe for direct uploads
  },
  mailchimp: {
    enabled: process.env.REACT_APP_MAILCHIMP_ENABLED === "true",
    // API key managed securely on backend
  },
  klaviyo: {
    enabled: process.env.REACT_APP_KLAVIYO_ENABLED === "true",
    // API key managed securely on backend
  },
  postmark: {
    enabled: process.env.REACT_APP_POSTMARK_ENABLED === "true",
    // API key managed securely on backend
  },
  activeCampaign: {
    enabled: process.env.REACT_APP_ACTIVE_CAMPAIGN_ENABLED === "true",
    // API key managed securely on backend
  },
  // ... continue for up to 100 conceptual services
  // Each service would have an `enabled` flag and relevant keys.
  // Sensitive keys (e.g., secret API keys) would only be used on the backend.
};

// --- Backend API Client ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
      localStorage.setItem("accessToken", data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
});

// --- GraphQL Client (if still needed, integrates with REST for external) ---
// For internal data fetching that was originally GraphQL based, we would keep Apollo or switch to REST.
// Assuming for simplicity that the GraphQL part for userOnboardingFlow data still exists
// but much of the new functionality uses the REST apiClient.
// This original code snippet implies a GraphQL client. Let's create a minimal mock for it.
const mockGraphQLClient = {
  query: ({ variables }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (variables.id === "valid-id") {
          resolve({
            data: {
              userOnboardingFlow: {
                clientToken: `mock-client-token-${variables.id}`,
                status: "active",
                steps: ["profile", "payment", "complete"]
              }
            }
          });
        } else {
          resolve({
            data: {
              userOnboardingFlow: null
            },
            errors: [{ message: "User onboarding flow not found" }]
          });
        }
      }, 500);
    });
  }
};

// --- Contexts & Hooks ---
const AuthContext = createContext(null);
const GeminiChatContext = createContext(null);
const QueryClientInstance = new QueryClient();

const useAuth = () => useContext(AuthContext);
const useGeminiChat = () => useContext(GeminiChatContext);

// --- Auth Provider ---
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const { data } = await apiClient.get("/auth/me");
        setUser(data.user);
      }
    } catch (error) {
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials) => {
    try {
      const { data } = await apiClient.post("/auth/login", credentials);
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
      toast.success("Logged in successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
      return false;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const { data } = await apiClient.post("/auth/register", userData);
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
      toast.success("Account created and logged in!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
      localStorage.removeItem("accessToken");
      setUser(null);
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed.");
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
  }), [user, loading, login, register, logout]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading authentication...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Gemini Chat Provider & Service ---
const GeminiChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const newMessage = { id: uuidv4(), role: "user", content: text };
    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    try {
      const response = await apiClient.post("/gemini/chat", {
        prompt: text,
        history: messages.map(msg => ({ role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.content }] }))
      });
      const geminiResponse = { id: uuidv4(), role: "model", content: response.data.text };
      setMessages((prev) => [...prev, geminiResponse]);
    } catch (error) {
      console.error("Gemini API error:", error);
      toast.error("Failed to get response from Gemini.");
      setMessages((prev) => [...prev, { id: uuidv4(), role: "model", content: "Apologies, I encountered an error." }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const value = useMemo(() => ({
    messages,
    sendMessage,
    isTyping,
  }), [messages, sendMessage, isTyping]);

  return <GeminiChatContext.Provider value={value}>{children}</GeminiChatContext.Provider>;
};

// --- Components ---

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-400">{APP_NAME}</Link>
      <nav>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {user.name || user.email}!</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center gap-2">
              <RiLoginBoxLine /> Login
            </Link>
            <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center gap-2">
              <RiUserLine /> Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const navItems = [
    { path: "/dashboard", icon: <RiDashboardLine />, label: "Dashboard" },
    { path: "/chat", icon: <RiChat1Line />, label: "AI Chat" },
    { path: "/integrations", icon: <RiPlugLine />, label: "Integrations" },
    { path: "/payments", icon: <RiMoneyDollarBoxLine />, label: "Payments" },
    { path: "/crm", icon: <RiCustomerService2Line />, label: "CRM" },
    { path: "/analytics", icon: <RiPieChartLine />, label: "Analytics" },
    { path: "/communications", icon: <RiMailLine />, label: "Communications" },
    { path: "/project-management", icon: <RiProjector2Line />, label: "Project Mgmt" },
    { path: "/file-storage", icon: <RiCloudLine />, label: "File Storage" },
    { path: "/devops", icon: <RiBugLine />, label: "DevOps" },
    { path: "/onboarding", icon: <RiMapPinUserLine />, label: "Onboarding" }, // The original app's entry point
    { path: "/settings", icon: <RiSettings3Line />, label: "Settings" },
  ];

  return (
    <aside className="bg-gray-800 text-gray-100 w-64 p-4 min-h-screen shadow-lg">
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className="flex items-center space-x-3 p-3 rounded-md hover:bg-blue-700 transition duration-200 text-lg">
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

const DashboardLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null; // Or a loading spinner
  }

  return children;
};

// --- Pages ---

const HomePage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-5xl font-extrabold mb-6 text-blue-400">Welcome to {APP_NAME}</h1>
      <p className="text-xl text-center max-w-2xl mb-8">
        Your ultimate AI-powered financial and business intelligence platform, integrating with hundreds of services to supercharge your operations.
      </p>
      {user ? (
        <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300">
          Go to Dashboard
        </Link>
      ) : (
        <div className="flex space-x-4">
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300">
            Get Started
          </Link>
          <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300">
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Login to {APP_NAME}</h2>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const success = await login(values);
            if (success) {
              navigate("/dashboard");
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
                <ErrorMessage name="email" component="div" className="text-red-400 text-sm mt-1" />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <ErrorMessage name="password" component="div" className="text-red-400 text-sm mt-1" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>
        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Create Your Account</h2>
        <Formik
          initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const success = await register(values);
            if (success) {
              navigate("/dashboard");
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
                <ErrorMessage name="name" component="div" className="text-red-400 text-sm mt-1" />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
                <ErrorMessage name="email" component="div" className="text-red-400 text-sm mt-1" />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <ErrorMessage name="password" component="div" className="text-red-400 text-sm mt-1" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-400 text-sm mt-1" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </Form>
          )}
        </Formik>
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Dashboard</h1>
      <p className="text-lg mb-4">Welcome back, {user?.name || user?.email}!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">AI Insights</h3>
          <p>Get instant business insights from Gemini.</p>
          <Link to="/chat" className="text-blue-400 hover:underline mt-2 inline-block">Start Chatting</Link>
        </div>
        <div className="bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Recent Payments</h3>
          <p>View your latest transactions via Stripe.</p>
          <Link to="/payments" className="text-blue-400 hover:underline mt-2 inline-block">Manage Payments</Link>
        </div>
        <div className="bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">CRM Updates</h3>
          <p>Check recent customer activities from HubSpot.</p>
          <Link to="/crm" className="text-blue-400 hover:underline mt-2 inline-block">Go to CRM</Link>
        </div>
        <div className="bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Service Integrations</h3>
          <p>Connect and manage all your external apps.</p>
          <Link to="/integrations" className="text-blue-400 hover:underline mt-2 inline-block">View Integrations</Link>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Settings</h1>
      <p className="text-lg">Manage your account and application preferences.</p>
      <div className="mt-6 space-y-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Profile Settings</h3>
          <p className="text-gray-300">Update your name, email, and password.</p>
          <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">Edit Profile</button>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Notification Preferences</h3>
          <p className="text-gray-300">Configure email and SMS alerts.</p>
          <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">Manage Notifications</button>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Security</h3>
          <p className="text-gray-300">Manage two-factor authentication and connected devices.</p>
          <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">Security Settings</button>
        </div>
      </div>
    </div>
  );
};

const GeminiChatPage = () => {
  const { messages, sendMessage, isTyping } = useGeminiChat();
  const [input, setInput] = useState("");
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl p-6">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">AI Chat with Gemini</h1>
      <div className="flex-1 overflow-y-auto mb-4 bg-gray-700 p-4 rounded-md scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-600">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xl p-3 rounded-lg shadow-md ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-600 text-white"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-xl p-3 rounded-lg shadow-md bg-gray-600 text-white animate-pulse">
                Gemini is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini anything..."
          className="flex-1 p-3 rounded-l-md bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          disabled={isTyping}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-r-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isTyping}
        >
          Send
        </button>
      </form>
    </div>
  );
};

const IntegrationsPage = () => {
  const services = Object.entries(externalServiceConfig).map(([key, config]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    status: config.enabled ? "Connected" : "Not Connected",
    icon: {
      stripe: <RiMoneyDollarBoxLine className="text-blue-400" />,
      sendgrid: <RiMailLine className="text-green-400" />,
      twilio: <RiMailLine className="text-purple-400" />,
      hubspot: <RiCustomerService2Line className="text-orange-400" />,
      jira: <RiProjector2Line className="text-blue-500" />,
      slack: <RiSlackFill className="text-red-500" />,
      github: <RiGithubFill className="text-gray-400" />,
      awsS3: <RiCloudLine className="text-orange-300" />,
      googleCloudStorage: <RiCloudLine className="text-blue-300" />,
      datadog: <RiBugLine className="text-purple-300" />,
      sentry: <RiBugLine className="text-yellow-400" />,
      mixpanel: <RiPieChartLine className="text-green-500" />,
      segment: <RiPieChartLine className="text-blue-600" />,
      firebase: <RiBuildingLine className="text-yellow-500" />,
      auth0: <RiUserLine className="text-red-400" />,
      paypal: <RiMoneyDollarBoxLine className="text-blue-700" />,
      intercom: <RiChat1Line className="text-green-600" />,
      zendesk: <RiCustomerService2Line className="text-lime-500" />,
      zoom: <RiChat1Line className="text-sky-500" />,
      calendly: <RiProjector2Line className="text-indigo-500" />,
      notion: <RiProjector2Line className="text-gray-500" />,
      mondayCom: <RiProjector2Line className="text-red-500" />,
      asana: <RiProjector2Line className="text-fuchsia-500" />,
      trello: <RiProjector2Line className="text-teal-500" />,
      googleAnalytics: <RiPieChartLine className="text-orange-600" />,
      googleMaps: <RiMapPinUserLine className="text-lime-600" />,
      openAI: <RiChat1Line className="text-cyan-400" />,
      cohere: <RiChat1Line className="text-emerald-500" />,
      algolia: <RiSearchLine className="text-blue-800" />,
      cloudinary: <RiCloudLine className="text-purple-600" />,
      mailchimp: <RiMailLine className="text-orange-700" />,
      klaviyo: <RiMailLine className="text-green-700" />,
      postmark: <RiMailLine className="text-gray-700" />,
      activeCampaign: <RiMailLine className="text-blue-900" />,
      // ... Add icons for other services
    }[key] || <RiPlugLine className="text-gray-500" />,
  }));

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">External Integrations</h1>
      <p className="text-lg mb-6">Manage all your connected third-party services. Seamlessly extend your platform's capabilities.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div key={index} className="bg-gray-700 p-5 rounded-lg shadow-md flex items-center space-x-4">
            <div className="text-3xl">{service.icon}</div>
            <div>
              <h3 className="text-xl font-semibold">{service.name}</h3>
              <p className={`text-sm ${service.status === "Connected" ? "text-green-400" : "text-red-400"}`}>
                {service.status}
              </p>
            </div>
            {service.status === "Not Connected" && (
              <button className="ml-auto bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm">
                Connect
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="mt-8 text-gray-400">
        More services are available via our backend API. If you need a specific integration, contact support.
      </p>
    </div>
  );
};

const PaymentsPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const response = await apiClient.get("/payments/transactions");
      return response.data;
    },
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Payments & Billing</h1>
      <p className="text-lg mb-4">Manage your subscriptions, view transaction history, and configure payment methods.</p>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-300">Transaction History</h2>
        {isLoading && <div className="text-gray-300">Loading transactions...</div>}
        {isError && <div className="text-red-400">Error loading transactions.</div>}
        {data && data.transactions && data.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-600 text-left">
                  <th className="py-3 px-4 font-semibold text-gray-200">ID</th>
                  <th className="py-3 px-4 font-semibold text-gray-200">Amount</th>
                  <th className="py-3 px-4 font-semibold text-gray-200">Status</th>
                  <th className="py-3 px-4 font-semibold text-gray-200">Date</th>
                  <th className="py-3 px-4 font-semibold text-gray-200">Description</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-600 hover:bg-gray-600 transition duration-150">
                    <td className="py-3 px-4">{transaction.id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 font-medium text-green-400">${transaction.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === "completed" ? "bg-green-500 bg-opacity-20 text-green-300" :
                        transaction.status === "pending" ? "bg-yellow-500 bg-opacity-20 text-yellow-300" :
                        "bg-red-500 bg-opacity-20 text-red-300"
                      }`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{transaction.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-700 p-4 rounded-md text-gray-300">No transactions found.</div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-300">New Payment</h2>
        {externalServiceConfig.stripe.enabled ? (
          <div className="bg-gray-700 p-5 rounded-lg">
            <p className="mb-4 text-gray-300">Process a new payment securely via Stripe.</p>
            {/* Stripe integration would typically involve Stripe Elements and a backend API for charges */}
            <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md">
              Initiate Payment (Stripe)
            </button>
            <p className="text-sm text-gray-400 mt-2">Stripe Publishable Key: {externalServiceConfig.stripe.publishableKey ? externalServiceConfig.stripe.publishableKey.substring(0, 10) + "..." : "N/A"}</p>
          </div>
        ) : (
          <div className="bg-gray-700 p-4 rounded-md text-gray-300">Stripe integration is not enabled.</div>
        )}
      </div>
    </div>
  );
};

const CRMPage = () => {
  const { data: contacts, isLoading: contactsLoading, isError: contactsError } = useQuery({
    queryKey: ["crmContacts"],
    queryFn: async () => {
      const response = await apiClient.get("/crm/contacts");
      return response.data;
    },
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Customer Relationship Management</h1>
      <p className="text-lg mb-4">View and manage your customer contacts, deals, and interactions using HubSpot integration.</p>

      {externalServiceConfig.hubspot.enabled ? (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-300">HubSpot Contacts</h2>
          {contactsLoading && <div className="text-gray-300">Loading contacts from HubSpot...</div>}
          {contactsError && <div className="text-red-400">Error loading contacts.</div>}
          {contacts && contacts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-600 text-left">
                    <th className="py-3 px-4 font-semibold text-gray-200">Name</th>
                    <th className="py-3 px-4 font-semibold text-gray-200">Email</th>
                    <th className="py-3 px-4 font-semibold text-gray-200">Company</th>
                    <th className="py-3 px-4 font-semibold text-gray-200">Lifecycle Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-gray-600 hover:bg-gray-600 transition duration-150">
                      <td className="py-3 px-4">{contact.firstname} {contact.lastname}</td>
                      <td className="py-3 px-4">{contact.email}</td>
                      <td className="py-3 px-4">{contact.company}</td>
                      <td className="py-3 px-4">{contact.lifecyclestage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !contactsLoading && <div className="bg-gray-700 p-4 rounded-md text-gray-300">No contacts found in HubSpot.</div>
          )}
        </div>
      ) : (
        <div className="bg-gray-700 p-4 rounded-md text-gray-300">HubSpot integration is not enabled.</div>
      )}
    </div>
  );
};

const AnalyticsPage = () => {
  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/summary");
      return response.data;
    },
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Analytics & Insights</h1>
      <p className="text-lg mb-4">Gain deep insights into your user behavior, application performance, and business metrics.</p>

      {isLoading && <div className="text-gray-300">Loading analytics data...</div>}
      {isError && <div className="text-red-400">Error loading analytics data.</div>}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Total Users</h3>
            <p className="text-3xl font-bold text-blue-400">{analyticsData.totalUsers?.toLocaleString() || "N/A"}</p>
            {externalServiceConfig.googleAnalytics.enabled && <p className="text-sm text-gray-400 mt-2">Via Google Analytics</p>}
            {externalServiceConfig.mixpanel.enabled && <p className="text-sm text-gray-400 mt-1">Via Mixpanel</p>}
          </div>
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Revenue (Last 30 days)</h3>
            <p className="text-3xl font-bold text-green-400">${analyticsData.revenueLast30Days?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "N/A"}</p>
            {externalServiceConfig.stripe.enabled && <p className="text-sm text-gray-400 mt-2">Via Stripe</p>}
          </div>
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Active Sessions</h3>
            <p className="text-3xl font-bold text-purple-400">{analyticsData.activeSessions?.toLocaleString() || "N/A"}</p>
            {externalServiceConfig.datadog.enabled && <p className="text-sm text-gray-400 mt-2">Via DataDog</p>}
          </div>
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Errors Logged (24h)</h3>
            <p className="text-3xl font-bold text-red-400">{analyticsData.errors24h?.toLocaleString() || "N/A"}</p>
            {externalServiceConfig.sentry.enabled && <p className="text-sm text-gray-400 mt-2">Via Sentry</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const CommunicationsPage = () => {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [smsRecipient, setSmsRecipient] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  const sendEmail = async () => {
    if (!emailSubject || !emailBody) {
      toast.error("Email subject and body cannot be empty.");
      return;
    }
    try {
      await apiClient.post("/communications/send-email", { to: "admin@example.com", subject: emailSubject, body: emailBody });
      toast.success("Email sent successfully!");
      setEmailSubject("");
      setEmailBody("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send email.");
    }
  };

  const sendSms = async () => {
    if (!smsRecipient || !smsMessage) {
      toast.error("SMS recipient and message cannot be empty.");
      return;
    }
    try {
      await apiClient.post("/communications/send-sms", { to: smsRecipient, message: smsMessage });
      toast.success("SMS sent successfully!");
      setSmsRecipient("");
      setSmsMessage("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send SMS.");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Communications</h1>
      <p className="text-lg mb-4">Manage and send emails and SMS messages directly from the platform.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {externalServiceConfig.sendgrid.enabled && (
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-green-300">Send Email (SendGrid)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  className="w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Body</label>
                <textarea
                  className="w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white h-32"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                ></textarea>
              </div>
              <button onClick={sendEmail} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
                Send Email
              </button>
            </div>
          </div>
        )}

        {externalServiceConfig.twilio.enabled && (
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">Send SMS (Twilio)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Recipient (e.g., +15551234567)</label>
                <input
                  type="text"
                  className="w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white"
                  value={smsRecipient}
                  onChange={(e) => setSmsRecipient(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Message</label>
                <textarea
                  className="w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white h-32"
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                ></textarea>
              </div>
              <button onClick={sendSms} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
                Send SMS
              </button>
            </div>
          </div>
        )}
        {!externalServiceConfig.sendgrid.enabled && !externalServiceConfig.twilio.enabled && (
          <div className="bg-gray-700 p-4 rounded-md text-gray-300 md:col-span-2">
            No communication services are currently enabled.
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectManagementPage = () => {
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await apiClient.get("/project-management/projects");
      return response.data;
    },
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Project Management</h1>
      <p className="text-lg mb-4">Integrate with your project management tools like Jira, Asana, and Notion to track tasks and progress.</p>

      {isLoading && <div className="text-gray-300">Loading projects...</div>}
      {isError && <div className="text-red-400">Error loading projects.</div>}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-gray-700 p-5 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                {project.source === "Jira" && <RiProjector2Line className="text-blue-500" />}
                {project.source === "Asana" && <RiProjector2Line className="text-fuchsia-400" />}
                {project.source === "Notion" && <RiProjector2Line className="text-gray-400" />}
                {project.name}
              </h3>
              <p className="text-gray-300 mb-3">{project.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Source: {project.source}</span>
                <span>Tasks: {project.taskCount}</span>
              </div>
              <Link to={`/project-management/${project.id}`} className="mt-4 inline-block text-blue-400 hover:underline">View Project</Link>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && <div className="bg-gray-700 p-4 rounded-md text-gray-300">No projects found.</div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-300">Connected Tools</h2>
        <div className="flex space-x-4">
          {externalServiceConfig.jira.enabled && (
            <span className="inline-flex items-center bg-blue-500 bg-opacity-20 text-blue-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
              <RiProjector2Line className="mr-1" /> Jira
            </span>
          )}
          {externalServiceConfig.asana.enabled && (
            <span className="inline-flex items-center bg-fuchsia-500 bg-opacity-20 text-fuchsia-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
              <RiProjector2Line className="mr-1" /> Asana
            </span>
          )}
          {externalServiceConfig.notion.enabled && (
            <span className="inline-flex items-center bg-gray-500 bg-opacity-20 text-gray-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
              <RiProjector2Line className="mr-1" /> Notion
            </span>
          )}
          {!externalServiceConfig.jira.enabled && !externalServiceConfig.asana.enabled && !externalServiceConfig.notion.enabled && (
            <p className="text-gray-400">No project management tools enabled.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const FileStoragePage = () => {
  const { data: files, isLoading, isError, refetch } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const response = await apiClient.get("/file-storage/files");
      return response.data;
    },
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await apiClient.post("/file-storage/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("File uploaded successfully!");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "File upload failed.");
    }
  };

  const handleDeleteFile = async (fileName) => {
    try {
      await apiClient.delete(`/file-storage/delete/${fileName}`);
      toast.success("File deleted successfully!");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "File deletion failed.");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Cloud File Storage</h1>
      <p className="text-lg mb-4">Securely store and manage your files using integrated cloud storage solutions like AWS S3 and Google Cloud Storage.</p>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-300">Upload New File</h2>
        {(externalServiceConfig.awsS3.enabled || externalServiceConfig.googleCloudStorage.enabled) ? (
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <input type="file" onChange={handleFileUpload} className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600" />
            <p className="text-sm text-gray-400 mt-2">Max file size: 100MB</p>
          </div>
        ) : (
          <div className="bg-gray-700 p-4 rounded-md text-gray-300">No cloud storage services are currently enabled.</div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-300">Your Files</h2>
        {isLoading && <div className="text-gray-300">Loading files...</div>}
        {isError && <div className="text-red-400">Error loading files.</div>}
        {files && files.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-600 text-left">
                  <th className="py-3 px-4 font-semibold text-gray-200">Name</th>
                  <th className="py-3 px-4 font-semibold text-gray-200">Size</th>
                  <th className="py-3 px-4 font-semibold text-gray-200">Type</th>
                  <th className="py-3 px-4 font-semibold text-gray-200">Uploaded At</th>
                  <th className="py-3 px-4 font-semibold text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.name} className="border-b border-gray-600 hover:bg-gray-600 transition duration-150">
                    <td className="py-3 px-4 flex items-center gap-2">
                      {file.source === "S3" && <RiCloudLine className="text-orange-300" />}
                      {file.source === "GCS" && <RiCloudLine className="text-blue-300" />}
                      {file.name}
                    </td>
                    <td className="py-3 px-4">{(file.size / 1024).toFixed(2)} KB</td>
                    <td className="py-3 px-4">{file.type}</td>
                    <td className="py-3 px-4">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 space-x-2">
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View</a>
                      <button onClick={() => handleDeleteFile(file.name)} className="text-red-400 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !isLoading && <div className="bg-gray-700 p-4 rounded-md text-gray-300">No files found.</div>
        )}
      </div>
    </div>
  );
};

const DevOpsPage = () => {
  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ["devOpsMetrics"],
    queryFn: async () => {
      const response = await apiClient.get("/devops/metrics");
      return response.data;
    },
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">DevOps & Monitoring</h1>
      <p className="text-lg mb-4">Monitor application performance, track errors, and manage deployments with integrated DevOps tools.</p>

      {isLoading && <div className="text-gray-300">Loading DevOps metrics...</div>}
      {isError && <div className="text-red-400">Error loading DevOps metrics.</div>}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">CPU Usage</h3>
            <p className="text-3xl font-bold text-blue-400">{metrics.cpuUsage?.toFixed(2) || "N/A"}%</p>
            {externalServiceConfig.datadog.enabled && <p className="text-sm text-gray-400 mt-2">Via DataDog</p>}
          </div>
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Memory Usage</h3>
            <p className="text-3xl font-bold text-purple-400">{metrics.memoryUsage?.toFixed(2) || "N/A"}%</p>
            {externalServiceConfig.datadog.enabled && <p className="text-sm text-gray-400 mt-2">Via DataDog</p>}
          </div>
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Recent Errors</h3>
            <p className="text-3xl font-bold text-red-400">{metrics.errorCount?.toLocaleString() || "N/A"}</p>
            {externalServiceConfig.sentry.enabled && <p className="text-sm text-gray-400 mt-2">Via Sentry</p>}
          </div>
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Latest Deployments</h3>
            <p className="text-3xl font-bold text-green-400">{metrics.lastDeployment || "N/A"}</p>
            {externalServiceConfig.github.enabled && <p className="text-sm text-gray-400 mt-2">Via GitHub Actions</p>}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-300">Monitoring Tools Status</h2>
        <div className="flex space-x-4">
          {externalServiceConfig.datadog.enabled && (
            <span className="inline-flex items-center bg-purple-500 bg-opacity-20 text-purple-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
              <RiBugLine className="mr-1" /> DataDog
            </span>
          )}
          {externalServiceConfig.sentry.enabled && (
            <span className="inline-flex items-center bg-yellow-500 bg-opacity-20 text-yellow-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
              <RiBugLine className="mr-1" /> Sentry
            </span>
          )}
          {!externalServiceConfig.datadog.enabled && !externalServiceConfig.sentry.enabled && (
            <p className="text-gray-400">No monitoring tools enabled.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const UserOnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Profile Setup", "Payment Information", "Service Configuration", "Review & Complete"];
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success("Onboarding complete! Redirecting to dashboard.");
      navigate("/dashboard");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Step 1: Profile Setup</h3>
            <p className="text-gray-300 mb-4">Please provide your basic profile details.</p>
            <Formik
              initialValues={{ fullName: "", companyName: "" }}
              validationSchema={Yup.object({
                fullName: Yup.string().required("Required"),
                companyName: Yup.string().required("Required"),
              })}
              onSubmit={(values, { setSubmitting }) => {
                setTimeout(() => {
                  toast.success("Profile saved!");
                  handleNext();
                  setSubmitting(false);
                }, 400);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-gray-300 text-sm font-medium mb-1">Full Name</label>
                    <Field name="fullName" type="text" className="w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white" />
                    <ErrorMessage name="fullName" component="div" className="text-red-400 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="companyName" className="block text-gray-300 text-sm font-medium mb-1">Company Name</label>
                    <Field name="companyName" type="text" className="w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white" />
                    <ErrorMessage name="companyName" component="div" className="text-red-400 text-sm mt-1" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50">
                    {isSubmitting ? "Saving..." : "Save & Continue"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        );
      case 1:
        return (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Step 2: Payment Information</h3>
            <p className="text-gray-300 mb-4">Securely set up your billing details for subscriptions and services.</p>
            {externalServiceConfig.stripe.enabled ? (
              <Formik
                initialValues={{ cardNumber: "", expiry: "", cvc: "" }}
                validationSchema={Yup.object({
                  cardNumber: Yup.string().required("Required").matches(/^\d{16}$/, "Invalid card number"),
                  expiry: Yup.string().required("Required").matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "MM/YY format"),
                  cvc: Yup.string().required("Required").matches(/^\d{3,4}$/, "Invalid CVC"),
                })}
                onSubmit={(values, { setSubmitting }) => {
                  setTimeout(() => {
                    toast.success("Payment details saved securely!");
                    handleNext();
                    setSubmitting(false);
                  }, 400);
                }}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-gray-300 text-sm font-medium mb-1">Card Number</label>
                      <Field name="cardNumber" type="text" placeholder="•••• •••• •••• ••••" className="w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white" />
                      <ErrorMessage name="cardNumber" component="div" className="text-red-400 text-sm mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="block text-gray-300 text-sm font-medium mb-1">Expiry (MM/YY)</label>
                        <Field name="expiry" type="text" placeholder="MM/YY" className="w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white" />
                        <ErrorMessage name="expiry" component="div" className="text-red-400 text-sm mt-1" />
                      </div>
                      <div>
                        <label htmlFor="cvc" className="block text-gray-300 text-sm font-medium mb-1">CVC</label>
                        <Field name="cvc" type="text" placeholder="•••" className="w-full p-2 rounded-md bg-gray-600 border border-gray-500 text-white" />
                        <ErrorMessage name="cvc" component="div" className="text-red-400 text-sm mt-1" />
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50">
                      {isSubmitting ? "Saving..." : "Save & Continue"}
                    </button>
                  </Form>
                )}
              </Formik>
            ) : (
              <div className="bg-gray-600 p-4 rounded-md text-gray-300">Payment integration is not enabled. Skip for now.</div>
            )}
            <button onClick={handleNext} className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md">
              Skip for now
            </button>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Step 3: Service Configuration</h3>
            <p className="text-gray-300 mb-4">Connect essential services to power your operations. You can add more later.</p>
            <div className="space-y-3">
              {Object.entries(externalServiceConfig).slice(0, 5).map(([key, config]) => ( // Show first 5 as examples
                <div key={key} className="flex items-center justify-between p-3 bg-gray-600 rounded-md">
                  <span className="text-lg text-white">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  {config.enabled ? (
                    <span className="text-green-400">Connected</span>
                  ) : (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md">
                      Connect
                    </button>
                  )}
                </div>
              ))}
              <p className="text-gray-400 mt-4">Visit the <Link to="/integrations" className="text-blue-400 hover:underline">Integrations page</Link> to connect more services later.</p>
            </div>
            <button onClick={handleNext} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
              Continue
            </button>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Step 4: Review & Complete</h3>
            <p className="text-gray-300 mb-4">You're almost done! Review your settings and complete the onboarding process.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Profile information updated.</li>
              <li>Payment details configured (if enabled).</li>
              <li>Essential services connected.</li>
            </ul>
            <button onClick={handleNext} className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md text-lg">
              Finish Onboarding
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">User Onboarding</h1>
      <div className="mb-8">
        <div className="flex justify-between items-center text-gray-400">
          {steps.map((step, index) => (
            <div key={step} className={`flex-1 text-center ${index <= currentStep ? "text-blue-400" : ""} ${index < steps.length - 1 ? "relative after:block after:absolute after:top-1/2 after:left-[calc(50%+1.5rem)] after:w-[calc(100%-3rem)] after:h-0.5 after:bg-gray-600 after:-translate-y-1/2" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-bold ${index <= currentStep ? "bg-blue-600 text-white" : "bg-gray-700 border border-gray-500"}`}>
                {index + 1}
              </div>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 bg-gray-700 rounded-lg">
        {renderStepContent()}
      </div>
    </div>
  );
};

// Original NotFound component, adapted for modern routing.
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-6xl font-extrabold text-blue-400 mb-4">404</h1>
      <p className="text-2xl mb-8">Page Not Found</p>
      <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300">
        Go to Dashboard
      </Link>
    </div>
  );
};

// The original component's core logic is integrated within UserOnboardingPage
// but the name is preserved if it were a distinct embeddable part.
const EmbeddableFlowDemo = ({ clientToken }) => (
  <div className="p-6 bg-gray-700 rounded-lg shadow-md text-white">
    <h2 className="text-2xl font-bold mb-4">Embeddable Flow Demo (Legacy)</h2>
    <p>This is a simulated embeddable flow, activated with client token:</p>
    <code className="block bg-gray-800 p-3 rounded-md mt-2 text-green-400 break-all">{clientToken}</code>
    <p className="mt-4">In a real-world scenario, this would dynamically load a 3rd party UI.</p>
  </div>
);

// --- Main App Component ---
function App() {
  return (
    <QueryClientProvider client={QueryClientInstance}>
      <AuthProvider>
        <GeminiChatProvider>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding/:id?" element={<ProtectedRoute><UserOnboardingPage /></ProtectedRoute>} /> {/* Enhanced version of original */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="chat" element={<GeminiChatPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="crm" element={<CRMPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="communications" element={<CommunicationsPage />} />
                <Route path="project-management" element={<ProjectManagementPage />} />
                <Route path="file-storage" element={<FileStoragePage />} />
                <Route path="devops" element={<DevOpsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster position="bottom-right" reverseOrder={false} />
          </Router>
        </GeminiChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;