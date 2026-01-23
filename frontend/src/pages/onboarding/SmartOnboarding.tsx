import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  FileText,
  Database,
  CheckCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Building2,
  Send,
  Landmark,
  CreditCard,
  Table,
  Link as LinkIcon,
  Calculator,
  Briefcase
} from 'lucide-react';
import logoSvg from '@/assets/logo.svg';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { createStartupProfile, updateStartupProfile } from '@/services/startup.service';

// Types
interface ExtractedData {
  name?: string;
  industry?: string;
  stage?: 'idea' | 'mvp' | 'growth' | 'scale';
  description?: string;
  team_size?: number;
  challenges?: string[];
  initial_cash_balance?: number;
  initial_monthly_expenses?: number;
  initial_monthly_revenue?: number;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

type OnboardingStep = 'chat' | 'connect' | 'verify';

// Chat questions flow
const chatQuestions = [
  {
    id: 'intro',
    question: "Hi! 👋 I'm Strata, your AI startup advisor. Tell me about your startup in a few sentences - what are you building and for whom?",
    extract: ['name', 'industry', 'description']
  },
  {
    id: 'stage',
    question: "That sounds exciting! What stage are you at right now? And how many people are on your team?",
    extract: ['stage', 'team_size']
  },
  {
    id: 'challenge',
    question: "What's your biggest challenge right now? (e.g., runway concerns, finding customers, hiring, fundraising)",
    extract: ['challenges']
  }
];

export function SmartOnboarding() {
  const navigate = useNavigate();
  const { user, setUser, token } = useAuthStore();
  
  // State
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('chat');
  const [chatIndex, setChatIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: chatQuestions[0].question }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');

  // Handle chat submission
  const handleChatSubmit = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing & extraction
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract data based on current question
    const extracted = await extractFromResponse(inputValue, chatIndex);
    setExtractedData(prev => ({ ...prev, ...extracted }));

    // Move to next question or step
    if (chatIndex < chatQuestions.length - 1) {
      const nextQuestion = chatQuestions[chatIndex + 1].question;
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: nextQuestion
      }]);
      setChatIndex(prev => prev + 1);
    } else {
      // Chat complete, move to connect step
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Great! I've got a good picture of your startup. 🎯 Now, let's connect your financial data so I can give you accurate insights. You can upload files or start fresh!"
      }]);
      setTimeout(() => setCurrentStep('connect'), 1500);
    }
    
    setIsTyping(false);
  };

  // Simple extraction from response (AI-powered in production)
  const extractFromResponse = async (response: string, questionIndex: number): Promise<Partial<ExtractedData>> => {
    const extracted: Partial<ExtractedData> = {};
    const lowerResponse = response.toLowerCase();

    if (questionIndex === 0) {
      // Extract name (first capitalized phrase or after "called" / "named")
      const nameMatch = response.match(/(?:called|named|building|is)\s+([A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)?)/);
      if (nameMatch) extracted.name = nameMatch[1];
      
      // Infer industry
      if (lowerResponse.includes('saas') || lowerResponse.includes('software')) extracted.industry = 'SaaS';
      else if (lowerResponse.includes('fintech') || lowerResponse.includes('finance') || lowerResponse.includes('payment')) extracted.industry = 'Fintech';
      else if (lowerResponse.includes('health') || lowerResponse.includes('medical')) extracted.industry = 'Healthcare';
      else if (lowerResponse.includes('ecommerce') || lowerResponse.includes('e-commerce') || lowerResponse.includes('shop')) extracted.industry = 'E-commerce';
      else if (lowerResponse.includes('edtech') || lowerResponse.includes('education') || lowerResponse.includes('learn')) extracted.industry = 'EdTech';
      else if (lowerResponse.includes('ai') || lowerResponse.includes('machine learning') || lowerResponse.includes('artificial')) extracted.industry = 'AI/ML';
      else extracted.industry = 'Technology';
      
      extracted.description = response;
    } 
    else if (questionIndex === 1) {
      // Extract stage
      if (lowerResponse.includes('idea') || lowerResponse.includes('concept') || lowerResponse.includes('thinking')) extracted.stage = 'idea';
      else if (lowerResponse.includes('mvp') || lowerResponse.includes('prototype') || lowerResponse.includes('beta') || lowerResponse.includes('building')) extracted.stage = 'mvp';
      else if (lowerResponse.includes('growth') || lowerResponse.includes('scaling') || lowerResponse.includes('growing')) extracted.stage = 'growth';
      else if (lowerResponse.includes('scale') || lowerResponse.includes('series')) extracted.stage = 'scale';
      else extracted.stage = 'mvp';
      
      // Extract team size
      const teamMatch = response.match(/(\d+)\s*(?:people|members|team|of us|person|founders?)/i);
      if (teamMatch) extracted.team_size = parseInt(teamMatch[1]);
      else {
        const numberMatch = response.match(/\b(\d+)\b/);
        if (numberMatch) extracted.team_size = parseInt(numberMatch[1]);
        else extracted.team_size = 2;
      }
    }
    else if (questionIndex === 2) {
      // Extract challenges
      extracted.challenges = [response];
    }

    return extracted;
  };

  // Get auth token helper
  const getAuthToken = (): string => {
    // First try the token from Zustand store
    if (token) return token;
    
    // Fallback to localStorage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || '';
      } catch { /* ignore */ }
    }
    return '';
  };

  // Handle file upload - call real API with enhanced extraction
  const handleFileUpload = async (file: File, fileTypeHint?: string) => {
    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const authToken = getAuthToken();

      // Use enhanced extraction endpoint with file type hint
      const url = fileTypeHint 
        ? `https://strata-ai-backend-zj91.onrender.com/api/v1/onboarding/extract-from-file-enhanced?file_type_hint=${fileTypeHint}`
        : 'https://strata-ai-backend-zj91.onrender.com/api/v1/onboarding/extract-from-file-enhanced';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Merge extracted data based on file type
          setExtractedData(prev => ({
            ...prev,
            // From startup data (pitch deck)
            ...(result.startup_data && {
              name: result.startup_data.name || prev.name,
              industry: result.startup_data.industry || prev.industry,
              stage: result.startup_data.stage || prev.stage,
              description: result.startup_data.description || prev.description,
              team_size: result.startup_data.team_size || prev.team_size,
            }),
            // From financial data (spreadsheets, bank statements)
            ...(result.financial_data && {
              initial_cash_balance: result.financial_data.latest_cash_balance || prev.initial_cash_balance,
              initial_monthly_expenses: result.financial_data.average_monthly_expenses || prev.initial_monthly_expenses,
              initial_monthly_revenue: result.financial_data.average_monthly_revenue || prev.initial_monthly_revenue,
            }),
            // From bank statement data
            ...(result.bank_statement_data && {
              initial_cash_balance: result.bank_statement_data.closing_balance || prev.initial_cash_balance,
              initial_monthly_expenses: result.bank_statement_data.monthly_expense_estimate || prev.initial_monthly_expenses,
              initial_monthly_revenue: result.bank_statement_data.monthly_income_estimate || prev.initial_monthly_revenue,
            }),
            // From Stripe data
            ...(result.stripe_data && {
              initial_monthly_revenue: result.stripe_data.net_revenue || result.stripe_data.total_revenue || prev.initial_monthly_revenue,
            }),
          }));
        } else {
          console.error('Extraction failed:', result.error);
        }
      } else {
        console.error('Upload failed:', response.statusText);
      }

      setCurrentStep('verify');
    } catch (error) {
      console.error('Upload failed:', error);
      setCurrentStep('verify');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Google Sheets connection
  const handleGoogleSheetConnect = async () => {
    if (!googleSheetUrl.includes('docs.google.com/spreadsheets')) return;

    setIsProcessing(true);

    try {
      const authToken = getAuthToken();

      const response = await fetch('https://strata-ai-backend-zj91.onrender.com/api/v1/onboarding/connect-google-sheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sheet_url: googleSheetUrl }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.financial_data) {
          setExtractedData(prev => ({
            ...prev,
            initial_cash_balance: result.financial_data.latest_cash_balance || prev.initial_cash_balance,
            initial_monthly_expenses: result.financial_data.average_monthly_expenses || prev.initial_monthly_expenses,
            initial_monthly_revenue: result.financial_data.average_monthly_revenue || prev.initial_monthly_revenue,
          }));
        } else {
          console.error('Google Sheets extraction failed:', result.error);
        }
      } else {
        console.error('Google Sheets connection failed:', response.statusText);
      }

      setCurrentStep('verify');
    } catch (error) {
      console.error('Google Sheets connection failed:', error);
      setCurrentStep('verify');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle skip to fresh start
  const handleStartFresh = () => {
    setCurrentStep('verify');
  };

  // Handle final submission
  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const profileData = {
        name: extractedData.name || 'My Startup',
        industry: extractedData.industry || 'Technology',
        stage: extractedData.stage || 'mvp',
        description: extractedData.description,
        team_size: extractedData.team_size || 1,
        initial_cash_balance: extractedData.initial_cash_balance,
        initial_monthly_expenses: extractedData.initial_monthly_expenses,
        initial_monthly_revenue: extractedData.initial_monthly_revenue,
        goals: extractedData.challenges
      };

      // Try to create, if already exists then update (upsert behavior)
      try {
        await createStartupProfile(profileData);
      } catch (createError) {
        // If profile already exists (400 error), update instead
        if (createError instanceof Error && createError.message.includes('already exists')) {
          console.log('Profile exists, updating instead...');
          await updateStartupProfile(profileData);
        } else {
          throw createError;
        }
      }

      // Update user state
      if (user) {
        setUser({ ...user, onboardingCompleted: true });
      }

      navigate('/');
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Show error to user
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update extracted data field
  const updateField = (field: keyof ExtractedData, value: string | number) => {
    setExtractedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logoSvg} alt="Strata-AI Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Strata</h1>
          <p className="text-gray-500 mt-2">Let's get to know your startup</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['Chat', 'Connect', 'Verify'].map((step, index) => {
            const stepKey = ['chat', 'connect', 'verify'][index] as OnboardingStep;
            const isActive = currentStep === stepKey;
            const isComplete = 
              (stepKey === 'chat' && (currentStep === 'connect' || currentStep === 'verify')) ||
              (stepKey === 'connect' && currentStep === 'verify');
            
            return (
              <div key={step} className="flex items-center gap-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isComplete ? 'bg-success text-white' : isActive ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {isComplete ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                  {step}
                </span>
                {index < 2 && <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Chat */}
          {currentStep === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      max-w-[80%] rounded-2xl px-4 py-3
                      ${message.role === 'user' 
                        ? 'bg-primary-500 text-white rounded-br-md' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'}
                    `}>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-primary-500" />
                          <span className="text-xs font-medium text-primary-600">Strata AI</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                    placeholder="Type your response..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={handleChatSubmit} 
                    disabled={!inputValue.trim() || isTyping}
                    className="px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Connect Data */}
          {currentStep === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-3">
                  <Database className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Connect Your Data</h2>
                <p className="text-gray-500 mt-1">Upload files, connect services, or start fresh</p>
              </div>

              {isProcessing ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Processing {uploadedFile?.name || 'data'}...</p>
                  <p className="text-sm text-gray-400 mt-1">AI is extracting and analyzing your data</p>
                </div>
              ) : (
                <>
                  {/* Primary Options */}
                  <div className="grid gap-4 md:grid-cols-2 mb-6">
                    {/* Upload Pitch Deck */}
                    <label className="group cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pitch_deck')}
                      />
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors h-full">
                        <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-primary-500" />
                        <p className="font-medium text-gray-700 group-hover:text-primary-600">Pitch Deck</p>
                        <p className="text-xs text-gray-400 mt-1">PDF - AI extracts company info</p>
                      </div>
                    </label>

                    {/* Upload Financials */}
                    <label className="group cursor-pointer">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'financial_csv')}
                      />
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors h-full">
                        <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-primary-500" />
                        <p className="font-medium text-gray-700 group-hover:text-primary-600">Financial Spreadsheet</p>
                        <p className="text-xs text-gray-400 mt-1">CSV or Excel with monthly data</p>
                      </div>
                    </label>

                    {/* Bank Statement */}
                    <label className="group cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'bank_statement')}
                      />
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors h-full">
                        <Landmark className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-primary-500" />
                        <p className="font-medium text-gray-700 group-hover:text-primary-600">Bank Statement</p>
                        <p className="text-xs text-gray-400 mt-1">PDF - AI extracts transactions</p>
                      </div>
                    </label>

                    {/* Stripe Export */}
                    <label className="group cursor-pointer">
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'stripe_csv')}
                      />
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors h-full">
                        <CreditCard className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-primary-500" />
                        <p className="font-medium text-gray-700 group-hover:text-primary-600">Stripe Export</p>
                        <p className="text-xs text-gray-400 mt-1">CSV - Revenue & transactions</p>
                      </div>
                    </label>
                  </div>

                  {/* Google Sheets Connection */}
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-primary-400 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Table className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">Google Sheets</p>
                          <p className="text-xs text-gray-400">Paste a shareable link to your financial spreadsheet</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <input
                          type="url"
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          value={googleSheetUrl}
                          onChange={(e) => setGoogleSheetUrl(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <Button 
                          onClick={handleGoogleSheetConnect}
                          disabled={!googleSheetUrl.includes('docs.google.com/spreadsheets')}
                          variant="secondary"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Coming Soon & Start Fresh */}
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* QuickBooks (Coming Soon) */}
                    <div className="border-2 border-dashed border-gray-100 rounded-xl p-4 text-center opacity-50 cursor-not-allowed">
                      <Calculator className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="font-medium text-gray-400 text-sm">QuickBooks</p>
                      <p className="text-xs text-gray-300">Coming soon</p>
                    </div>

                    {/* Xero (Coming Soon) */}
                    <div className="border-2 border-dashed border-gray-100 rounded-xl p-4 text-center opacity-50 cursor-not-allowed">
                      <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="font-medium text-gray-400 text-sm">Xero</p>
                      <p className="text-xs text-gray-300">Coming soon</p>
                    </div>

                    {/* Start Fresh */}
                    <button
                      onClick={handleStartFresh}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors"
                    >
                      <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium text-gray-700 text-sm">Start Fresh</p>
                      <p className="text-xs text-gray-400">Enter data later</p>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 3: Verify */}
          {currentStep === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-success/20 text-success mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Verify Your Profile</h2>
                <p className="text-gray-500 mt-1">We've extracted this info - please confirm or edit</p>
              </div>

              <div className="space-y-4">
                {/* Startup Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Startup Name</label>
                  <input
                    type="text"
                    value={extractedData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Your startup name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Industry & Stage */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <input
                      type="text"
                      value={extractedData.industry || ''}
                      onChange={(e) => updateField('industry', e.target.value)}
                      placeholder="e.g., SaaS, Fintech"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                    <select
                      value={extractedData.stage || 'mvp'}
                      onChange={(e) => updateField('stage', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="idea">💡 Idea</option>
                      <option value="mvp">🚀 MVP</option>
                      <option value="growth">📈 Growth</option>
                      <option value="scale">🏢 Scale</option>
                    </select>
                  </div>
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                  <input
                    type="number"
                    min={1}
                    value={extractedData.team_size || 1}
                    onChange={(e) => updateField('team_size', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Financial Data (if uploaded) */}
                {(extractedData.initial_cash_balance || extractedData.initial_monthly_expenses) && (
                  <>
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        Extracted Financial Data
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Cash Balance</label>
                        <input
                          type="number"
                          value={extractedData.initial_cash_balance || 0}
                          onChange={(e) => updateField('initial_cash_balance', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Expenses</label>
                        <input
                          type="number"
                          value={extractedData.initial_monthly_expenses || 0}
                          onChange={(e) => updateField('initial_monthly_expenses', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Revenue</label>
                        <input
                          type="number"
                          value={extractedData.initial_monthly_revenue || 0}
                          onChange={(e) => updateField('initial_monthly_revenue', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <Button 
                  onClick={handleComplete} 
                  disabled={isSubmitting || !extractedData.name}
                  className="w-full py-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Setting up your dashboard...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
