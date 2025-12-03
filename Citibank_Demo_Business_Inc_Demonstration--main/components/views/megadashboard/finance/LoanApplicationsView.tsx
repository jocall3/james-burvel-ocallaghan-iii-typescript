import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../../Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    FunnelIcon,
    PlusIcon,
    DocumentTextIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ChartBarIcon,
    UserCircleIcon,
    ClockIcon,
    Bars3Icon,
    EllipsisVerticalIcon,
    PaperClipIcon,
    EnvelopeIcon,
    EyeIcon,
    PencilSquareIcon,
    TrashIcon,
    FolderIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    BellIcon,
    TagIcon,
    CalculatorIcon,
    ClipboardDocumentListIcon,
    QueueListIcon,
    BuildingOfficeIcon,
    BanknotesIcon,
    CreditCardIcon,
    UsersIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
    PresentationChartLineIcon,
    GlobeAltIcon,
    StarIcon,
    ShareIcon,
    CalendarDaysIcon,
    CloudArrowUpIcon,
    CodeBracketIcon,
    ServerStackIcon,
    PhotoIcon,
    VideoCameraIcon,
    WifiIcon,
    LinkIcon,
    CubeIcon,
    BoltIcon,
    KeyIcon,
    LockClosedIcon,
    PuzzlePieceIcon,
    FingerPrintIcon,
    QuestionMarkCircleIcon,
    MegaphoneIcon,
    TruckIcon,
    ScaleIcon,
    QrCodeIcon,
    BugAntIcon,
    ChartPieIcon,
    AcademicCapIcon,
    GiftIcon,
    CurrencyEuroIcon,
    ReceiptPercentIcon,
    WalletIcon,
    TicketIcon,
    BriefcaseIcon,
    ChartBarSquareIcon,
    ArrowUpOnSquareStackIcon,
    Cog6ToothIcon,
    CloudIcon,
    ChartLineUpIcon,
    ArrowDownTrayIcon,
    PlayCircleIcon,
    ListBulletIcon,
    CubeTransparentIcon,
    WindowIcon,
    CursorArrowRaysIcon,
    BeakerIcon,
    Square3Stack3DIcon,
    RocketLaunchIcon,
    LightBulbIcon,
    SunIcon,
    MoonIcon,
    CloudArrowDownIcon,
    AdjustmentsVerticalIcon,
    PaintBrushIcon,
    DevicePhoneIcon,
    ComputerDesktopIcon,
    TvIcon,
    MicrophoneIcon,
    SpeakerWaveIcon,
    HeadphonesIcon,
    CircleStackIcon,
    BugPlayIcon,
    CodeBracketSquareIcon,
    ClipboardDocumentCheckIcon,
    DocumentChartBarIcon,
    SwatchIcon,
    VariableIcon,
    ServerIcon,
    CommandIcon,
    PowerIcon,
    FunnelIcon as FilterIcon,
    ArrowTopRightOnSquareIcon,
    ChartBarIcon as AnalyticsIcon,
    ShieldExclamationIcon,
    GlobeAmericasIcon,
    LightBulbIcon as IdeaIcon,
    PresentationChartBarIcon,
    RectangleGroupIcon,
    TableCellsIcon,
    ArrowPathRoundedSquareIcon,
    ChatBubbleLeftRightIcon,
    ChartBarSquareIcon as ReportingIcon,
    ClipboardDocumentIcon,
    UserGroupIcon,
    DocumentDuplicateIcon,
    ChartBarIcon as DashboardIcon,
    CreditCardIcon as PaymentIcon,
    ReceiptPercentIcon as DiscountIcon,
    BuildingOffice2Icon,
    ClockIcon as HistoryIcon,
    BellIcon as NotificationsIcon,
    TagIcon as CategoryIcon,
    DocumentMagnifyingGlassIcon,
    CloudArrowUpIcon as UploadIcon,
    ShieldCheckIcon as SecurityIcon,
    SparklesIcon as AutomationIcon,
    ExclamationTriangleIcon as AlertIcon,
    Cog6ToothIcon as SettingsIcon,
    InformationCircleIcon as InfoIcon,
    CurrencyDollarIcon as FundingIcon,
    ChartPieIcon as PortfolioIcon,
    UsersIcon as CustomerIcon,
    PresentationChartLineIcon as PerformanceIcon,
    StarIcon as RatingIcon,
    HandThumbUpIcon as ApproveIcon,
    HandThumbDownIcon as RejectIcon,
    BriefcaseIcon as BusinessIcon,
    ChartLineUpIcon as GrowthIcon,
    WalletIcon as PayoutIcon,
    TicketIcon as SupportIcon,
    RocketLaunchIcon as LaunchIcon,
    BeakerIcon as TestingIcon,
    AdjustmentsVerticalIcon as CustomizeIcon,
    PaintBrushIcon as ThemeIcon,
    DevicePhoneIcon as MobileIcon,
    ComputerDesktopIcon as DesktopIcon,
    MicrophoneIcon as VoiceIcon,
    SpeakerWaveIcon as AudioIcon,
    HeadphonesIcon as HeadsetIcon,
    CircleStackIcon as DatabaseIcon,
    BugPlayIcon as DebuggingIcon,
    CodeBracketSquareIcon as CodeIcon,
    ClipboardDocumentCheckIcon as VerifyIcon,
    DocumentChartBarIcon as ReportIcon,
    SwatchIcon as StyleIcon,
    VariableIcon as VariablesIcon,
    ServerIcon as APIIcon,
    CommandIcon as CLI_Icon,
    PowerIcon as PowerSettingsIcon,
    WindowIcon as UI_Icon,
    CursorArrowRaysIcon as InteractionIcon,
    Square3Stack3DIcon as _3DIcon,
    LightBulbIcon as IdeaLightIcon,
    SunIcon as DayIcon,
    MoonIcon as NightIcon,
    CloudArrowDownIcon as DownloadIcon,
    ArrowPathRoundedSquareIcon as SyncIcon,
    ChatBubbleLeftRightIcon as ChatIcon,
    GlobeAmericasIcon as GlobalIcon,
    QuestionMarkCircleIcon as HelpIcon,
    MegaphoneIcon as MarketingIcon,
    TruckIcon as LogisticsIcon,
    ScaleIcon as LegalIcon,
    QrCodeIcon as QRCodeIcon,
    BugAntIcon as IssueIcon,
    AcademicCapIcon as EducationIcon,
    GiftIcon as PromotionIcon,
    CurrencyEuroIcon as EuroIcon,
    ArrowUpOnSquareStackIcon as DeployIcon,
    ArrowDownTrayIcon as ExportIcon,
    PlayCircleIcon as DemoIcon,
    ListBulletIcon as ChecklistIcon,
    CubeTransparentIcon as TransparencyIcon,
    WindowIcon as PopUpIcon,
    BoltIcon as SpeedIcon,
    KeyIcon as AccessKeyIcon,
    LockClosedIcon as LockIcon,
    PuzzlePieceIcon as PluginIcon,
    FingerPrintIcon as BiometricIcon,
    ArchiveBoxIcon,
    InboxStackIcon,
    InboxArrowDownIcon,
    EnvelopeOpenIcon,
    CalendarIcon,
    ChartPieIcon as PieChartIcon,
    PresentationChartBarIcon as BarChartIcon,
    PresentationChartLineIcon as LineChartIcon,
    TableCellsIcon as TableIcon,
    RectangleGroupIcon as GridIcon,
    ChartBarSquareIcon as AreaChartIcon,
    ChartBarIcon as ColumnChartIcon,
    CubeIcon as ModuleIcon,
    ServerStackIcon as InfrastructureIcon,
    CloudIcon as CloudServiceIcon,
    CodeBracketIcon as DevelopmentIcon,
    WifiIcon as ConnectivityIcon,
    LinkIcon as LinkageIcon,
    PhotoIcon as ImageIcon,
    VideoCameraIcon as VideoIcon,
    GlobeAltIcon as WebIcon,
    BookmarkIcon,
    DocumentMagnifyingGlassIcon as SearchDocIcon,
    QueueListIcon as QueueIcon,
    ClipboardDocumentIcon as ClipboardIcon,
    ClipboardDocumentCheckIcon as ComplianceIcon,
    WalletIcon as TreasuryIcon,
    BuildingOfficeIcon as EnterpriseIcon,
    BanknotesIcon as CashflowIcon,
    UsersIcon as TeamIcon,
    HandThumbUpIcon as PositiveSentimentIcon,
    HandThumbDownIcon as NegativeSentimentIcon,
    ChartBarIcon as MetricsIcon,
    PresentationChartLineIcon as TrendIcon,
    GlobeAltIcon as GeolocationIcon,
    StarIcon as FavoriteIcon,
    ShareIcon as ShareActionIcon,
    CalendarDaysIcon as EventIcon,
    CloudArrowUpIcon as UploadFileIcon,
    Cog6ToothIcon as ConfigIcon,
    ArrowUpOnSquareStackIcon as PublishIcon,
    ArrowDownTrayIcon as DownloadFileIcon,
    PlayCircleIcon as PlayIcon,
    ListBulletIcon as ListIcon,
    CubeTransparentIcon as TransparentIcon,
    WindowIcon as ModalIcon,
    CursorArrowRaysIcon as ClickIcon,
    BeakerIcon as ExperimentIcon,
    Square3Stack3DIcon as _3dObjectIcon,
    RocketLaunchIcon as LaunchProcessIcon,
    LightBulbIcon as IdeaGenIcon,
    SunIcon as BrightnessIcon,
    MoonIcon as DarkModeIcon,
    CloudArrowDownIcon as CloudDownloadIcon,
    AdjustmentsVerticalIcon as TuneIcon,
    PaintBrushIcon as StyleEditorIcon,
    DevicePhoneIcon as MobileDeviceIcon,
    ComputerDesktopIcon as DesktopComputerIcon,
    TvIcon as TelevisionIcon,
    MicrophoneIcon as MicIcon,
    SpeakerWaveIcon as SpeakerIcon,
    HeadphonesIcon as HeadphoneIcon,
    CircleStackIcon as StackIcon,
    BugPlayIcon as DebugIcon,
    CodeBracketSquareIcon as CodeEditorIcon,
    ClipboardDocumentCheckIcon as ConfirmIcon,
    DocumentChartBarIcon as ReportGenIcon,
    SwatchIcon as ColorPaletteIcon,
    VariableIcon as DynamicVariableIcon,
    ServerIcon as BackendIcon,
    CommandIcon as CLICommandIcon,
    PowerIcon as PowerControlIcon,
    FunnelIcon as FilterControlIcon,
    ArrowTopRightOnSquareIcon as ExternalLinkIcon,
    ChartBarIcon as AnalyticsDashboardIcon,
    ShieldExclamationIcon as SecurityAlertIcon,
    GlobeAmericasIcon as InternationalIcon,
    LightBulbIcon as InnovationIcon,
    PresentationChartBarIcon as BusinessIntelligenceIcon,
    RectangleGroupIcon as LayoutIcon,
    TableCellsIcon as DataGridIcon,
    ArrowPathRoundedSquareIcon as RefreshIcon,
    ChatBubbleLeftRightIcon as CommunicationIcon,
    ChartBarSquareIcon as KPIIcon,
    ClipboardDocumentIcon as DocumentManagementIcon,
    UserGroupIcon as TeamManagementIcon,
    DocumentDuplicateIcon as DuplicateIcon,
    ChartBarIcon as PerformanceChartIcon,
    CreditCardIcon as PaymentGatewayIcon,
    ReceiptPercentIcon as DiscountManagementIcon,
    BuildingOffice2Icon as CorporateIcon,
    ClockIcon as TimeManagementIcon,
    BellIcon as NotificationCenterIcon,
    TagIcon as TagManagementIcon,
    DocumentMagnifyingGlassIcon as DocumentSearchIcon,
    CloudArrowUpIcon as CloudUploadIcon,
    ShieldCheckIcon as SecurityManagementIcon,
    SparklesIcon as AutomationEngineIcon,
    ExclamationTriangleIcon as WarningIcon,
    Cog6ToothIcon as SystemSettingsIcon,
    InformationCircleIcon as InfoPanelIcon,
    CurrencyDollarIcon as FinanceIcon,
    ChartPieIcon as PortfolioManagementIcon,
    UsersIcon as CustomerManagementIcon,
    PresentationChartLineIcon as TrendAnalysisIcon,
    StarIcon as FavoriteManagementIcon,
    HandThumbUpIcon as ApprovalIcon,
    HandThumbDownIcon as RejectionIcon,
    BriefcaseIcon as BusinessOperationsIcon,
    ChartLineUpIcon as GrowthMetricsIcon,
    WalletIcon as PayoutManagementIcon,
    TicketIcon as SupportTicketIcon,
    RocketLaunchIcon as ProjectLaunchIcon,
    BeakerIcon as ExperimentationIcon,
    AdjustmentsVerticalIcon as CustomizationIcon,
    PaintBrushIcon as ThemingIcon,
    DevicePhoneIcon as MobileAppIcon,
    ComputerDesktopIcon as DesktopAppIcon,
    TvIcon as TVScreenIcon,
    MicrophoneIcon as VoiceCommandIcon,
    SpeakerWaveIcon as AudioOutputIcon,
    HeadphonesIcon as HeadphoneSupportIcon,
    CircleStackIcon as DatabaseManagementIcon,
    BugPlayIcon as DebuggingToolsIcon,
    CodeBracketSquareIcon as CodeEditorToolsIcon,
    ClipboardDocumentCheckIcon as VerificationToolsIcon,
    DocumentChartBarIcon as ReportingToolsIcon,
    SwatchIcon as ColorManagementIcon,
    VariableIcon as VariableManagementIcon,
    ServerIcon as APIManagementIcon,
    CommandIcon as CLIToolsIcon,
    PowerIcon as PowerManagementIcon,
    ArchiveBoxIcon as ArchiveIcon,
    InboxStackIcon as InboxIcon,
    InboxArrowDownIcon as ReceiveIcon,
    EnvelopeOpenIcon as EmailOpenIcon,
    CalendarIcon as DatePickerIcon,
    PieChartIcon as PieChartDisplayIcon,
    BarChartIcon as BarChartDisplayIcon,
    LineChartIcon as LineChartDisplayIcon,
    TableIcon as TableDisplayIcon,
    GridIcon as GridDisplayIcon,
    AreaChartIcon as AreaChartDisplayIcon,
    ColumnChartIcon as ColumnChartDisplayIcon,
    ModuleIcon as ModuleManagementIcon,
    InfrastructureIcon as InfrastructureManagementIcon,
    CloudServiceIcon as CloudServiceManagementIcon,
    DevelopmentIcon as DevelopmentToolsIcon,
    ConnectivityIcon as ConnectivityManagementIcon,
    LinkageIcon as LinkManagementIcon,
    ImageIcon as ImageManagementIcon,
    VideoIcon as VideoManagementIcon,
    WebIcon as WebManagementIcon,
    BookmarkIcon as BookmarkManagementIcon,
    SearchDocIcon as DocumentSearchToolsIcon,
    QueueIcon as QueueManagementIcon,
    ClipboardIcon as ClipboardToolsIcon,
    ComplianceIcon as ComplianceManagementIcon,
    TreasuryIcon as TreasuryManagementIcon,
    EnterpriseIcon as EnterpriseManagementIcon,
    CashflowIcon as CashflowManagementIcon,
    TeamIcon as TeamCollaborationIcon,
    PositiveSentimentIcon as PositiveFeedbackIcon,
    NegativeSentimentIcon as NegativeFeedbackIcon,
    MetricsIcon as MetricsTrackingIcon,
    TrendIcon as TrendTrackingIcon,
    GeolocationIcon as GeolocationTrackingIcon,
    FavoriteIcon as FavoriteTrackingIcon,
    ShareActionIcon as ShareTrackingIcon,
    EventIcon as EventManagementIcon,
    UploadFileIcon as FileUploadIcon,
    ConfigIcon as ConfigurationManagementIcon,
    PublishIcon as PublicationManagementIcon,
    DownloadFileIcon as FileDownloadIcon,
    PlayIcon as MediaPlaybackIcon,
    ListIcon as ListManagementIcon,
    TransparentIcon as TransparencyFeaturesIcon,
    ModalIcon as ModalWindowIcon,
    ClickIcon as ClickTrackingIcon,
    ExperimentIcon as ExperimentationManagementIcon,
    _3dObjectIcon as _3DObjectManagementIcon,
    LaunchProcessIcon as ProcessLaunchIcon,
    IdeaGenIcon as IdeaGenerationIcon,
    BrightnessIcon as BrightnessControlIcon,
    DarkModeIcon as DarkModeToggleIcon,
    CloudDownloadIcon as CloudDownloadServiceIcon,
    TuneIcon as TuningToolsIcon,
    StyleEditorIcon as StyleEditorToolsIcon,
    MobileDeviceIcon as MobileDeviceManagementIcon,
    DesktopComputerIcon as DesktopComputerManagementIcon,
    TelevisionIcon as TelevisionIntegrationIcon,
    MicIcon as MicrophoneInputIcon,
    SpeakerIcon as SpeakerOutputIcon,
    HeadphoneIcon as HeadphoneOutputIcon,
    StackIcon as StackManagementIcon,
    DebugIcon as DebuggingFeatureIcon,
    CodeEditorIcon as CodeEditingFeatureIcon,
    ConfirmIcon as ConfirmationFeatureIcon,
    ReportGenIcon as ReportGenerationFeatureIcon,
    ColorPaletteIcon as ColorPaletteFeatureIcon,
    DynamicVariableIcon as DynamicVariableFeatureIcon,
    BackendIcon as BackendIntegrationIcon,
    CLICommandIcon as CLICommandFeatureIcon,
    PowerControlIcon as PowerControlFeatureIcon,
    FilterControlIcon as FilterControlFeatureIcon,
    ExternalLinkIcon as ExternalLinkFeatureIcon,
    AnalyticsDashboardIcon as AnalyticsDashboardFeatureIcon,
    SecurityAlertIcon as SecurityAlertFeatureIcon,
    InternationalIcon as InternationalizationFeatureIcon,
    InnovationIcon as InnovationFeatureIcon,
    BusinessIntelligenceIcon as BusinessIntelligenceFeatureIcon,
    LayoutIcon as LayoutManagementFeatureIcon,
    DataGridIcon as DataGridFeatureIcon,
    RefreshIcon as RefreshFeatureIcon,
    CommunicationIcon as CommunicationFeatureIcon,
    KPIIcon as KPIFeatureIcon,
    DocumentManagementIcon as DocumentManagementFeatureIcon,
    TeamManagementIcon as TeamManagementFeatureIcon,
    DuplicateIcon as DuplicationFeatureIcon,
    PerformanceChartIcon as PerformanceChartFeatureIcon,
    PaymentGatewayIcon as PaymentGatewayFeatureIcon,
    DiscountManagementIcon as DiscountManagementFeatureIcon,
    CorporateIcon as CorporateFeatureIcon,
    TimeManagementIcon as TimeManagementFeatureIcon,
    NotificationCenterIcon as NotificationCenterFeatureIcon,
    TagManagementIcon as TagManagementFeatureIcon,
    DocumentSearchToolsIcon as DocumentSearchFeatureIcon,
    CloudUploadIcon as CloudUploadFeatureIcon,
    SecurityManagementIcon as SecurityManagementFeatureIcon,
    AutomationEngineIcon as AutomationEngineFeatureIcon,
    WarningIcon as WarningFeatureIcon,
    SystemSettingsIcon as SystemSettingsFeatureIcon,
    InfoPanelIcon as InfoPanelFeatureIcon,
    FinanceIcon as FinanceFeatureIcon,
    PortfolioManagementIcon as PortfolioManagementFeatureIcon,
    CustomerManagementIcon as CustomerManagementFeatureIcon,
    TrendAnalysisIcon as TrendAnalysisFeatureIcon,
    FavoriteManagementIcon as FavoriteManagementFeatureIcon,
    ApprovalIcon as ApprovalFeatureIcon,
    RejectionIcon as RejectionFeatureIcon,
    BusinessOperationsIcon as BusinessOperationsFeatureIcon,
    GrowthMetricsIcon as GrowthMetricsFeatureIcon,
    PayoutManagementIcon as PayoutManagementFeatureIcon,
    SupportTicketIcon as SupportTicketFeatureIcon,
    ProjectLaunchIcon as ProjectLaunchFeatureIcon,
    ExperimentationIcon as ExperimentationFeatureIcon,
    CustomizationIcon as CustomizationFeatureIcon,
    ThemingIcon as ThemingFeatureIcon,
    MobileAppIcon as MobileAppFeatureIcon,
    DesktopAppIcon as DesktopAppFeatureIcon,
    TVScreenIcon as TVScreenFeatureIcon,
    VoiceCommandIcon as VoiceCommandFeatureIcon,
    AudioOutputIcon as AudioOutputFeatureIcon,
    HeadphoneSupportIcon as HeadphoneSupportFeatureIcon,
    DatabaseManagementIcon as DatabaseManagementFeatureIcon,
    DebuggingToolsIcon as DebuggingToolsFeatureIcon,
    CodeEditorToolsIcon as CodeEditorToolsFeatureIcon,
    VerificationToolsIcon as VerificationToolsFeatureIcon,
    ReportingToolsIcon as ReportingToolsFeatureIcon,
    ColorManagementIcon as ColorManagementFeatureIcon,
    VariableManagementIcon as VariableManagementFeatureIcon,
    APIManagementIcon as APIManagementFeatureIcon,
    CLIToolsIcon as CLIToolsFeatureIcon,
    PowerManagementIcon as PowerManagementFeatureIcon,
} from '@heroicons/react/24/outline';
import Select from 'react-select';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// --- Constants and Enums ---
export enum ApplicationStatus {
    PENDING_REVIEW = 'PENDING_REVIEW',
    AI_PRE_SCREEN = 'AI_PRE_SCREEN',
    DOCUMENT_VERIFICATION = 'DOCUMENT_VERIFICATION',
    UNDERWRITING = 'UNDERWRITING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    FUNDED = 'FUNDED',
    WITHDRAWN = 'WITHDRAWN',
    CLOSED = 'CLOSED',
    ON_HOLD = 'ON_HOLD',
    PENDING_CUSTOMER_ACTION = 'PENDING_CUSTOMER_ACTION',
    ESCALATED = 'ESCALATED',
    COLLECTION = 'COLLECTION',
    REFINANCED = 'REFINANCED',
}

