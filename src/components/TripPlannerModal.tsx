"use client";

import { useState } from "react";

interface TripPlannerFormData {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: string;
  currency: 'EUR' | 'USD' | 'RON';
  adults: string;
  children: string;
  accommodation: 'budget' | 'mid-range' | 'luxury';
  interests: string[];
  otherPreferences: string;
}

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

const INTEREST_OPTIONS = [
  'Culture & History',
  'Food & Dining',
  'Nature & Outdoors',
  'Nightlife & Entertainment',
  'Adventure Sports',
  'Photography',
  'Art & Museums',
  'Shopping',
  'Beaches & Relaxation',
  'Architecture',
  'Local Festivals',
  'Wildlife',
  'Hiking & Trekking',
  'Religious Sites',
  'Music & Concerts',
  'Family Activities',
  'Wellness & Spa',
  'Street Markets',
  'Local Transportation',
  'Hidden Gems'
];

export default function TripPlannerModal({ isOpen, onClose, onSubmit }: TripPlannerModalProps) {
  const [formData, setFormData] = useState<TripPlannerFormData>({
    destination: '',
    startDate: null,
    endDate: null,
    budget: '',
    currency: 'EUR',
    adults: '2',
    children: '0',
    accommodation: 'mid-range',
    interests: [],
    otherPreferences: ''
  });

  const [errors, setErrors] = useState<Partial<TripPlannerFormData>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<TripPlannerFormData> = {};

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = null; // We'll handle this differently
    }
    if (!formData.endDate) {
      newErrors.endDate = null; // We'll handle this differently
    }
    if (!formData.budget.trim() || isNaN(Number(formData.budget))) {
      newErrors.budget = 'Valid budget amount is required';
    }
    if (!formData.adults.trim() || isNaN(Number(formData.adults)) || Number(formData.adults) < 1) {
      newErrors.adults = 'At least 1 adult is required';
    }
    if (isNaN(Number(formData.children)) || Number(formData.children) < 0) {
      newErrors.children = 'Valid number of children is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && formData.startDate !== null && formData.endDate !== null;
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const generateTripPlanMessage = (): string => {
    const duration = formData.startDate && formData.endDate 
      ? Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const travelers = Number(formData.adults) + Number(formData.children);
    const travelerInfo = Number(formData.children) > 0 
      ? `${formData.adults} adults and ${formData.children} children`
      : `${formData.adults} adults`;

    let message = `I'm planning a trip and need your help! Here are the details:

🌍 **Destination:** ${formData.destination}
📅 **Travel Dates:** ${formData.startDate ? formatDate(formData.startDate) : ''} to ${formData.endDate ? formatDate(formData.endDate) : ''} (${duration} days)
👥 **Travelers:** ${travelerInfo} (${travelers} people total)
💰 **Budget:** ${formData.budget} ${formData.currency}
🏨 **Accommodation Preference:** ${formData.accommodation}`;

    if (formData.interests.length > 0) {
      message += `\n🎯 **Interests:** ${formData.interests.join(', ')}`;
    }

    if (formData.otherPreferences.trim()) {
      message += `\n📝 **Other Preferences:** ${formData.otherPreferences}`;
    }

    message += `\n\nCould you please help me with:
1. **Accommodation suggestions** - Recommend some ${formData.accommodation} hotels, hostels, or other lodging options in ${formData.destination} for these dates within my budget
2. **Daily itinerary** - Create a detailed day-by-day itinerary that includes the activities and places that match my interests
3. **Budget breakdown** - Provide an estimated cost breakdown for accommodation, food, activities, and transportation

Thank you!`;

    return message;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const message = generateTripPlanMessage();
    onSubmit(message);
    onClose();
    
    // Reset form
    setFormData({
      destination: '',
      startDate: null,
      endDate: null,
      budget: '',
      currency: 'EUR',
      adults: '2',
      children: '0',
      accommodation: 'mid-range',
      interests: [],
      otherPreferences: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Plan Your Trip
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destination *
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Paris, France"
            />
            {errors.destination && (
              <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  startDate: e.target.value ? new Date(e.target.value) : null 
                }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  endDate: e.target.value ? new Date(e.target.value) : null 
                }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget *
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as 'EUR' | 'USD' | 'RON' }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="RON">RON (lei)</option>
              </select>
            </div>
          </div>

          {/* Travelers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adults *
              </label>
              <input
                type="number"
                min="1"
                value={formData.adults}
                onChange={(e) => setFormData(prev => ({ ...prev, adults: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.adults && (
                <p className="text-red-500 text-sm mt-1">{errors.adults}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Children
              </label>
              <input
                type="number"
                min="0"
                value={formData.children}
                onChange={(e) => setFormData(prev => ({ ...prev, children: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.children && (
                <p className="text-red-500 text-sm mt-1">{errors.children}</p>
              )}
            </div>
          </div>

          {/* Accommodation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accommodation Preference
            </label>
            <select
              value={formData.accommodation}
              onChange={(e) => setFormData(prev => ({ ...prev, accommodation: e.target.value as 'budget' | 'mid-range' | 'luxury' }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Interests (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-3">
              {INTEREST_OPTIONS.map((interest) => (
                <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Other Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Other Preferences
            </label>
            <textarea
              value={formData.otherPreferences}
              onChange={(e) => setFormData(prev => ({ ...prev, otherPreferences: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any special requirements, dietary restrictions, mobility needs, etc."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Plan My Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}