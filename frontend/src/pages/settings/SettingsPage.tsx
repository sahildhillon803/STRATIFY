import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Building2, Bell, AlertTriangle, Download, Trash2, Loader2, CheckCircle, Cpu, Lock, Eye, EyeOff, Upload, FileSpreadsheet, FileText, Landmark, CreditCard, Table, Link as LinkIcon, Zap, Settings2, Play, Check, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { getSettings, updateSettings, getStartupProfile, updateStartupProfile, exportAllData, deleteAccount } from '@/services/startup.service';
import { getLLMConfig, updateLLMConfig, testLLMConnection, deleteAPIKey } from '@/services/llm.service';
import { apiClient } from '@/services/api.client';
import type { UserSettings, UpdateSettingsInput, StartupProfile, UpdateStartupInput } from '@/types/startup.types';
import type { LLMConfig, LLMProvider } from '@/types/llm.types';

type SettingsTab = 'profile' | 'startup' | 'alerts' | 'security' | 'import' | 'data' | 'llm';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'startup', label: 'Startup Profile', icon: Building2 },
  { id: 'alerts', label: 'Alert Thresholds', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'import', label: 'Import Data', icon: Upload },
  { id: 'llm', label: 'LLM Provider', icon: Cpu },
  { id: 'data', label: 'Data & Account', icon: Download },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { user, logout, token } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading: settingsLoading } = useQuery<UserSettings>({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  // Fetch startup profile
  const { data: profile, isLoading: profileLoading } = useQuery<StartupProfile | null>({
    queryKey: ['startupProfile'],
    queryFn: getStartupProfile,
  });

  // Form state
  const [fullName, setFullName] = useState('');
  const [startupName, setStartupName] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState<'idea' | 'mvp' | 'growth' | 'scale'>('idea');
  const [teamSize, setTeamSize] = useState(1);
  const [warningThreshold, setWarningThreshold] = useState(6);
  const [criticalThreshold, setCriticalThreshold] = useState(3);
  const [currency, setCurrency] = useState('USD');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Import data state
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');

  // LLM state
  const [llmConfig, setLlmConfig] = useState<LLMConfig | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingLLM, setIsTestingLLM] = useState(false);
  const [llmTestResult, setLlmTestResult] = useState<{ success: boolean; message: string; response?: string; latency_ms?: number } | null>(null);
  const [isSavingLLM, setIsSavingLLM] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [llmSuccess, setLlmSuccess] = useState<string | null>(null);

  // Fetch LLM config
  useEffect(() => {
    if (activeTab === 'llm') {
      fetchLLMConfig();
    }
  }, [activeTab]);

  const fetchLLMConfig = async () => {
    try {
      const config = await getLLMConfig();
      setLlmConfig(config);
      setSelectedProvider(config.provider);
      setSelectedModel(config.model);
    } catch (error) {
      console.error('Failed to fetch LLM config:', error);
    }
  };

  // Initialize form values when data loads
  useEffect(() => {
    if (settings) {
      setFullName(settings.full_name || '');
      setWarningThreshold(settings.runway_warning_threshold);
      setCriticalThreshold(settings.runway_critical_threshold);
      setCurrency(settings.currency);
    }
  }, [settings]);

  useEffect(() => {
    if (profile) {
      setStartupName(profile.name);
      setIndustry(profile.industry);
      setStage(profile.stage);
      setTeamSize(profile.team_size);
    }
  }, [profile]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: UpdateSettingsInput) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showSaveMessage('Settings saved successfully!');
    },
  });

  // Update startup profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateStartupInput) => updateStartupProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startupProfile'] });
      showSaveMessage('Startup profile updated!');
    },
  });

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: exportAllData,
    onSuccess: (data) => {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `strata-ai-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showSaveMessage('Data exported successfully!');
    },
  });

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      logout();
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { current_password: string; new_password: string }) => {
      return apiClient.post('/auth/change-password', data);
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      showSaveMessage('Password changed successfully!');
    },
    onError: (error: Error) => {
      setPasswordError(error.message || 'Failed to change password');
    },
  });

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveProfile = () => {
    updateSettingsMutation.mutate({ full_name: fullName });
  };

  const handleSaveStartup = () => {
    updateProfileMutation.mutate({
      name: startupName,
      industry,
      stage,
      team_size: teamSize,
    });
  };

  const handleSaveAlerts = () => {
    updateSettingsMutation.mutate({
      runway_warning_threshold: warningThreshold,
      runway_critical_threshold: criticalThreshold,
      currency,
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.')) {
      deleteMutation.mutate();
    }
  };

  const handleChangePassword = () => {
    setPasswordError(null);
    
    // Validate
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    changePasswordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    });
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

  // Handle file upload for data import
  const handleFileImport = async (file: File, fileTypeHint: string) => {
    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const authToken = getAuthToken();
      const url = `http://127.0.0.1:8000/api/v1/onboarding/extract-from-file-enhanced?file_type_hint=${fileTypeHint}`;

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
          // Update startup profile with extracted financial data
          const updateData: UpdateStartupInput = {};
          
          if (result.financial_data) {
            updateData.initial_cash_balance = result.financial_data.latest_cash_balance;
            updateData.initial_monthly_expenses = result.financial_data.average_monthly_expenses;
            updateData.initial_monthly_revenue = result.financial_data.average_monthly_revenue;
          }
          if (result.bank_statement_data) {
            updateData.initial_cash_balance = result.bank_statement_data.closing_balance;
            updateData.initial_monthly_expenses = result.bank_statement_data.monthly_expense_estimate;
            updateData.initial_monthly_revenue = result.bank_statement_data.monthly_income_estimate;
          }
          if (result.stripe_data) {
            updateData.initial_monthly_revenue = result.stripe_data.net_revenue || result.stripe_data.total_revenue;
          }
          if (result.startup_data) {
            if (result.startup_data.name) updateData.name = result.startup_data.name;
            if (result.startup_data.industry) updateData.industry = result.startup_data.industry;
            if (result.startup_data.stage) updateData.stage = result.startup_data.stage;
            if (result.startup_data.team_size) updateData.team_size = result.startup_data.team_size;
          }

          if (Object.keys(updateData).length > 0) {
            try {
              await updateStartupProfile(updateData);
            } catch (profileError) {
              console.warn('Could not update startup profile, but data was extracted:', profileError);
              // Continue since data extraction worked
            }
          }
          
          // Force clear all cached data and refetch
          queryClient.clear(); // Clear entire cache
          
          // Invalidate specific queries
          await queryClient.invalidateQueries({ queryKey: ['startupProfile'] });
          await queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
          
          console.log('Data imported successfully - cache cleared');

          // Show success with extracted values
          const extractedValues: string[] = [];
          if (result.bank_statement_data?.closing_balance) {
            extractedValues.push(`Cash Balance: $${result.bank_statement_data.closing_balance.toLocaleString()}`);
          }
          if (result.bank_statement_data?.monthly_income_estimate) {
            extractedValues.push(`Monthly Income: $${result.bank_statement_data.monthly_income_estimate.toLocaleString()}`);
          }
          if (result.bank_statement_data?.monthly_expense_estimate) {
            extractedValues.push(`Monthly Expenses: $${result.bank_statement_data.monthly_expense_estimate.toLocaleString()}`);
          }
          if (result.financial_data?.latest_cash_balance) {
            extractedValues.push(`Cash Balance: $${result.financial_data.latest_cash_balance.toLocaleString()}`);
          }
          if (result.startup_data?.name) {
            extractedValues.push(`Company: ${result.startup_data.name}`);
          }
          if (result.startup_data?.industry) {
            extractedValues.push(`Industry: ${result.startup_data.industry}`);
          }
          
          const successMsg = extractedValues.length > 0 
            ? `Successfully imported: ${extractedValues.join(', ')}`
            : `Successfully imported data from ${file.name}`;
          setImportSuccess(successMsg);
        } else {
          setImportError(result.error || 'Failed to extract data from file');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setImportError(errorData.detail || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportError('Failed to import data. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle Google Sheets connection
  const handleGoogleSheetConnect = async () => {
    if (!googleSheetUrl.includes('docs.google.com/spreadsheets')) {
      setImportError('Please enter a valid Google Sheets URL');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const authToken = getAuthToken();

      const response = await fetch('http://127.0.0.1:8000/api/v1/onboarding/connect-google-sheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sheet_url: googleSheetUrl }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Try to update startup profile if we have financial data
          if (result.financial_data) {
            try {
              await updateStartupProfile({
                initial_cash_balance: result.financial_data.latest_cash_balance,
                initial_monthly_expenses: result.financial_data.average_monthly_expenses,
                initial_monthly_revenue: result.financial_data.average_monthly_revenue,
              });
            } catch (profileError) {
              console.warn('Could not update startup profile:', profileError);
            }
          }
          
          // Force clear all cached data and refetch
          queryClient.clear(); // Clear entire cache
          await queryClient.invalidateQueries({ queryKey: ['startupProfile'] });
          await queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
          console.log('Google Sheets data imported successfully - cache cleared');
          
          // Show success with extracted values
          const extractedValues: string[] = [];
          if (result.financial_data?.latest_cash_balance) {
            extractedValues.push(`Cash Balance: $${result.financial_data.latest_cash_balance.toLocaleString()}`);
          }
          if (result.financial_data?.average_monthly_revenue) {
            extractedValues.push(`Avg Revenue: $${result.financial_data.average_monthly_revenue.toLocaleString()}`);
          }
          if (result.records_created) {
            extractedValues.push(`${result.records_created} months imported`);
          }
          
          const successMsg = extractedValues.length > 0 
            ? `Successfully imported: ${extractedValues.join(', ')}`
            : 'Successfully connected Google Sheets data';
          setImportSuccess(successMsg);
          setGoogleSheetUrl('');
        } else {
          // API returned success: false
          const errorMsg = result.message || result.errors?.[0] || 'Failed to extract data from Google Sheets';
          setImportError(errorMsg);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setImportError(errorData.detail || 'Failed to connect to Google Sheets');
      }
    } catch (error) {
      console.error('Google Sheets connection failed:', error);
      setImportError('Failed to connect to Google Sheets. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle LLM provider change
  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setApiKeyInput('');
    setLlmTestResult(null);
    setLlmError(null);
    setLlmSuccess(null);
    
    // Set default model for the provider
    const provider = llmConfig?.available_providers.find(p => p.id === providerId);
    if (provider && provider.models.length > 0) {
      setSelectedModel(provider.models[0]);
    }
  };

  // Handle save LLM config
  const handleSaveLLMConfig = async () => {
    setIsSavingLLM(true);
    setLlmError(null);
    setLlmSuccess(null);
    
    try {
      const updatedConfig = await updateLLMConfig({
        provider: selectedProvider,
        model: selectedModel,
        api_key: apiKeyInput || undefined,
      });
      setLlmConfig(updatedConfig);
      setApiKeyInput('');
      setLlmSuccess('LLM configuration saved successfully!');
      showSaveMessage('LLM configuration updated');
      setTimeout(() => setLlmSuccess(null), 3000);
    } catch (error) {
      setLlmError(error instanceof Error ? error.message : 'Failed to save LLM configuration');
    } finally {
      setIsSavingLLM(false);
    }
  };

  // Handle test LLM connection
  const handleTestLLM = async () => {
    setIsTestingLLM(true);
    setLlmTestResult(null);
    setLlmError(null);
    
    try {
      const result = await testLLMConnection({
        provider: selectedProvider,
        model: selectedModel,
        api_key: apiKeyInput || undefined,
      });
      setLlmTestResult(result);
    } catch (error) {
      setLlmTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      });
    } finally {
      setIsTestingLLM(false);
    }
  };

  // Handle delete API key
  const handleDeleteApiKey = async (providerId: string) => {
    if (!window.confirm(`Are you sure you want to delete the API key for ${providerId}?`)) {
      return;
    }
    
    try {
      await deleteAPIKey(providerId);
      await fetchLLMConfig();
      showSaveMessage('API key deleted');
    } catch (error) {
      setLlmError(error instanceof Error ? error.message : 'Failed to delete API key');
    }
  };

  // Get current provider info
  const getCurrentProvider = (): LLMProvider | undefined => {
    return llmConfig?.available_providers.find(p => p.id === selectedProvider);
  };

  const inputClasses = "block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {saveMessage && (
        <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {saveMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-2 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Personal Information</h3>
              <p className="text-sm text-gray-500">Update your personal details</p>
            </div>
            
            {settingsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClasses}>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Email Address</label>
                    <input
                      type="email"
                      value={user?.email || settings?.email || ''}
                      disabled
                      className={`${inputClasses} bg-gray-50 text-gray-500`}
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Startup Profile Tab */}
        {activeTab === 'startup' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Startup Information</h3>
              <p className="text-sm text-gray-500">Manage your startup profile details</p>
            </div>
            
            {profileLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
            ) : !profile ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No startup profile yet. Complete the onboarding to set up your profile.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClasses}>Startup Name</label>
                    <input
                      type="text"
                      value={startupName}
                      onChange={(e) => setStartupName(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Industry</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Stage</label>
                    <select 
                      value={stage} 
                      onChange={(e) => setStage(e.target.value as typeof stage)}
                      className={inputClasses}
                    >
                      <option value="idea">💡 Idea Stage</option>
                      <option value="mvp">🚀 MVP Stage</option>
                      <option value="growth">📈 Growth Stage</option>
                      <option value="scale">🏢 Scale Stage</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Team Size</label>
                    <input
                      type="number"
                      min={1}
                      value={teamSize}
                      onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveStartup} disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Alert Thresholds Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Alert Thresholds</h3>
              <p className="text-sm text-gray-500">Configure when you receive runway warnings</p>
            </div>
            
            {settingsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClasses}>Warning Threshold (months)</label>
                    <input
                      type="number"
                      min={1}
                      max={36}
                      value={warningThreshold}
                      onChange={(e) => setWarningThreshold(parseInt(e.target.value) || 6)}
                      className={inputClasses}
                    />
                    <p className="text-xs text-gray-400 mt-1">Alert when runway falls below this</p>
                  </div>
                  <div>
                    <label className={labelClasses}>Critical Threshold (months)</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={criticalThreshold}
                      onChange={(e) => setCriticalThreshold(parseInt(e.target.value) || 3)}
                      className={inputClasses}
                    />
                    <p className="text-xs text-gray-400 mt-1">Critical alert when runway falls below this</p>
                  </div>
                  <div>
                    <label className={labelClasses}>Currency</label>
                    <select 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value)}
                      className={inputClasses}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveAlerts} disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h3>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {passwordError}
              </div>
            )}

            <div className="max-w-md space-y-4">
              {/* Current Password */}
              <div>
                <label className={labelClasses}>Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className={labelClasses}>New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters</p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className={labelClasses}>Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Import Data Tab */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Import Financial Data</h3>
              <p className="text-sm text-gray-500">Upload files or connect services to import your financial data</p>
            </div>

            {/* Success Message */}
            {importSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {importSuccess}
              </div>
            )}

            {/* Error Message */}
            {importError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {importError}
              </div>
            )}

            {isImporting ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Processing your data...</p>
                <p className="text-sm text-gray-400 mt-1">AI is extracting and analyzing your financial information</p>
              </div>
            ) : (
              <>
                {/* Primary File Upload Options */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Upload Pitch Deck */}
                  <label className="group cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileImport(e.target.files[0], 'pitch_deck')}
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
                      onChange={(e) => e.target.files?.[0] && handleFileImport(e.target.files[0], 'financial_csv')}
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
                      onChange={(e) => e.target.files?.[0] && handleFileImport(e.target.files[0], 'bank_statement')}
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
                      onChange={(e) => e.target.files?.[0] && handleFileImport(e.target.files[0], 'stripe_csv')}
                    />
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors h-full">
                      <CreditCard className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-primary-500" />
                      <p className="font-medium text-gray-700 group-hover:text-primary-600">Stripe Export</p>
                      <p className="text-xs text-gray-400 mt-1">CSV - Revenue & transactions</p>
                    </div>
                  </label>
                </div>

                {/* Google Sheets Connection */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-primary-400 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <Table className="w-10 h-10 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">Google Sheets</p>
                      <p className="text-xs text-gray-400">Paste a shareable link to your financial spreadsheet</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={googleSheetUrl}
                      onChange={(e) => setGoogleSheetUrl(e.target.value)}
                      className={inputClasses + " flex-1"}
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

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Upload className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">How it works</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Upload your financial documents and our AI will automatically extract key metrics like 
                        cash balance, monthly revenue, and expenses to update your startup profile and forecasts.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* LLM Provider Tab */}
        {activeTab === 'llm' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">LLM Provider Configuration</h3>
              <p className="text-sm text-gray-500">Configure your AI provider and model settings</p>
            </div>

            {/* Success/Error Messages */}
            {llmSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {llmSuccess}
              </div>
            )}
            {llmError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {llmError}
              </div>
            )}

            {!llmConfig ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : (
              <>
                {/* Current Configuration Status */}
                <div className={`p-6 rounded-2xl border ${llmConfig.is_connected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${llmConfig.is_connected ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                        <Zap className="h-6 w-6" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${llmConfig.is_connected ? 'text-green-600' : 'text-yellow-600'}`}>
                          {llmConfig.is_connected ? 'Connected' : 'Not Connected'}
                        </p>
                        <p className={`text-xl font-bold ${llmConfig.is_connected ? 'text-green-900' : 'text-yellow-900'}`}>
                          {llmConfig.available_providers.find(p => p.id === llmConfig.provider)?.name || llmConfig.provider}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${llmConfig.is_connected ? 'text-green-600' : 'text-yellow-600'}`}>Current Model</p>
                      <p className={`text-sm font-medium ${llmConfig.is_connected ? 'text-green-900' : 'text-yellow-900'}`}>{llmConfig.model}</p>
                    </div>
                  </div>
                </div>

                {/* Provider Selection */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Select Provider</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {llmConfig.available_providers.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleProviderChange(provider.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedProvider === provider.id 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              provider.id === 'groq' ? 'bg-orange-100' :
                              provider.id === 'openai' ? 'bg-green-100' :
                              provider.id === 'gemini' ? 'bg-blue-100' :
                              'bg-purple-100'
                            }`}>
                              <Cpu className={`h-4 w-4 ${
                                provider.id === 'groq' ? 'text-orange-600' :
                                provider.id === 'openai' ? 'text-green-600' :
                                provider.id === 'gemini' ? 'text-blue-600' :
                                'text-purple-600'
                              }`} />
                            </div>
                            <span className="font-medium text-gray-900">{provider.name}</span>
                          </div>
                          {provider.is_configured && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{provider.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          {provider.requires_api_key ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              provider.is_configured 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {provider.is_configured ? 'API Key Set' : 'API Key Required'}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              No API Key Needed
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Selection */}
                {getCurrentProvider() && (
                  <div>
                    <label className={labelClasses}>Select Model</label>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className={inputClasses + " appearance-none pr-10"}
                      >
                        {getCurrentProvider()?.models.map((model) => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {getCurrentProvider()?.models.length} models available for {getCurrentProvider()?.name}
                    </p>
                  </div>
                )}

                {/* API Key Input */}
                {getCurrentProvider()?.requires_api_key && (
                  <div>
                    <label className={labelClasses}>
                      API Key {getCurrentProvider()?.is_configured && <span className="text-green-600">(Already configured)</span>}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder={getCurrentProvider()?.is_configured ? '••••••••••••••••' : `Enter your ${getCurrentProvider()?.name} API key`}
                          className={inputClasses}
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {getCurrentProvider()?.is_configured && (
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteApiKey(selectedProvider)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Get your API key from {getCurrentProvider()?.name}'s dashboard. Keys are stored securely.
                    </p>
                  </div>
                )}

                {/* Test Connection */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Test Connection</h4>
                      <p className="text-xs text-gray-500">Verify your LLM configuration works correctly</p>
                    </div>
                    <Button
                      onClick={handleTestLLM}
                      disabled={isTestingLLM || (getCurrentProvider()?.requires_api_key && !getCurrentProvider()?.is_configured && !apiKeyInput)}
                      variant="outline"
                      size="sm"
                    >
                      {isTestingLLM ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Test Result */}
                  {llmTestResult && (
                    <div className={`mt-3 p-3 rounded-lg ${llmTestResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                      <div className="flex items-start gap-2">
                        {llmTestResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${llmTestResult.success ? 'text-green-700' : 'text-red-700'}`}>
                            {llmTestResult.message}
                          </p>
                          {llmTestResult.response && (
                            <p className="text-xs text-green-600 mt-1 bg-green-50 p-2 rounded">
                              Response: "{llmTestResult.response}"
                            </p>
                          )}
                          {llmTestResult.latency_ms && (
                            <p className="text-xs text-gray-500 mt-1">
                              Latency: {llmTestResult.latency_ms}ms
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => {
                      setSelectedProvider(llmConfig.provider);
                      setSelectedModel(llmConfig.model);
                      setApiKeyInput('');
                      setLlmTestResult(null);
                    }}
                    variant="outline"
                    disabled={isSavingLLM}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSaveLLMConfig}
                    disabled={isSavingLLM}
                  >
                    {isSavingLLM ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Settings2 className="h-4 w-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Cpu className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Provider Tips</h4>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        <li>• <strong>Groq:</strong> Best for speed. Free tier available with generous limits.</li>
                        <li>• <strong>OpenAI:</strong> GPT-4 for highest quality. Requires paid API access.</li>
                        <li>• <strong>Gemini:</strong> Great for multi-modal tasks. Free tier available.</li>
                        <li>• <strong>Ollama:</strong> Run locally for privacy. Requires local installation.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Data & Account Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Data Export & Account</h3>
              <p className="text-sm text-gray-500">Export your data or manage your account</p>
            </div>
            
            {/* Export Section */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Export All Data</h4>
                  <p className="text-sm text-gray-500 mt-1">Download all your data as a JSON file</p>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => exportMutation.mutate()}
                  disabled={exportMutation.isPending}
                >
                  {exportMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export Data
                </Button>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="border border-danger/30 bg-danger/5 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-danger flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Delete Account
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button 
                  variant="secondary"
                  onClick={handleDeleteAccount}
                  disabled={deleteMutation.isPending}
                  className="!bg-danger/10 !text-danger hover:!bg-danger/20 !border-danger/30"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