export enum LoanType {
    PERSONAL = 'PERSONAL',
    BUSINESS = 'BUSINESS',
    MORTGAGE = 'MORTGAGE',
    AUTO = 'AUTO',
    STUDENT = 'STUDENT',
    SME = 'SME',
    COMMERCIAL_REAL_ESTATE = 'COMMERCIAL_REAL_ESTATE',
    EQUIPMENT_FINANCE = 'EQUIPMENT_FINANCE',
    INVOICE_FINANCE = 'INVOICE_FINANCE',
    MICRO_LOAN = 'MICRO_LOAN',
    REVOLVING_CREDIT = 'REVOLVING_CREDIT',
    BRIDGE_LOAN = 'BRIDGE_LOAN',
}

export enum RiskLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
    UNKNOWN = 'UNKNOWN',
}

export enum DocumentType {
    IDENTIFICATION = 'IDENTIFICATION',
    PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
    INCOME_STATEMENT = 'INCOME_STATEMENT',
    BANK_STATEMENT = 'BANK_STATEMENT',
    BUSINESS_PLAN = 'BUSINESS_PLAN',
    COLLATERAL_DOCS = 'COLLATERAL_DOCS',
    CREDIT_REPORT = 'CREDIT_REPORT',
    TAX_RETURNS = 'TAX_RETURNS',
    LEASE_AGREEMENT = 'LEASE_AGREEMENT',
    INVOICES = 'INVOICES',
    OTHER = 'OTHER',
}

export enum UnderwriterAction {
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
    REQUEST_MORE_INFO = 'REQUEST_MORE_INFO',
    ESCALATE = 'ESCALATE',
    FORWARD_TO_LEGAL = 'FORWARD_TO_LEGAL',
    CONDITIONALLY_APPROVE = 'CONDITIONALLY_APPROVE',
}

export enum CreditScoreModel {
    FICO = 'FICO',
    VANTAGESCORE = 'VANTAGESCORE',
    PROPRIETARY_AI = 'PROPRIETARY_AI',
    EXTERNAL_API = 'EXTERNAL_API',
}

export enum PaymentStatus {
    PAID = 'PAID',
    PARTIAL = 'PARTIAL',
    DUE = 'DUE',
    OVERDUE = 'OVERDUE',
    SETTLED = 'SETTLED',
    DEFAULTED = 'DEFAULTED',
    PENDING = 'PENDING',
}

export const API_BASE_URL = '/api/loan-origination';
export const ITEMS_PER_PAGE = 10;
export const LOAN_INTEREST_RATES = {
    [LoanType.PERSONAL]: { LOW: 0.05, MEDIUM: 0.08, HIGH: 0.12, CRITICAL: 0.18 },
    [LoanType.BUSINESS]: { LOW: 0.07, MEDIUM: 0.10, HIGH: 0.15, CRITICAL: 0.20 },
    [LoanType.MORTGAGE]: { LOW: 0.03, MEDIUM: 0.04, HIGH: 0.06, CRITICAL: 0.09 },
    [LoanType.AUTO]: { LOW: 0.04, MEDIUM: 0.06, HIGH: 0.09, CRITICAL: 0.14 },
    // ... add more as needed
};

// --- Interfaces for Data Models ---
export interface LoanApplicant {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    nationality: string;
    nationalId: string;
    employmentStatus: string;
    annualIncome: number;
    dependents: number;
    creditScore: number;
    existingDebts: number;
    assetsValue: number;
    businessType?: string;
    yearsInBusiness?: number;
    registrationNumber?: string;
}

export interface LoanApplication {
    id: string;
    applicantId: string;
    applicantName: string; // Denormalized for display
    loanType: LoanType;
    amountRequested: number;
    termMonths: number;
    purpose: string;
    applicationDate: string;
    status: ApplicationStatus;
    aiScore: number;
    riskLevel: RiskLevel;
    assignedUnderwriterId?: string;
    assignedUnderwriterName?: string;
    lastUpdated: string;
    rejectionReason?: string;
    offerDetails?: LoanOffer;
    documents: LoanDocument[];
    notes: ApplicationNote[];
    auditTrail: AuditLog[];
    relatedTasks: LoanTask[];
    paymentSchedule?: LoanPayment[];
    collateralDetails?: Collateral[];
    sourceChannel: string; // e.g., 'Website', 'Partner API', 'Referral'
    marketingCampaignId?: string;
    processingFee?: number;
    insurancePremium?: number;
    decisionEngineOutput?: DecisionEngineOutput;
    complianceChecks?: ComplianceCheck[];
    fraudDetectionScore?: number;
    sentimentAnalysisScore?: number; // from applicant communications
    recommendedAction?: string; // AI recommendation
    customFields?: { [key: string]: string };
}

export interface LoanOffer {
    loanApplicationId: string;
    offeredAmount: number;
    interestRate: number;
    annualPercentageRate: number;
    termMonths: number;
    monthlyPayment: number;
    totalRepayment: number;
    acceptanceDeadline: string;
    offerDate: string;
    offerStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
    conditions: string[];
    fees: { type: string; amount: number }[];
    amortizationSchedule: AmortizationEntry[];
}

export interface AmortizationEntry {
    month: number;
    startingBalance: number;
    interestPayment: number;
    principalPayment: number;
    totalPayment: number;
    endingBalance: number;
}

export interface LoanDocument {
    id: string;
    loanApplicationId: string;
    documentType: DocumentType;
    fileName: string;
    fileUrl: string;
    uploadDate: string;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'MISSING';
    verificationNotes?: string;
    uploadedBy: string;
    checksum?: string;
    ocrData?: { [key: string]: string }; // Extracted data from OCR
    signatureStatus?: 'SIGNED' | 'PENDING_SIGNATURE' | 'NOT_REQUIRED';
    aiVerificationScore?: number;
    sensitiveDataMasked?: boolean;
}

export interface ApplicationNote {
    id: string;
    loanApplicationId: string;
    authorId: string;
    authorName: string;
    timestamp: string;
    content: string;
    isPrivate: boolean;
    tags: string[];
}

export interface AuditLog {
    id: string;
    loanApplicationId: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string; // e.g., 'STATUS_CHANGE', 'DOCUMENT_UPLOAD', 'NOTE_ADDED'
    details: string;
    ipAddress?: string;
}

export interface LoanTask {
    id: string;
    loanApplicationId: string;
    title: string;
    description: string;
    assignedToId: string;
    assignedToName: string;
    dueDate: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    creationDate: string;
    completionDate?: string;
    relatedDocumentId?: string;
}

export interface LoanPayment {
    id: string;
    loanApplicationId: string;
    paymentNumber: number;
    dueDate: string;
    amountDue: number;
    amountPaid: number;
    paymentDate?: string;
    status: PaymentStatus;
    principalAmount: number;
    interestAmount: number;
    penaltyFee?: number;
    remainingBalance: number;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'UNDERWRITER' | 'SALES' | 'COLLECTIONS' | 'COMPLIANCE' | 'CUSTOMER_SERVICE' | 'DATA_ANALYST';
    firstName: string;
    lastName: string;
    isActive: boolean;
    lastLogin: string;
    assignedApplicationsCount: number;
    permissions: string[];
}

export interface Collateral {
    id: string;
    loanApplicationId: string;
    type: string; // e.g., 'Real Estate', 'Vehicle', 'Equipment'
    description: string;
    estimatedValue: number;
    valuationDate: string;
    lienStatus: 'CLEAR' | 'ENCUMBERED';
    documentIds: string[]; // IDs of related documents
    valuationReportUrl?: string;
    insurancePolicyNumber?: string;
    riskAssessment?: RiskLevel;
}

export interface DecisionEngineOutput {
    decision: 'APPROVE' | 'REJECT' | 'REFER';
    reasonCodes: string[];
    riskScore: number;
    recommendedLoanAmount?: number;
    recommendedInterestRate?: number;
    modelVersion: string;
    timestamp: string;
    rulesTriggered: string[];
    confidenceScore: number;
}

export interface ComplianceCheck {
    id: string;
    loanApplicationId: string;
    checkType: string; // e.g., 'AML', 'KYC', 'GDPR', 'Fair Lending'
    status: 'PASSED' | 'FAILED' | 'PENDING';
    details: string;
    checkedBy: string;
    checkDate: string;
    remediationActions?: string[];
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: 'ALERT' | 'INFO' | 'WARNING' | 'TASK';
    isRead: boolean;
    timestamp: string;
    link?: string;
    icon?: string;
}

export interface Alert {
    id: string;
    loanApplicationId?: string;
    type: 'FRAUD' | 'HIGH_RISK_CHANGE' | 'DEFAULT_PREDICTION' | 'COMPLIANCE_BREACH' | 'SYSTEM_ERROR' | 'ANOMALY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    timestamp: string;
    resolved: boolean;
    resolvedBy?: string;
    resolutionNotes?: string;
    triggerDetails: { [key: string]: any }; // Detailed context for the alert
}

export interface Settings {
    theme: 'light' | 'dark';
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    defaultCurrency: string;
    aiAutoApproveThreshold: number;
    documentVerificationThreshold: number;
    fraudDetectionSensitivity: number;
    dataRetentionPolicy: number; // in days
}

export interface ReportData {
    id: string;
    name: string;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'AD_HOC';
    generationDate: string;
    parameters: { [key: string]: any };
    downloadUrl: string;
    generatedBy: string;
}

// --- Mock Data Service (Replace with actual API calls in production) ---
const mockApplications: LoanApplication[] = Array.from({ length: 50 }, (_, i) => ({
    id: `app-${i + 1}`,
    applicantId: `user-${i + 1}`,
    applicantName: `John Doe ${i + 1}`,
    loanType: Object.values(LoanType)[Math.floor(Math.random() * Object.values(LoanType).length)],
    amountRequested: 10000 + i * 500,
    termMonths: 12 + (i % 24),
    purpose: `Personal loan for home improvement ${i + 1}`,
    applicationDate: new Date(Date.now() - i * 86400000).toISOString(),
    status: Object.values(ApplicationStatus)[Math.floor(Math.random() * Object.values(ApplicationStatus).length)],
    aiScore: 300 + i * 10,
    riskLevel: Object.values(RiskLevel)[Math.floor(Math.random() * Object.values(RiskLevel).length)],
    assignedUnderwriterId: `uw-${(i % 5) + 1}`,
    assignedUnderwriterName: `Underwriter ${Math.floor(Math.random() * 5) + 1}`,
    lastUpdated: new Date(Date.now() - i * 3600000).toISOString(),
    documents: [],
    notes: [],
    auditTrail: [],
    relatedTasks: [],
    sourceChannel: Math.random() > 0.5 ? 'Website' : 'Partner API',
    fraudDetectionScore: Math.random() * 100,
    sentimentAnalysisScore: Math.random() * 2 - 1,
    recommendedAction: Math.random() > 0.7 ? 'Approve' : 'Refer to Senior UW',
    complianceChecks: [],
    decisionEngineOutput: {
        decision: Math.random() > 0.7 ? 'APPROVE' : Math.random() > 0.5 ? 'REJECT' : 'REFER',
        reasonCodes: ['CRITICAL_RISK', 'LOW_CREDIT_SCORE', 'INSUFFICIENT_INCOME'],
        riskScore: Math.floor(Math.random() * 1000),
        modelVersion: 'v1.2.3',
        timestamp: new Date().toISOString(),
        rulesTriggered: ['Rule_A', 'Rule_B'],
        confidenceScore: Math.random(),
    },
    offerDetails: i % 3 === 0 ? {
        loanApplicationId: `app-${i + 1}`,
        offeredAmount: 10000 + i * 450,
        interestRate: parseFloat((0.05 + Math.random() * 0.1).toFixed(4)),
        annualPercentageRate: parseFloat((0.07 + Math.random() * 0.1).toFixed(4)),
        termMonths: 12 + (i % 24),
        monthlyPayment: 500 + i * 10,
        totalRepayment: 12000 + i * 1500,
        acceptanceDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        offerDate: new Date().toISOString(),
        offerStatus: 'PENDING',
        conditions: ['Provide additional ID', 'Sign digital agreement'],
        fees: [{ type: 'Origination', amount: 250 }],
        amortizationSchedule: [], // Filled dynamically
    } : undefined,
}));

const mockUnderwriters: UserProfile[] = Array.from({ length: 5 }, (_, i) => ({
    id: `uw-${i + 1}`,
    username: `underwriter${i + 1}`,
    email: `uw${i + 1}@example.com`,
    role: 'UNDERWRITER',
    firstName: `Underwriter ${i + 1}`,
    lastName: `Lastname ${i + 1}`,
    isActive: true,
    lastLogin: new Date().toISOString(),
    assignedApplicationsCount: Math.floor(Math.random() * 10),
    permissions: ['view_all_applications', 'approve_loans', 'reject_loans', 'add_notes', 'assign_tasks'],
}));

const mockAlerts: Alert[] = Array.from({ length: 15 }, (_, i) => ({
    id: `alert-${i + 1}`,
    loanApplicationId: `app-${i + 1}`,
    type: Object.values(Alert['type'])[Math.floor(Math.random() * Object.values(Alert['type']).length)],
    severity: Object.values(Alert['severity'])[Math.floor(Math.random() * Object.values(Alert['severity']).length)],
    message: `Alert message for application ${i + 1}: Something happened.`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    resolved: i % 3 === 0,
    triggerDetails: { field: 'income', oldValue: 50000, newValue: 10000 },
}));

const generateAmortizationSchedule = (principal: number, annualInterestRate: number, termMonths: number): AmortizationEntry[] => {
    const monthlyInterestRate = annualInterestRate / 12;
    const monthlyPayment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) / (Math.pow(1 + monthlyInterestRate, termMonths) - 1);

    const schedule: AmortizationEntry[] = [];
    let remainingBalance = principal;

    for (let month = 1; month <= termMonths; month++) {
        const interestPayment = remainingBalance * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;

        schedule.push({
            month,
            startingBalance: parseFloat((remainingBalance + principalPayment).toFixed(2)),
            interestPayment: parseFloat(interestPayment.toFixed(2)),
            principalPayment: parseFloat(principalPayment.toFixed(2)),
            totalPayment: parseFloat(monthlyPayment.toFixed(2)),
            endingBalance: parseFloat(remainingBalance.toFixed(2))
        });
    }
    return schedule;
};


const fetchApplications = async (
    page: number,
    limit: number,
    filters: any,
    sort: any
): Promise<{ applications: LoanApplication[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    let filtered = mockApplications;

    if (filters.status) {
        filtered = filtered.filter(app => app.status === filters.status);
    }
    if (filters.loanType) {
        filtered = filtered.filter(app => app.loanType === filters.loanType);
    }
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(app =>
            app.applicantName.toLowerCase().includes(searchTerm) ||
            app.id.toLowerCase().includes(searchTerm) ||
            app.purpose.toLowerCase().includes(searchTerm)
        );
    }
    if (filters.minAmount) {
        filtered = filtered.filter(app => app.amountRequested >= filters.minAmount);
    }
    if (filters.maxAmount) {
        filtered = filtered.filter(app => app.amountRequested <= filters.maxAmount);
    }
    if (filters.riskLevel) {
        filtered = filtered.filter(app => app.riskLevel === filters.riskLevel);
    }
    if (filters.underwriterId) {
        filtered = filtered.filter(app => app.assignedUnderwriterId === filters.underwriterId);
    }
    if (filters.dateRange && filters.dateRange.startDate && filters.dateRange.endDate) {
        const start = new Date(filters.dateRange.startDate);
        const end = new Date(filters.dateRange.endDate);
        filtered = filtered.filter(app => {
            const appDate = new Date(app.applicationDate);
            return appDate >= start && appDate <= end;
        });
    }

    if (sort.field && sort.direction) {
        filtered.sort((a, b) => {
            const aValue = a[sort.field as keyof LoanApplication];
            const bValue = b[sort.field as keyof LoanApplication];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
            // Fallback for other types or nulls
            return 0;
        });
    }


    const start = (page - 1) * limit;
    const end = start + limit;
    const applications = filtered.slice(start, end);

    return { applications, total: filtered.length };
};

const fetchApplicationById = async (id: string): Promise<LoanApplication> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const app = mockApplications.find(app => app.id === id);
    if (!app) {
        throw new Error('Application not found');
    }

    // Generate amortization schedule if offer exists and it's empty
    if (app.offerDetails && app.offerDetails.amortizationSchedule.length === 0) {
        app.offerDetails.amortizationSchedule = generateAmortizationSchedule(
            app.offerDetails.offeredAmount,
            app.offerDetails.interestRate,
            app.offerDetails.termMonths
        );
    }
    return app;
};

const updateApplication = async (updatedApp: LoanApplication): Promise<LoanApplication> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockApplications.findIndex(app => app.id === updatedApp.id);
    if (index > -1) {
        mockApplications[index] = { ...mockApplications[index], ...updatedApp, lastUpdated: new Date().toISOString() };
        return mockApplications[index];
    }
    throw new Error('Application not found for update');
};

const createApplication = async (newApp: Partial<LoanApplication>): Promise<LoanApplication> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newId = `app-${mockApplications.length + 1}`;
    const application: LoanApplication = {
        id: newId,
        applicantId: newApp.applicantId || `temp-user-${mockApplications.length + 1}`,
        applicantName: newApp.applicantName || 'New Applicant',
        loanType: newApp.loanType || LoanType.PERSONAL,
        amountRequested: newApp.amountRequested || 0,
        termMonths: newApp.termMonths || 0,
        purpose: newApp.purpose || 'Not specified',
        applicationDate: new Date().toISOString(),
        status: ApplicationStatus.PENDING_REVIEW,
        aiScore: 0,
        riskLevel: RiskLevel.UNKNOWN,
        lastUpdated: new Date().toISOString(),
        documents: [],
        notes: [],
        auditTrail: [],
        relatedTasks: [],
        sourceChannel: newApp.sourceChannel || 'Manual Entry',
        fraudDetectionScore: 0,
        sentimentAnalysisScore: 0,
        recommendedAction: 'Process manually',
        complianceChecks: [],
        decisionEngineOutput: {
            decision: 'REFER',
            reasonCodes: ['MANUAL_ENTRY'],
            riskScore: 0,
            modelVersion: 'v0.0.1',
            timestamp: new Date().toISOString(),
            rulesTriggered: [],
            confidenceScore: 0,
        },
        ...newApp,
    };
    mockApplications.unshift(application); // Add to the beginning
    return application;
};


const fetchUnderwriters = async (): Promise<UserProfile[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUnderwriters.filter(uw => uw.role === 'UNDERWRITER');
};

const fetchAlerts = async (): Promise<Alert[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockAlerts.filter(alert => !alert.resolved);
}

// --- Utility Functions ---
export const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(value);
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
        case ApplicationStatus.APPROVED: return 'text-green-500 bg-green-900/20';
        case ApplicationStatus.FUNDED: return 'text-blue-500 bg-blue-900/20';
        case ApplicationStatus.REJECTED:
        case ApplicationStatus.WITHDRAWN: return 'text-red-500 bg-red-900/20';
        case ApplicationStatus.UNDERWRITING: return 'text-yellow-500 bg-yellow-900/20';
        case ApplicationStatus.AI_PRE_SCREEN:
        case ApplicationStatus.DOCUMENT_VERIFICATION:
        case ApplicationStatus.PENDING_REVIEW:
        case ApplicationStatus.PENDING_CUSTOMER_ACTION: return 'text-indigo-500 bg-indigo-900/20';
        case ApplicationStatus.ON_HOLD: return 'text-orange-500 bg-orange-900/20';
        case ApplicationStatus.ESCALATED: return 'text-pink-500 bg-pink-900/20';
        case ApplicationStatus.COLLECTION: return 'text-red-600 bg-red-900/30';
        case ApplicationStatus.REFINANCED: return 'text-teal-500 bg-teal-900/20';
        case ApplicationStatus.CLOSED: return 'text-gray-500 bg-gray-900/20';
        default: return 'text-gray-400 bg-gray-700/20';
    }
};

export const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
        case RiskLevel.LOW: return 'text-green-400';
        case RiskLevel.MEDIUM: return 'text-yellow-400';
        case RiskLevel.HIGH: return 'text-orange-400';
        case RiskLevel.CRITICAL: return 'text-red-400';
        default: return 'text-gray-400';
    }
};

export const getPriorityColor = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (priority) {
        case 'LOW': return 'text-green-400';
        case 'MEDIUM': return 'text-yellow-400';
        case 'HIGH': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

// --- Custom Hooks ---
export const useApplications = (page: number, limit: number, filters: any, sort: any) => {
    return useQuery<
        { applications: LoanApplication[]; total: number },
        Error
    >(
        ['loanApplications', page, limit, filters, sort],
        () => fetchApplications(page, limit, filters, sort),
        {
            keepPreviousData: true,
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        }
    );
};

export const useApplicationById = (id: string | null) => {
    return useQuery<LoanApplication, Error>(
        ['loanApplication', id],
        () => fetchApplicationById(id!),
        {
            enabled: !!id, // Only run the query if id is provided
            staleTime: 5 * 60 * 1000,
        }
    );
};

export const useUpdateApplication = () => {
    const queryClient = useQueryClient();
    return useMutation<LoanApplication, Error, LoanApplication>(
        updateApplication,
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(['loanApplications']); // Invalidate list
                queryClient.invalidateQueries(['loanApplication', data.id]); // Invalidate single application
                toast.success(`Application ${data.id} updated successfully!`);
            },
            onError: (error) => {
                toast.error(`Error updating application: ${error.message}`);
            },
        }
    );
};

export const useCreateApplication = () => {
    const queryClient = useQueryClient();
    return useMutation<LoanApplication, Error, Partial<LoanApplication>>(
        createApplication,
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(['loanApplications']);
                toast.success(`New application ${data.id} created!`);
            },
            onError: (error) => {
                toast.error(`Error creating application: ${error.message}`);
            }
        }
    )
}

export const useUnderwriters = () => {
    return useQuery<UserProfile[], Error>(
        ['underwriters'],
        fetchUnderwriters,
        {
            staleTime: Infinity, // Underwriters list doesn't change often
        }
    );
};

export const useAlerts = () => {
    return useQuery<Alert[], Error>(
        ['alerts'],
        fetchAlerts,
        {
            refetchInterval: 30 * 1000, // Refetch every 30 seconds
        }
    );
}

// --- Components ---

interface StatusBadgeProps {
    status: ApplicationStatus;
}
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
        {status.replace(/_/g, ' ')}
    </span>
);

interface RiskBadgeProps {
    riskLevel: RiskLevel;
}
export const RiskBadge: React.FC<RiskBadgeProps> = ({ riskLevel }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(riskLevel)} bg-gray-900/20`}>
        <ExclamationTriangleIcon className="inline-block w-3 h-3 mr-1" />
        {riskLevel.replace(/_/g, ' ')}
    </span>
);

interface PriorityBadgeProps {
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}
export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(priority)} bg-gray-900/20`}>
        <TagIcon className="inline-block w-3 h-3 mr-1" />
        {priority}
    </span>
);

interface FilterButtonProps {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    isActive: boolean;
}
export const FilterButton: React.FC<FilterButtonProps> = ({ label, icon: Icon, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200
            ${isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
    >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
    </button>
);

interface SortableHeaderProps {
    label: string;
    field: string;
    currentSort: { field: string; direction: 'asc' | 'desc' };
    onSort: (field: string) => void;
}
export const SortableHeader: React.FC<SortableHeaderProps> = ({ label, field, currentSort, onSort }) => (
    <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer select-none"
        onClick={() => onSort(field)}
    >
        <div className="flex items-center">
            {label}
            {currentSort.field === field && (
                <span className="ml-1">
                    {currentSort.direction === 'asc' ? ' ↑' : ' ↓'}
                </span>
            )}
        </div>
    </th>
);

interface PaginatorProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
export const Paginator: React.FC<PaginatorProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = useMemo(() => {
        const p = [];
        for (let i = 1; i <= totalPages; i++) {
            p.push(i);
        }
        return p;
    }, [totalPages]);

    return (
        <nav className="flex items-center justify-between border-t border-gray-700 px-4 py-3 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="h-5 w-5 mr-2" /> Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next <ChevronRightIcon className="h-5 w-5 ml-2" />
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-400">
                        Page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {pages.map(page => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                    ${page === currentPage
                                        ? 'z-10 bg-blue-600 border-blue-500 text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </nav>
    );
};

export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className={`relative bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]}`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}
export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            ref={ref}
        >
            {children}
            {isVisible && (
                <div
                    className="absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg shadow-sm whitespace-nowrap"
                    style={{
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '8px',
                    }}
                >
                    {content}
                </div>
            )}
        </div>
    );
};

export const CustomSelect: React.FC<any> = (props) => (
    <Select
        {...props}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
            control: (base, state) => ({
                ...base,
                backgroundColor: '#374151', // gray-700
                borderColor: '#4b5563', // gray-600
                color: 'white',
                '&:hover': {
                    borderColor: '#6b7280', // gray-500
                },
            }),
            menu: (base) => ({
                ...base,
                backgroundColor: '#374151', // gray-700
            }),
            option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? '#4b5563' : state.isSelected ? '#1f2937' : '#374151', // gray-600, gray-800, gray-700
                color: 'white',
                '&:hover': {
                    backgroundColor: '#4b5563',
                },
            }),
            singleValue: (base) => ({
                ...base,
                color: 'white',
            }),
            input: (base) => ({
                ...base,
                color: 'white',
            }),
            placeholder: (base) => ({
                ...base,
                color: '#9ca3af', // gray-400
            }),
        }}
    />
);

export const DropdownMenu: React.FC<{ trigger: React.ReactNode; children: React.ReactNode }> = ({ trigger, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export const DropdownMenuItem: React.FC<{ onClick: () => void; icon?: React.ElementType; children: React.ReactNode }> = ({ onClick, icon: Icon, children }) => (
    <button
        onClick={onClick}
        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left flex items-center space-x-2"
        role="menuitem"
    >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
    </button>
);

// --- Detailed Views / Sub-components ---

interface LoanApplicationDetailProps {
    application: LoanApplication;
    onClose: () => void;
    onUpdate: (updatedApp: LoanApplication) => void;
}
export const LoanApplicationDetail: React.FC<LoanApplicationDetailProps> = ({ application, onClose, onUpdate }) => {
    const [currentTab, setCurrentTab] = useState<'overview' | 'documents' | 'notes' | 'tasks' | 'audit' | 'offer' | 'payments' | 'collateral' | 'compliance'>('overview');
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [editedAmount, setEditedAmount] = useState(application.amountRequested);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [editedStatus, setEditedStatus] = useState<ApplicationStatus>(application.status);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteIsPrivate, setNewNoteIsPrivate] = useState(false);
    const [isUploadingDocument, setIsUploadingDocument] = useState(false);
    const [newDocumentType, setNewDocumentType] = useState<DocumentType>(DocumentType.OTHER);
    const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
    const [isAssigningUnderwriter, setIsAssigningUnderwriter] = useState(false);
    const [selectedUnderwriterId, setSelectedUnderwriterId] = useState<string | undefined>(application.assignedUnderwriterId);

    const { data: underwriters } = useUnderwriters();
    const updateAppMutation = useUpdateApplication();

    const handleSaveAmount = async () => {
        if (editedAmount !== application.amountRequested) {
            const updatedApp = { ...application, amountRequested: editedAmount };
            try {
                await updateAppMutation.mutateAsync(updatedApp);
                onUpdate(updatedApp); // Propagate update to parent
                toast.success('Amount updated successfully!');
            } catch (err: any) {
                toast.error(`Failed to update amount: ${err.message}`);
            }
        }
        setIsEditingAmount(false);
    };

    const handleSaveStatus = async () => {
        if (editedStatus !== application.status) {
            const updatedApp = { ...application, status: editedStatus };
            try {
                await updateAppMutation.mutateAsync(updatedApp);
                onUpdate(updatedApp);
                toast.success('Status updated successfully!');
            } catch (err: any) {
                toast.error(`Failed to update status: ${err.message}`);
            }
        }
        setIsEditingStatus(false);
    };

    const handleAssignUnderwriter = async () => {
        if (selectedUnderwriterId === application.assignedUnderwriterId) {
            setIsAssigningUnderwriter(false);
            return;
        }

        const selectedUW = underwriters?.find(uw => uw.id === selectedUnderwriterId);
        const updatedApp = {
            ...application,
            assignedUnderwriterId: selectedUnderwriterId,
            assignedUnderwriterName: selectedUW ? `${selectedUW.firstName} ${selectedUW.lastName}` : undefined,
            auditTrail: [
                ...(application.auditTrail || []),
                {
                    id: `audit-${Date.now()}`,
                    loanApplicationId: application.id,
                    timestamp: new Date().toISOString(),
                    userId: 'current_user_id', // Replace with actual user
                    userName: 'Current User',
                    action: 'UNDERWRITER_ASSIGNMENT',
                    details: `Assigned to ${selectedUW?.firstName} ${selectedUW?.lastName || 'N/A'}`,
                }
            ]
        };
        try {
            await updateAppMutation.mutateAsync(updatedApp);
            onUpdate(updatedApp);
            toast.success('Underwriter assigned successfully!');
        } catch (err: any) {
            toast.error(`Failed to assign underwriter: ${err.message}`);
        }
        setIsAssigningUnderwriter(false);
    };

    const handleAddNote = async () => {
        if (!newNoteContent.trim()) {
            toast.error('Note content cannot be empty.');
            return;
        }
        const newNote: ApplicationNote = {
            id: `note-${Date.now()}`,
            loanApplicationId: application.id,
            authorId: 'current_user_id',
            authorName: 'Current User', // Replace with actual user
            timestamp: new Date().toISOString(),
            content: newNoteContent,
            isPrivate: newNoteIsPrivate,
            tags: [],
        };
        const updatedApp = {
            ...application,
            notes: [...(application.notes || []), newNote],
            auditTrail: [
                ...(application.auditTrail || []),
                {
                    id: `audit-${Date.now() + 1}`,
                    loanApplicationId: application.id,
                    timestamp: new Date().toISOString(),
                    userId: 'current_user_id',
                    userName: 'Current User',
                    action: 'NOTE_ADDED',
                    details: `Note added: "${newNoteContent.substring(0, 50)}..."`,
                }
            ]
        };

        try {
            await updateAppMutation.mutateAsync(updatedApp);
            onUpdate(updatedApp);
            toast.success('Note added successfully!');
            setNewNoteContent('');
            setNewNoteIsPrivate(false);
            setIsAddingNote(false);
        } catch (err: any) {
            toast.error(`Failed to add note: ${err.message}`);
        }
    };

    const handleDocumentUpload = async () => {
        if (!newDocumentFile) {
            toast.error('Please select a file to upload.');
            return;
        }
        if (!newDocumentType) {
            toast.error('Please select a document type.');
            return;
        }
        // Simulate file upload
        const document: LoanDocument = {
            id: `doc-${Date.now()}`,
            loanApplicationId: application.id,
            documentType: newDocumentType,
            fileName: newDocumentFile.name,
            fileUrl: `/uploads/${application.id}/${newDocumentFile.name}`, // Placeholder URL
            uploadDate: new Date().toISOString(),
            verificationStatus: 'PENDING',
            uploadedBy: 'Current User',
            aiVerificationScore: Math.floor(Math.random() * 100),
        };

        const updatedApp = {
            ...application,
            documents: [...(application.documents || []), document],
            auditTrail: [
                ...(application.auditTrail || []),
                {
                    id: `audit-${Date.now() + 2}`,
                    loanApplicationId: application.id,
                    timestamp: new Date().toISOString(),
                    userId: 'current_user_id',
                    userName: 'Current User',
                    action: 'DOCUMENT_UPLOADED',
                    details: `Document uploaded: ${newDocumentFile.name} (${newDocumentType})`,
                }
            ]
        };

        try {
            await updateAppMutation.mutateAsync(updatedApp);
            onUpdate(updatedApp);
            toast.success('Document uploaded successfully!');
            setNewDocumentFile(null);
            setNewDocumentType(DocumentType.OTHER);
            setIsUploadingDocument(false);
        } catch (err: any) {
            toast.error(`Failed to upload document: ${err.message}`);
        }
    };

    const getTabClassName = (tabName: string) =>
        `px-4 py-2 text-sm font-medium rounded-t-md transition-colors duration-200 ${
            currentTab === tabName
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`;

    const renderOfferDetails = (offer: LoanOffer) => {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card title="Offered Amount">
                        <p className="text-xl font-bold text-green-400">{formatCurrency(offer.offeredAmount)}</p>
                    </Card>
                    <Card title="Interest Rate (APR)">
                        <p className="text-xl font-bold text-white">{(offer.annualPercentageRate * 100).toFixed(2)}%</p>
                    </Card>
                    <Card title="Term">
                        <p className="text-xl font-bold text-white">{offer.termMonths} Months</p>
                    </Card>
                    <Card title="Monthly Payment">
                        <p className="text-xl font-bold text-white">{formatCurrency(offer.monthlyPayment)}</p>
                    </Card>
                    <Card title="Total Repayment">
                        <p className="text-xl font-bold text-white">{formatCurrency(offer.totalRepayment)}</p>
                    </Card>
                    <Card title="Offer Status">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${offer.offerStatus === 'ACCEPTED' ? 'text-green-500 bg-green-900/20' : offer.offerStatus === 'REJECTED' ? 'text-red-500 bg-red-900/20' : 'text-indigo-500 bg-indigo-900/20'}`}>
                            {offer.offerStatus}
                        </span>
                    </Card>
                </div>

                <Card title="Offer Conditions & Fees">
                    <h4 className="font-semibold text-gray-200 mb-2">Conditions:</h4>
                    {offer.conditions && offer.conditions.length > 0 ? (
                        <ul className="list-disc list-inside text-gray-400 space-y-1">
                            {offer.conditions.map((condition, i) => <li key={i}>{condition}</li>)}
                        </ul>
                    ) : <p className="text-gray-400">No special conditions.</p>}
                    <h4 className="font-semibold text-gray-200 mt-4 mb-2">Fees:</h4>
                    {offer.fees && offer.fees.length > 0 ? (
                        <ul className="text-gray-400 space-y-1">
                            {offer.fees.map((fee, i) => <li key={i}>{fee.type}: {formatCurrency(fee.amount)}</li>)}
                        </ul>
                    ) : <p className="text-gray-400">No additional fees.</p>}
                </Card>

                <Card title="Amortization Schedule">
                    {offer.amortizationSchedule && offer.amortizationSchedule.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Month</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Starting Balance</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Interest Payment</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Principal Payment</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Payment</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ending Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700 bg-gray-800">
                                    {offer.amortizationSchedule.map(entry => (
                                        <tr key={entry.month}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{entry.month}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(entry.startingBalance)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(entry.interestPayment)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(entry.principalPayment)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(entry.totalPayment)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(entry.endingBalance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-gray-400">No amortization schedule generated yet.</p>}
                </Card>
            </div>
        );
    };

    const renderPaymentSchedule = (payments: LoanPayment[]) => {
        if (!payments || payments.length === 0) {
            return <p className="text-gray-400">No payment schedule available.</p>;
        }

        const data = {
            labels: payments.map(p => `Month ${p.paymentNumber}`),
            datasets: [
                {
                    label: 'Amount Due',
                    data: payments.map(p => p.amountDue),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1,
                },
                {
                    label: 'Amount Paid',
                    data: payments.map(p => p.amountPaid),
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    tension: 0.1,
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top' as const,
                    labels: {
                        color: 'white',
                    },
                },
                title: {
                    display: true,
                    text: 'Payment Schedule vs. Actual Payments',
                    color: 'white',
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        color: 'white',
                    },
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        color: 'white',
                        callback: function (value: any) {
                            return formatCurrency(value, '$');
                        }
                    },
                },
            },
        };

        return (
            <div className="space-y-4">
                <Card title="Payment Overview Chart">
                    <Line data={data} options={options} />
                </Card>
                <Card title="Detailed Payment Schedule">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Due Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount Due</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount Paid</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Remaining Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700 bg-gray-800">
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{p.paymentNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(p.dueDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(p.amountDue)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(p.amountPaid)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === PaymentStatus.PAID ? 'bg-green-100 text-green-800' : p.status === PaymentStatus.OVERDUE ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(p.remainingBalance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    };


    const renderComplianceChecks = (checks: ComplianceCheck[]) => {
        if (!checks || checks.length === 0) {
            return <p className="text-gray-400">No compliance checks recorded.</p>;
        }

        return (
            <div className="space-y-4">
                {checks.map(check => (
                    <Card key={check.id} title={check.checkType}>
                        <div className="flex items-center space-x-2 mb-2">
                            {check.status === 'PASSED' ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            ) : check.status === 'FAILED' ? (
                                <XCircleIcon className="w-5 h-5 text-red-400" />
                            ) : (
                                <ClockIcon className="w-5 h-5 text-yellow-400" />
                            )}
                            <p className={`font-semibold ${check.status === 'PASSED' ? 'text-green-400' : check.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'}`}>
                                Status: {check.status}
                            </p>
                            {check.severity && <PriorityBadge priority={check.severity.toUpperCase() as any} />}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{check.details}</p>
                        <p className="text-gray-500 text-xs">Checked by {check.checkedBy} on {formatDate(check.checkDate)}</p>
                        {check.remediationActions && check.remediationActions.length > 0 && (
                            <div className="mt-2">
                                <h5 className="font-semibold text-gray-300">Remediation Actions:</h5>
                                <ul className="list-disc list-inside text-gray-400 text-sm">
                                    {check.remediationActions.map((action, idx) => (
                                        <li key={idx}>{action}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        );
    };


    return (
        <div className="w-full h-full flex flex-col bg-gray-900 text-white">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h3 className="text-2xl font-bold">{application.applicantName}</h3>
                    <StatusBadge status={application.status} />
                    <RiskBadge riskLevel={application.riskLevel} />
                    <span className="text-lg text-gray-400">{formatCurrency(application.amountRequested)} ({application.loanType.replace(/_/g, ' ')})</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors duration-200"
                    >
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 px-6 pt-4 border-b border-gray-700 overflow-x-auto">
                <div className="flex space-x-2">
                    <button onClick={() => setCurrentTab('overview')} className={getTabClassName('overview')}>
                        <InformationCircleIcon className="w-4 h-4 inline-block mr-1" /> Overview
                    </button>
                    <button onClick={() => setCurrentTab('documents')} className={getTabClassName('documents')}>
                        <DocumentTextIcon className="w-4 h-4 inline-block mr-1" /> Documents ({application.documents?.length || 0})
                    </button>
                    <button onClick={() => setCurrentTab('notes')} className={getTabClassName('notes')}>
                        <PencilSquareIcon className="w-4 h-4 inline-block mr-1" /> Notes ({application.notes?.length || 0})
                    </button>
                    <button onClick={() => setCurrentTab('tasks')} className={getTabClassName('tasks')}>
                        <ClipboardDocumentListIcon className="w-4 h-4 inline-block mr-1" /> Tasks ({application.relatedTasks?.length || 0})
                    </button>
                    <button onClick={() => setCurrentTab('audit')} className={getTabClassName('audit')}>
                        <ClockIcon className="w-4 h-4 inline-block mr-1" /> Audit Trail ({application.auditTrail?.length || 0})
                    </button>
                    {application.offerDetails && (
                        <button onClick={() => setCurrentTab('offer')} className={getTabClassName('offer')}>
                            <CurrencyDollarIcon className="w-4 h-4 inline-block mr-1" /> Loan Offer
                        </button>
                    )}
                    {application.paymentSchedule && (
                        <button onClick={() => setCurrentTab('payments')} className={getTabClassName('payments')}>
                            <ReceiptPercentIcon className="w-4 h-4 inline-block mr-1" /> Payments
                        </button>
                    )}
                    {application.collateralDetails && application.collateralDetails.length > 0 && (
                        <button onClick={() => setCurrentTab('collateral')} className={getTabClassName('collateral')}>
                            <ShieldCheckIcon className="w-4 h-4 inline-block mr-1" /> Collateral
                        </button>
                    )}
                    {application.complianceChecks && application.complianceChecks.length > 0 && (
                        <button onClick={() => setCurrentTab('compliance')} className={getTabClassName('compliance')}>
                            <ScaleIcon className="w-4 h-4 inline-block mr-1" /> Compliance
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {currentTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card title="Application Summary">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                                    <div>
                                        <p><span className="font-semibold">Application ID:</span> {application.id}</p>
                                        <p><span className="font-semibold">Applicant:</span> {application.applicantName}</p>
                                        <p><span className="font-semibold">Loan Type:</span> {application.loanType.replace(/_/g, ' ')}</p>
                                        <p className="flex items-center space-x-1">
                                            <span className="font-semibold">Requested Amount:</span>
                                            {isEditingAmount ? (
                                                <input
                                                    type="number"
                                                    value={editedAmount}
                                                    onChange={(e) => setEditedAmount(parseFloat(e.target.value) || 0)}
                                                    onBlur={handleSaveAmount}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveAmount()}
                                                    className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
                                                />
                                            ) : (
                                                <span>{formatCurrency(application.amountRequested)} <button onClick={() => setIsEditingAmount(true)} className="text-gray-400 hover:text-blue-400"><PencilSquareIcon className="w-4 h-4 inline-block" /></button></span>
                                            )}
                                        </p>
                                        <p><span className="font-semibold">Term:</span> {application.termMonths} Months</p>
                                        <p><span className="font-semibold">Purpose:</span> {application.purpose}</p>
                                    </div>
                                    <div>
                                        <p><span className="font-semibold">Application Date:</span> {formatDate(application.applicationDate)}</p>
                                        <p><span className="font-semibold">Last Updated:</span> {formatDate(application.lastUpdated)}</p>
                                        <p className="flex items-center space-x-1">
                                            <span className="font-semibold">Status:</span>
                                            {isEditingStatus ? (
                                                <CustomSelect
                                                    options={Object.values(ApplicationStatus).map(s => ({ value: s, label: s.replace(/_/g, ' ') }))}
                                                    value={{ value: editedStatus, label: editedStatus.replace(/_/g, ' ') }}
                                                    onChange={(option: any) => setEditedStatus(option.value)}
                                                    onBlur={handleSaveStatus}
                                                    className="w-48 text-black"
                                                />
                                            ) : (
                                                <span className="flex items-center">
                                                    <StatusBadge status={application.status} />
                                                    <button onClick={() => setIsEditingStatus(true)} className="ml-2 text-gray-400 hover:text-blue-400"><PencilSquareIcon className="w-4 h-4 inline-block" /></button>
                                                </span>
                                            )}
                                        </p>
                                        <p className="flex items-center space-x-1">
                                            <span className="font-semibold">Assigned Underwriter:</span>
                                            {isAssigningUnderwriter ? (
                                                <CustomSelect
                                                    options={underwriters?.map(uw => ({ value: uw.id, label: `${uw.firstName} ${uw.lastName}` })) || []}
                                                    value={selectedUnderwriterId ? { value: selectedUnderwriterId, label: underwriters?.find(uw => uw.id === selectedUnderwriterId)?.firstName + ' ' + underwriters?.find(uw => uw.id === selectedUnderwriterId)?.lastName } : null}
                                                    onChange={(option: any) => setSelectedUnderwriterId(option?.value)}
                                                    onBlur={handleAssignUnderwriter}
                                                    className="w-48 text-black"
                                                    isClearable
                                                />
                                            ) : (
                                                <span>
                                                    {application.assignedUnderwriterName || 'N/A'}
                                                    <button onClick={() => { setIsAssigningUnderwriter(true); setSelectedUnderwriterId(application.assignedUnderwriterId) }} className="ml-2 text-gray-400 hover:text-blue-400"><PencilSquareIcon className="w-4 h-4 inline-block" /></button>
                                                </span>
                                            )}
                                        </p>
                                        <p><span className="font-semibold">Source Channel:</span> {application.sourceChannel}</p>
                                        <p><span className="font-semibold">Marketing Campaign:</span> {application.marketingCampaignId || 'N/A'}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card title="AI Risk & Decision Engine Insights">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                                    <div>
                                        <p><span className="font-semibold">AI Score:</span> <span className="text-xl font-bold">{application.aiScore}</span></p>
                                        <p className="flex items-center space-x-1">
                                            <span className="font-semibold">Risk Level:</span> <RiskBadge riskLevel={application.riskLevel} />
                                        </p>
                                        <p><span className="font-semibold">Recommended Action:</span> <span className="text-blue-400 font-semibold">{application.recommendedAction}</span></p>
                                        <p><span className="font-semibold">Fraud Detection Score:</span> <span className="font-bold">{application.fraudDetectionScore?.toFixed(2)}%</span></p>
                                        <p><span className="font-semibold">Sentiment Score:</span> <span className="font-bold">{application.sentimentAnalysisScore?.toFixed(2)}</span></p>
                                    </div>
                                    {application.decisionEngineOutput && (
                                        <div>
                                            <p><span className="font-semibold">Decision Engine:</span> <span className={`font-bold ${application.decisionEngineOutput.decision === 'APPROVE' ? 'text-green-400' : application.decisionEngineOutput.decision === 'REJECT' ? 'text-red-400' : 'text-yellow-400'}`}>{application.decisionEngineOutput.decision}</span></p>
                                            <p><span className="font-semibold">Reason Codes:</span> {application.decisionEngineOutput.reasonCodes.join(', ') || 'N/A'}</p>
                                            <p><span className="font-semibold">Confidence Score:</span> {(application.decisionEngineOutput.confidenceScore * 100).toFixed(2)}%</p>
                                            <p><span className="font-semibold">Model Version:</span> {application.decisionEngineOutput.modelVersion}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card title="Applicant Profile (Details available with applicantId lookup)">
                                <p className="text-gray-400">
                                    To fetch full applicant details, use the applicant ID: <code className="bg-gray-700 px-2 py-1 rounded text-sm">{application.applicantId}</code>.
                                    This would typically involve another API call to a `/applicants/{applicantId}` endpoint.
                                </p>
                            </Card>

                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <Card title="Recent Activity">
                                <ul className="space-y-3">
                                    {application.auditTrail?.slice(0, 5).map((log) => (
                                        <li key={log.id} className="text-sm text-gray-400 border-b border-gray-700 pb-2 last:border-b-0">
                                            <p className="font-semibold text-gray-200">{log.action.replace(/_/g, ' ')}</p>
                                            <p>{log.details}</p>
                                            <p className="text-xs text-gray-500">{formatDate(log.timestamp)} by {log.userName}</p>
                                        </li>
                                    ))}
                                    {(application.auditTrail?.length || 0) === 0 && <p className="text-gray-400">No recent activity.</p>}
                                </ul>
                            </Card>

                            <Card title="Open Tasks">
                                <ul className="space-y-3">
                                    {application.relatedTasks?.filter(t => t.status !== 'COMPLETED').map((task) => (
                                        <li key={task.id} className="text-sm text-gray-400 border-b border-gray-700 pb-2 last:border-b-0">
                                            <p className="font-semibold text-gray-200">{task.title}</p>
                                            <p className="flex items-center space-x-1">
                                                <PriorityBadge priority={task.priority} />
                                                <span>Due: {formatDate(task.dueDate)}</span>
                                            </p>
                                            <p className="text-xs text-gray-500">Assigned to: {task.assignedToName}</p>
                                        </li>
                                    ))}
                                    {(application.relatedTasks?.filter(t => t.status !== 'COMPLETED').length || 0) === 0 && <p className="text-gray-400">No open tasks.</p>}
                                </ul>
                                <button className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <PlusIcon className="w-5 h-5" /> Add New Task
                                </button>
                            </Card>
                        </div>
                    </div>
                )}

                {currentTab === 'documents' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsUploadingDocument(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" />
                                Upload Document
                            </button>
                        </div>
                        {application.documents && application.documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {application.documents.map(doc => (
                                    <Card key={doc.id} title={doc.fileName}>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-300 flex items-center">
                                                <PaperClipIcon className="w-4 h-4 mr-1 text-gray-400" />
                                                {doc.documentType.replace(/_/g, ' ')}
                                            </p>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${doc.verificationStatus === 'VERIFIED' ? 'text-green-500 bg-green-900/20' : doc.verificationStatus === 'REJECTED' ? 'text-red-500 bg-red-900/20' : 'text-indigo-500 bg-indigo-900/20'}`}>
                                                {doc.verificationStatus}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400">Uploaded by {doc.uploadedBy} on {formatDate(doc.uploadDate)}</p>
                                        {doc.aiVerificationScore && <p className="text-xs text-gray-400">AI Verification Score: {doc.aiVerificationScore}%</p>}
                                        {doc.verificationNotes && <p className="text-xs text-gray-500 mt-1">Notes: {doc.verificationNotes}</p>}
                                        <div className="flex space-x-2 mt-3">
                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                                <EyeIcon className="-ml-0.5 mr-1 h-4 w-4" /> View
                                            </a>
                                            <button className="inline-flex items-center px-3 py-1.5 border border-gray-600 text-xs font-medium rounded-md text-gray-300 hover:bg-gray-700">
                                                <CheckCircleIcon className="-ml-0.5 mr-1 h-4 w-4" /> Verify
                                            </button>
                                            <button className="inline-flex items-center px-3 py-1.5 border border-red-600 text-xs font-medium rounded-md text-red-300 hover:bg-red-700 hover:text-white">
                                                <XCircleIcon className="-ml-0.5 mr-1 h-4 w-4" /> Reject
                                            </button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No documents uploaded for this application.</p>
                        )}
                    </div>
                )}

                {currentTab === 'notes' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsAddingNote(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                Add Note
                            </button>
                        </div>
                        {application.notes && application.notes.length > 0 ? (
                            <div className="space-y-4">
                                {application.notes.map(note => (
                                    <Card key={note.id} title={`Note by ${note.authorName}`}>
                                        <p className="text-gray-300 mb-2">{note.content}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(note.timestamp)} {note.isPrivate && <span className="ml-2 text-red-400">(Private)</span>}
                                        </p>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No notes for this application.</p>
                        )}
                    </div>
                )}

                {currentTab === 'tasks' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                Create New Task
                            </button>
                        </div>
                        {application.relatedTasks && application.relatedTasks.length > 0 ? (
                            <div className="space-y-4">
                                {application.relatedTasks.map(task => (
                                    <Card key={task.id} title={task.title}>
                                        <p className="text-gray-300 mb-2">{task.description}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                                            <p><span className="font-semibold">Assigned To:</span> {task.assignedToName}</p>
                                            <p><span className="font-semibold">Due Date:</span> {formatDate(task.dueDate)}</p>
                                            <p><span className="font-semibold">Status:</span>
                                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${task.status === 'COMPLETED' ? 'text-green-500 bg-green-900/20' : task.status === 'OVERDUE' ? 'text-red-500 bg-red-900/20' : 'text-indigo-500 bg-indigo-900/20'}`}>
                                                    {task.status}
                                                </span>
                                            </p>
                                            <PriorityBadge priority={task.priority} />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No tasks associated with this application.</p>
                        )}
                    </div>
                )}

                {currentTab === 'audit' && (
                    <div className="space-y-4">
                        {application.auditTrail && application.auditTrail.length > 0 ? (
                            <div className="space-y-4">
                                {application.auditTrail.map(log => (
                                    <Card key={log.id} title={log.action.replace(/_/g, ' ')}>
                                        <p className="text-gray-300 mb-2">{log.details}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(log.timestamp)} by {log.userName} (IP: {log.ipAddress || 'N/A'})
                                        </p>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No audit trail entries for this application.</p>
                        )}
                    </div>
                )}

                {currentTab === 'offer' && application.offerDetails && renderOfferDetails(application.offerDetails)}
                {currentTab === 'payments' && application.paymentSchedule && renderPaymentSchedule(application.paymentSchedule)}
                {currentTab === 'collateral' && application.collateralDetails && application.collateralDetails.length > 0 && (
                    <div className="space-y-4">
                        {application.collateralDetails.map(collateral => (
                            <Card key={collateral.id} title={`Collateral: ${collateral.type}`}>
                                <p className="text-gray-300 mb-2">{collateral.description}</p>
                                <p><span className="font-semibold text-gray-200">Estimated Value:</span> {formatCurrency(collateral.estimatedValue)}</p>
                                <p><span className="font-semibold text-gray-200">Valuation Date:</span> {formatDate(collateral.valuationDate)}</p>
                                <p><span className="font-semibold text-gray-200">Lien Status:</span> <span className={`${collateral.lienStatus === 'CLEAR' ? 'text-green-400' : 'text-red-400'}`}>{collateral.lienStatus}</span></p>
                                {collateral.riskAssessment && <p><span className="font-semibold text-gray-200">Risk Assessment:</span> <RiskBadge riskLevel={collateral.riskAssessment} /></p>}
                                <div className="mt-3 flex space-x-2">
                                    {collateral.valuationReportUrl && (
                                        <a href={collateral.valuationReportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700">
                                            <DocumentTextIcon className="-ml-0.5 mr-1 h-4 w-4" /> View Report
                                        </a>
                                    )}
                                    {collateral.insurancePolicyNumber && (
                                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-700 text-gray-300">
                                            <ShieldCheckIcon className="-ml-0.5 mr-1 h-4 w-4" /> Policy: {collateral.insurancePolicyNumber}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
                {currentTab === 'compliance' && application.complianceChecks && renderComplianceChecks(application.complianceChecks)}

            </div>

            {/* Modals for Add Note / Upload Document */}
            <Modal isOpen={isAddingNote} onClose={() => setIsAddingNote(false)} title="Add New Note">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="note-content" className="block text-sm font-medium text-gray-300 mb-1">Note Content</label>
                        <textarea
                            id="note-content"
                            rows={4}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            placeholder="Type your note here..."
                        ></textarea>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="private-note"
                            type="checkbox"
                            checked={newNoteIsPrivate}
                            onChange={(e) => setNewNoteIsPrivate(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                        />
                        <label htmlFor="private-note" className="ml-2 block text-sm text-gray-300">
                            Mark as private (only visible to specific roles)
                        </label>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsAddingNote(false)}
                            className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddNote}
                            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Add Note
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isUploadingDocument} onClose={() => setIsUploadingDocument(false)} title="Upload New Document">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="document-type" className="block text-sm font-medium text-gray-300 mb-1">Document Type</label>
                        <CustomSelect
                            id="document-type"
                            options={Object.values(DocumentType).map(dt => ({ value: dt, label: dt.replace(/_/g, ' ') }))}
                            value={newDocumentType ? { value: newDocumentType, label: newDocumentType.replace(/_/g, ' ') } : null}
                            onChange={(option: any) => setNewDocumentType(option?.value)}
                            placeholder="Select document type"
                        />
                    </div>
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-1">File</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m-4-4v-4m5 4H15"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="flex text-sm text-gray-400">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                    >
                                        <span>Upload a file</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            onChange={(e) => e.target.files && setNewDocumentFile(e.target.files[0])}
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {newDocumentFile ? newDocumentFile.name : 'PNG, JPG, PDF up to 10MB'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsUploadingDocument(false)}
                            className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDocumentUpload}
                            disabled={!newDocumentFile || !newDocumentType}
                            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Upload
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// --- Dashboard Widgets ---

export const ApplicationStatusChart: React.FC<{ applications: LoanApplication[] }> = ({ applications }) => {
    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<ApplicationStatus, number>);

    const data = {
        labels: Object.keys(statusCounts).map(s => (s as ApplicationStatus).replace(/_/g, ' ')),
        datasets: [
            {
                data: Object.values(statusCounts),
                backgroundColor: Object.keys(statusCounts).map(s => {
                    switch (s as ApplicationStatus) {
                        case ApplicationStatus.APPROVED: return '#10B981'; // green
                        case ApplicationStatus.REJECTED: return '#EF4444'; // red
                        case ApplicationStatus.PENDING_REVIEW: return '#6366F1'; // indigo
                        case ApplicationStatus.UNDERWRITING: return '#FBBF24'; // yellow
                        case ApplicationStatus.AI_PRE_SCREEN: return '#A78BFA'; // violet
                        case ApplicationStatus.DOCUMENT_VERIFICATION: return '#EC4899'; // pink
                        case ApplicationStatus.FUNDED: return '#3B82F6'; // blue
                        case ApplicationStatus.WITHDRAWN: return '#6B7280'; // gray
                        case ApplicationStatus.ON_HOLD: return '#F97316'; // orange
                        case ApplicationStatus.PENDING_CUSTOMER_ACTION: return '#8B5CF6'; // purple
                        case ApplicationStatus.ESCALATED: return '#F43F5E'; // rose
                        case ApplicationStatus.COLLECTION: return '#DC2626'; // dark red
                        case ApplicationStatus.REFINANCED: return '#14B8A6'; // teal
                        case ApplicationStatus.CLOSED: return '#4B5563'; // dark gray
                        default: return '#9CA3AF'; // light gray
                    }
                }),
                borderColor: '#1F2937', // bg-gray-800
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: 'white',
                    font: {
                        size: 10,
                    }
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
    };

    return (
        <Card title="Application Status Distribution">
            <div className="relative h-64 flex justify-center">
                <Pie data={data} options={options} />
            </div>
        </Card>
    );
};

export const LoanTypeDistributionChart: React.FC<{ applications: LoanApplication[] }> = ({ applications }) => {
    const loanTypeCounts = applications.reduce((acc, app) => {
        acc[app.loanType] = (acc[app.loanType] || 0) + 1;
        return acc;
    }, {} as Record<LoanType, number>);

    const data = {
        labels: Object.keys(loanTypeCounts).map(lt => (lt as LoanType).replace(/_/g, ' ')),
        datasets: [
            {
                label: 'Number of Applications',
                data: Object.values(loanTypeCounts),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#FBBF24', '#EF4444', '#6366F1',
                    '#EC4899', '#A78BFA', '#F97316', '#06B6D4', '#84CC16',
                    '#EAB308', '#F472B6', '#94A3B8'
                ],
                borderColor: '#1F2937',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: 'white',
                    font: {
                        size: 10,
                    }
                },
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: 'white',
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: 'white',
                }
            },
        }
    };

    return (
        <Card title="Loan Type Distribution">
            <div className="relative h-64 flex justify-center">
                <Bar data={data} options={options} />
            </div>
        </Card>
    );
};

export const RecentAlertsWidget: React.FC = () => {
    const { data: alerts, isLoading, error } = useAlerts();

    if (isLoading) return <Card title="Recent Alerts"><p className="text-gray-400">Loading alerts...</p></Card>;
    if (error) return <Card title="Recent Alerts"><p className="text-red-400">Error loading alerts: {error.message}</p></Card>;

    return (
        <Card title="Recent System Alerts">
            {alerts && alerts.length > 0 ? (
                <ul className="space-y-3">
                    {alerts.slice(0, 5).map(alert => (
                        <li key={alert.id} className="text-sm border-b border-gray-700 pb-2 last:border-b-0">
                            <div className="flex items-center space-x-2">
                                <ExclamationTriangleIcon className={`w-5 h-5 ${alert.severity === 'CRITICAL' ? 'text-red-500' : alert.severity === 'HIGH' ? 'text-orange-500' : 'text-yellow-500'}`} />
                                <p className={`font-semibold ${alert.severity === 'CRITICAL' ? 'text-red-400' : alert.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'}`}>
                                    {alert.type.replace(/_/g, ' ')} ({alert.severity})
                                </p>
                            </div>
                            <p className="text-gray-300 ml-7">{alert.message}</p>
                            {alert.loanApplicationId && (
                                <p className="text-xs text-gray-500 ml-7">Application: {alert.loanApplicationId}</p>
                            )}
                            <p className="text-xs text-gray-500 ml-7">{formatDate(alert.timestamp)}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400">No new alerts.</p>
            )}
            <button className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <BellIcon className="w-5 h-5" /> View All Alerts
            </button>
        </Card>
    );
};

export const PerformanceMetricsWidget: React.FC<{ applications: LoanApplication[] }> = ({ applications }) => {
    const totalApplications = applications.length;
    const approvedCount = applications.filter(app => app.status === ApplicationStatus.APPROVED || app.status === ApplicationStatus.FUNDED).length;
    const rejectedCount = applications.filter(app => app.status === ApplicationStatus.REJECTED).length;
    const pendingCount = applications.filter(app => app.status === ApplicationStatus.PENDING_REVIEW || app.status === ApplicationStatus.UNDERWRITING || app.status === ApplicationStatus.AI_PRE_SCREEN || app.status === ApplicationStatus.DOCUMENT_VERIFICATION).length;

    const approvalRate = totalApplications > 0 ? (approvedCount / totalApplications) * 100 : 0;
    const rejectionRate = totalApplications > 0 ? (rejectedCount / totalApplications) * 100 : 0;

    const totalAmountApproved = applications
        .filter(app => app.status === ApplicationStatus.APPROVED || app.status === ApplicationStatus.FUNDED)
        .reduce((sum, app) => sum + (app.offerDetails?.offeredAmount || app.amountRequested), 0);

    const averageProcessingTime = useMemo(() => {
        const processedApps = applications.filter(app =>
            app.status === ApplicationStatus.APPROVED || app.status === ApplicationStatus.REJECTED || app.status === ApplicationStatus.FUNDED
        );
        if (processedApps.length === 0) return 'N/A';

        const totalProcessingTimeMs = processedApps.reduce((sum, app) => {
            const appDate = new Date(app.applicationDate);
            const lastUpdatedDate = new Date(app.lastUpdated);
            return sum + (lastUpdatedDate.getTime() - appDate.getTime());
        }, 0);

        const averageMs = totalProcessingTimeMs / processedApps.length;
        const averageDays = averageMs / (1000 * 60 * 60 * 24);
        return `${averageDays.toFixed(1)} days`;
    }, [applications]);

    return (
        <Card title="Lending Performance Metrics">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center space-x-2">
                    <Bars3Icon className="w-6 h-6 text-blue-400" />
                    <div>
                        <p className="text-sm text-gray-400">Total Applications</p>
                        <p className="text-xl font-bold text-white">{totalApplications}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    <div>
                        <p className="text-sm text-gray-400">Approved/Funded</p>
                        <p className="text-xl font-bold text-white">{approvedCount} ({approvalRate.toFixed(1)}%)</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <XCircleIcon className="w-6 h-6 text-red-400" />
                    <div>
                        <p className="text-sm text-gray-400">Rejected</p>
                        <p className="text-xl font-bold text-white">{rejectedCount} ({rejectionRate.toFixed(1)}%)</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <ClockIcon className="w-6 h-6 text-yellow-400" />
                    <div>
                        <p className="text-sm text-gray-400">Pending Review</p>
                        <p className="text-xl font-bold text-white">{pendingCount}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 sm:col-span-2">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                    <div>
                        <p className="text-sm text-gray-400">Total Amount Approved</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(totalAmountApproved)}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 sm:col-span-2">
                    <HourglassBottomIcon className="w-6 h-6 text-indigo-400" /> {/* Assuming HourglassBottomIcon from somewhere */}
                    <div>
                        <p className="text-sm text-gray-400">Avg. Processing Time</p>
                        <p className="text-xl font-bold text-white">{averageProcessingTime}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
// Add a placeholder icon import if HourglassBottomIcon isn't available from heroicons
import { HourglassBottomIcon } from '@heroicons/react/24/outline'; // Or any other suitable icon


// --- Main View Component ---

const LoanApplicationsView: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<any>({});
    const [sort, setSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'applicationDate', direction: 'desc' });
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: applicationsData, isLoading, error, refetch } = useApplications(currentPage, ITEMS_PER_PAGE, filters, sort);
    const { data: selectedApplication, isLoading: isLoadingSelectedApp, error: selectedAppError, refetch: refetchSelectedApp } = useApplicationById(selectedApplicationId);

    const totalApplications = applicationsData?.total || 0;
    const totalPages = Math.ceil(totalApplications / ITEMS_PER_PAGE);

    const handleFilterChange = useCallback((key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    }, []);

    const handleSortChange = useCallback((field: string) => {
        setSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({});
        setSort({ field: 'applicationDate', direction: 'desc' });
        setCurrentPage(1);
    }, []);

    const handleApplicationUpdate = useCallback(() => {
        refetch(); // Refetch the list
        if (selectedApplicationId) {
            refetchSelectedApp(); // Refetch the detailed view
        }
    }, [refetch, refetchSelectedApp, selectedApplicationId]);

    const handleCreateNewApplication = useCreateApplication();

    const handleFormSubmit = async (formData: Partial<LoanApplication>) => {
        try {
            await handleCreateNewApplication.mutateAsync(formData);
            setIsCreateModalOpen(false);
        } catch (err) {
            // Error handled by mutation hook via toast
        }
    }


    const loanTypeOptions = useMemo(() => Object.values(LoanType).map(type => ({ value: type, label: type.replace(/_/g, ' ') })), []);
    const statusOptions = useMemo(() => Object.values(ApplicationStatus).map(status => ({ value: status, label: status.replace(/_/g, ' ') })), []);
    const riskLevelOptions = useMemo(() => Object.values(RiskLevel).map(level => ({ value: level, label: level.replace(/_/g, ' ') })), []);

    const { data: underwriters } = useUnderwriters();
    const underwriterOptions = useMemo(() => underwriters?.map(uw => ({ value: uw.id, label: `${uw.firstName} ${uw.lastName}` })) || [], [underwriters]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Loan Origination System</h2>

            {/* Top-level Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Mission Brief">
                    <p className="text-gray-400">An AI-powered loan origination and management system built for speed and precision. Automate underwriting, scoring, and document verification to accelerate the entire lending lifecycle from application to closing.</p>
                </Card>
                {applicationsData?.applications && <ApplicationStatusChart applications={applicationsData.applications} />}
                {applicationsData?.applications && <LoanTypeDistributionChart applications={applicationsData.applications} />}
                <PerformanceMetricsWidget applications={applicationsData?.applications || []} />
                <RecentAlertsWidget />
                <Card title="AI Pre-Approval Scoring"><p>Get an instant, AI-driven risk assessment and pre-approval decision for new applications, cutting review times from days to seconds.</p></Card>
                <Card title="Risk-Adjusted Loan Offers"><p>Automatically generate personalized loan offers with terms dynamically adjusted for the applicant's holistic risk profile.</p></Card>
                <Card title="Predictive Default Monitoring"><p>Our AI models continuously monitor active loans to predict and flag potential defaults months before they occur, enabling proactive intervention.</p></Card>
            </div>

            {/* Loan Application Management Section */}
            <Card title="Loan Applications Overview">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search applications (ID, Applicant, Purpose)..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <DropdownMenu
                            trigger={
                                <FilterButton
                                    label="Filters"
                                    icon={FilterIcon}
                                    onClick={() => {}} // No-op, dropdown handles state
                                    isActive={Object.keys(filters).length > 0}
                                />
                            }
                        >
                            <div className="p-4 space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                    <CustomSelect
                                        options={statusOptions}
                                        value={statusOptions.find(opt => opt.value === filters.status)}
                                        onChange={(option: any) => handleFilterChange('status', option ? option.value : null)}
                                        isClearable
                                        placeholder="Select status"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Loan Type</label>
                                    <CustomSelect
                                        options={loanTypeOptions}
                                        value={loanTypeOptions.find(opt => opt.value === filters.loanType)}
                                        onChange={(option: any) => handleFilterChange('loanType', option ? option.value : null)}
                                        isClearable
                                        placeholder="Select loan type"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Risk Level</label>
                                    <CustomSelect
                                        options={riskLevelOptions}
                                        value={riskLevelOptions.find(opt => opt.value === filters.riskLevel)}
                                        onChange={(option: any) => handleFilterChange('riskLevel', option ? option.value : null)}
                                        isClearable
                                        placeholder="Select risk level"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Underwriter</label>
                                    <CustomSelect
                                        options={underwriterOptions}
                                        value={underwriterOptions.find(opt => opt.value === filters.underwriterId)}
                                        onChange={(option: any) => handleFilterChange('underwriterId', option ? option.value : null)}
                                        isClearable
                                        placeholder="Select underwriter"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Amount Range</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={filters.minAmount || ''}
                                            onChange={(e) => handleFilterChange('minAmount', parseFloat(e.target.value) || undefined)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={filters.maxAmount || ''}
                                            onChange={(e) => handleFilterChange('maxAmount', parseFloat(e.target.value) || undefined)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Date Range</label>
                                    <div className="flex items-center space-x-2">
                                        <DatePicker
                                            selected={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
                                            onChange={(date: Date | null) => handleFilterChange('dateRange', { ...filters.dateRange, startDate: date?.toISOString() })}
                                            placeholderText="Start Date"
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            dateFormat="MM/dd/yyyy"
                                        />
                                        <DatePicker
                                            selected={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
                                            onChange={(date: Date | null) => handleFilterChange('dateRange', { ...filters.dateRange, endDate: date?.toISOString() })}
                                            placeholderText="End Date"
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            dateFormat="MM/dd/yyyy"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleClearFilters}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-300 bg-gray-600 hover:bg-gray-500"
                                >
                                    <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" /> Clear Filters
                                </button>
                            </div>
                        </DropdownMenu>
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                            Refresh
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            New Application
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 text-gray-400">
                        <ArrowPathIcon className="mx-auto h-12 w-12 animate-spin text-blue-500" />
                        <p className="mt-4">Loading loan applications...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-400">
                        <XCircleIcon className="mx-auto h-12 w-12" />
                        <p className="mt-4">Error loading applications: {error.message}</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <SortableHeader label="Application ID" field="id" currentSort={sort} onSort={handleSortChange} />
                                        <SortableHeader label="Applicant Name" field="applicantName" currentSort={sort} onSort={handleSortChange} />
                                        <SortableHeader label="Loan Type" field="loanType" currentSort={sort} onSort={handleSortChange} />
                                        <SortableHeader label="Amount" field="amountRequested" currentSort={sort} onSort={handleSortChange} />
                                        <SortableHeader label="Status" field="status" currentSort={sort} onSort={handleSortChange} />
                                        <SortableHeader label="Risk Level" field="riskLevel" currentSort={sort} onSort={handleSortChange} />
                                        <SortableHeader label="Underwriter" field="assignedUnderwriterName" currentSort={sort} onSort={handleSortChange} />
                                        <SortableHeader label="Application Date" field="applicationDate" currentSort={sort} onSort={handleSortChange} />
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700 bg-gray-900">
                                    {applicationsData.applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-800 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">{app.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{app.applicantName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{app.loanType.replace(/_/g, ' ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(app.amountRequested)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <RiskBadge riskLevel={app.riskLevel} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{app.assignedUnderwriterName || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDate(app.applicationDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <DropdownMenu
                                                    trigger={
                                                        <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700">
                                                            <EllipsisVerticalIcon className="h-5 w-5" />
                                                        </button>
                                                    }
                                                >
                                                    <DropdownMenuItem onClick={() => setSelectedApplicationId(app.id)} icon={EyeIcon}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toast.info('Edit action coming soon!')} icon={PencilSquareIcon}>
                                                        Edit Application
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toast.error('Delete action coming soon!')} icon={TrashIcon}>
                                                        Delete Application
                                                    </DropdownMenuItem>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Paginator
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </Card>

            {/* Application Detail Modal */}
            <Modal
                isOpen={!!selectedApplicationId}
                onClose={() => setSelectedApplicationId(null)}
                title={isLoadingSelectedApp ? 'Loading Application...' : selectedApplicationError ? 'Error' : `Application: ${selectedApplication?.applicantName || ''}`}
                size="2xl"
            >
                {isLoadingSelectedApp && <div className="text-center py-8 text-gray-400"><ArrowPathIcon className="mx-auto h-12 w-12 animate-spin text-blue-500" /><p className="mt-4">Loading application details...</p></div>}
                {selectedAppError && <div className="text-center py-8 text-red-400"><XCircleIcon className="mx-auto h-12 w-12" /><p className="mt-4">Error: {selectedAppError.message}</p></div>}
                {selectedApplication && !isLoadingSelectedApp && !selectedAppError && (
                    <LoanApplicationDetail
                        application={selectedApplication}
                        onClose={() => setSelectedApplicationId(null)}
                        onUpdate={handleApplicationUpdate}
                    />
                )}
            </Modal>

            {/* Create New Application Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Loan Application"
                size="lg"
            >
                <NewLoanApplicationForm onSubmit={handleFormSubmit} onClose={() => setIsCreateModalOpen(false)} />
            </Modal>
        </div>
    );
};


// --- New Loan Application Form Component ---
export const NewLoanApplicationForm: React.FC<{ onSubmit: (data: Partial<LoanApplication>) => void; onClose: () => void }> = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState<Partial<LoanApplication & LoanApplicant>>({
        applicantName: '',
        loanType: LoanType.PERSONAL,
        amountRequested: 0,
        termMonths: 12,
        purpose: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationalId: '',
        annualIncome: 0,
    });
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const handleSelectChange = (name: string, option: any) => {
        setFormData(prev => ({
            ...prev,
            [name]: option ? option.value : null,
        }));
    };

    const handleNextStep = () => setCurrentStep(prev => prev + 1);
    const handlePrevStep = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation for final step
        if (!formData.applicantName || !formData.loanType || !formData.amountRequested || !formData.termMonths || !formData.purpose) {
            toast.error('Please fill all required loan details.');
            return;
        }
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.nationalId || !formData.annualIncome) {
            toast.error('Please fill all required applicant details.');
            return;
        }

        // Combine applicant and application data
        const newApplicant: LoanApplicant = {
            id: `temp-user-${Date.now()}`, // Temporary ID, could be generated on backend
            firstName: formData.firstName || '',
            lastName: formData.lastName || '',
            email: formData.email || '',
            phone: formData.phone || '',
            nationalId: formData.nationalId || '',
            annualIncome: formData.annualIncome || 0,
            dateOfBirth: '1990-01-01', // Placeholder
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '90210',
            nationality: 'US',
            employmentStatus: 'Employed',
            creditScore: Math.floor(Math.random() * (850 - 300 + 1)) + 300,
            dependents: 0,
            existingDebts: 0,
            assetsValue: 0,
        };

        const newApplication: Partial<LoanApplication> = {
            applicantId: newApplicant.id,
            applicantName: `${newApplicant.firstName} ${newApplicant.lastName}`,
            loanType: formData.loanType,
            amountRequested: formData.amountRequested,
            termMonths: formData.termMonths,
            purpose: formData.purpose,
            sourceChannel: 'Manual Entry',
            // Default values handled by the createApplication API function
        };

        // In a real app, you'd send `newApplicant` to an /applicants endpoint first,
        // then use the returned applicant ID in `newApplication`.
        // For this mock, we're passing it all together.
        onSubmit(newApplication);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center text-sm font-medium">
                <span className={`px-3 py-1 rounded-full ${currentStep === 1 ? 'bg-blue-600' : 'bg-gray-700'} text-white`}>1. Loan Details</span>
                <div className="h-0.5 w-12 bg-gray-600"></div>
                <span className={`px-3 py-1 rounded-full ${currentStep === 2 ? 'bg-blue-600' : 'bg-gray-700'} text-white`}>2. Applicant Info</span>
                <div className="h-0.5 w-12 bg-gray-600"></div>
                <span className={`px-3 py-1 rounded-full ${currentStep === 3 ? 'bg-blue-600' : 'bg-gray-700'} text-white`}>3. Review & Submit</span>
            </div>

            {currentStep === 1 && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="applicantName" className="block text-sm font-medium text-gray-300">Applicant Full Name</label>
                        <input
                            type="text"
                            name="applicantName"
                            id="applicantName"
                            value={formData.applicantName}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="loanType" className="block text-sm font-medium text-gray-300">Loan Type</label>
                        <CustomSelect
                            id="loanType"
                            options={Object.values(LoanType).map(type => ({ value: type, label: type.replace(/_/g, ' ') }))}
                            value={loanTypeOptions.find(opt => opt.value === formData.loanType)}
                            onChange={(option: any) => handleSelectChange('loanType', option)}
                            placeholder="Select loan type"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="amountRequested" className="block text-sm font-medium text-gray-300">Amount Requested</label>
                        <input
                            type="number"
                            name="amountRequested"
                            id="amountRequested"
                            value={formData.amountRequested}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            min="1"
                        />
                    </div>
                    <div>
                        <label htmlFor="termMonths" className="block text-sm font-medium text-gray-300">Loan Term (Months)</label>
                        <input
                            type="number"
                            name="termMonths"
                            id="termMonths"
                            value={formData.termMonths}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            min="1"
                        />
                    </div>
                    <div>
                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-300">Purpose of Loan</label>
                        <textarea
                            name="purpose"
                            id="purpose"
                            rows={3}
                            value={formData.purpose}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        ></textarea>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                id="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                id="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="nationalId" className="block text-sm font-medium text-gray-300">National ID/SSN</label>
                        <input
                            type="text"
                            name="nationalId"
                            id="nationalId"
                            value={formData.nationalId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-300">Annual Income</label>
                        <input
                            type="number"
                            name="annualIncome"
                            id="annualIncome"
                            value={formData.annualIncome}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            min="0"
                        />
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-4 text-gray-300">
                    <h3 className="text-xl font-semibold text-white">Review Application Details</h3>
                    <div className="border border-gray-700 rounded-md p-4 bg-gray-800 space-y-2">
                        <p><span className="font-semibold">Applicant Name:</span> {formData.applicantName}</p>
                        <p><span className="font-semibold">Loan Type:</span> {formData.loanType?.replace(/_/g, ' ')}</p>
                        <p><span className="font-semibold">Amount Requested:</span> {formatCurrency(formData.amountRequested || 0)}</p>
                        <p><span className="font-semibold">Term:</span> {formData.termMonths} Months</p>
                        <p><span className="font-semibold">Purpose:</span> {formData.purpose}</p>
                        <hr className="border-gray-700 my-2" />
                        <p><span className="font-semibold">First Name:</span> {formData.firstName}</p>
                        <p><span className="font-semibold">Last Name:</span> {formData.lastName}</p>
                        <p><span className="font-semibold">Email:</span> {formData.email}</p>
                        <p><span className="font-semibold">Phone:</span> {formData.phone || 'N/A'}</p>
                        <p><span className="font-semibold">National ID/SSN:</span> {formData.nationalId}</p>
                        <p><span className="font-semibold">Annual Income:</span> {formatCurrency(formData.annualIncome || 0)}</p>
                    </div>
                    <p className="text-gray-400 text-sm italic">
                        Upon submission, this application will enter the AI Pre-Screening phase.
                    </p>
                </div>
            )}

            <div className="flex justify-between mt-6">
                {currentStep > 1 && (
                    <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
                    >
                        <ChevronLeftIcon className="inline-block w-4 h-4 mr-1" /> Previous
                    </button>
                )}
                <div className="flex-grow"></div> {/* Spacer */}
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    {currentStep < totalSteps && (
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Next <ChevronRightIcon className="inline-block w-4 h-4 ml-1" />
                        </button>
                    )}
                    {currentStep === totalSteps && (
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircleIcon className="inline-block w-4 h-4 mr-1" /> Submit Application
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
};


export default LoanApplicationsView;