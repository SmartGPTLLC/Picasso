import React, { useState } from 'react';
import { Clock, Upload, ArrowRight, Info, ChevronLeft, X, Check, Tag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import PlanModal from './PlanModal';
import LearnMoreModal from './LearnMoreModal';

interface CreditOption {
  amount: number;
  price: number;
  isSelected: boolean;
}

type PackageType = 'basic' | 'premium' | null;

interface PlanPricing {
  original: number;
  discounted: number | null;
}

const PaymentPlans: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCredits, setSelectedCredits] = useState<number>(100);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountStatus, setDiscountStatus] = useState<'idle' | 'applying' | 'success' | 'error'>('idle');
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  
  const creditOptions: CreditOption[] = [
    { amount: 100, price: 25, isSelected: selectedCredits === 100 },
    { amount: 300, price: 75, isSelected: selectedCredits === 300 }
  ];

  const getPlanPricing = (basePrice: number): PlanPricing => ({
    original: basePrice,
    discounted: appliedDiscount ? basePrice * (1 - appliedDiscount) : null
  });

  const basicPlan = getPlanPricing(249.95);
  const premiumPlan = getPlanPricing(499.95);

  const handlePackageSelect = (packageType: PackageType) => {
    setSelectedPackage(packageType);
    setShowPlanModal(true);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) return;
    
    setDiscountStatus('applying');
    // Simulate discount application
    setTimeout(() => {
      const isWeddingMBA = discountCode.toLowerCase() === 'wedding mba';
      if (isWeddingMBA) {
        setAppliedDiscount(0.15); // 15% discount
        setDiscountStatus('success');
      } else {
        setAppliedDiscount(null);
        setDiscountStatus('error');
      }
      setTimeout(() => setDiscountStatus('idle'), 3000);
    }, 1000);
  };

  const currentBalance = 5; // Mock balance for demo

  return (
    <div className="min-h-screen bg-canvas text-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Photo Booth</span>
          </Link>
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Demo Section */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Free Demo</h2>
                <span className="px-3 py-1 bg-accent-teal/20 text-accent-teal rounded-full text-sm">
                  Active
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-primary">{currentBalance} prints remaining</span>
                </div>

                <p className="text-gray-600 text-sm">
                  Try our AI portrait studio with 10 free prints! Upgrade to a monthly plan or purchase additional credits anytime.
                </p>
              </div>

              <button 
                onClick={() => handlePackageSelect('basic')}
                className="w-full py-3 bg-accent-teal text-white rounded-lg transition-colors hover:bg-accent-teal/90 shadow-button-3d"
              >
                Upgrade Plan
              </button>

              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-semibold text-gray-800">Amazon Starter Kit</h3>
                <p className="text-sm text-gray-600">
                  Get everything you need to start your photo booth business
                </p>
                <a 
                  href="#" 
                  className="block w-full py-3 bg-primary text-black rounded-lg transition-colors hover:bg-primary/90 shadow-button-3d text-center"
                >
                  View Recommended Kit
                </a>
              </div>
            </div>
          </div>

          {/* Credits Section */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Picasso Credits</h2>
                <span className="px-3 py-1 bg-accent-teal/20 text-accent-teal rounded-full text-sm">
                  Balance: {currentBalance}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handlePackageSelect('basic')}
                  className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <div className="flex flex-col items-start space-y-1">
                    <span className="text-sm text-gray-600">Monthly Basic</span>
                    <span className="text-sm">2,500 prints</span>
                    <div className="font-bold">
                      {basicPlan.discounted ? (
                        <>
                          <span className="line-through text-gray-400">${formatPrice(basicPlan.original)}</span>
                          <span className="ml-2">${formatPrice(basicPlan.discounted)}</span>
                        </>
                      ) : (
                        <span>${formatPrice(basicPlan.original)}</span>
                      )}
                      <span className="text-sm font-normal">/mo</span>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => handlePackageSelect('premium')}
                  className="p-4 bg-accent-teal/20 border-2 border-accent-teal rounded-lg hover:bg-accent-teal/30 transition-colors"
                >
                  <div className="flex flex-col items-start space-y-1">
                    <span className="text-sm text-gray-600">Monthly Premium</span>
                    <span className="text-sm">6,000 prints</span>
                    <div className="font-bold">
                      {premiumPlan.discounted ? (
                        <>
                          <span className="line-through text-gray-400">${formatPrice(premiumPlan.original)}</span>
                          <span className="ml-2">${formatPrice(premiumPlan.discounted)}</span>
                        </>
                      ) : (
                        <span>${formatPrice(premiumPlan.original)}</span>
                      )}
                      <span className="text-sm font-normal">/mo</span>
                    </div>
                  </div>
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">One-Off Events</h3>
                <div className="grid grid-cols-2 gap-4">
                  {creditOptions.map((option) => (
                    <button
                      key={option.amount}
                      onClick={() => setSelectedCredits(option.amount)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-colors",
                        option.isSelected
                          ? "border-accent-teal bg-accent-teal/10"
                          : "border-gray-200 hover:border-accent-teal/50"
                      )}
                    >
                      <div className="text-left">
                        <div className="font-bold">${option.price}</div>
                        <div className="text-sm text-gray-600">{option.amount} prints</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handlePackageSelect('premium')}
                className="w-full py-3 bg-accent-teal text-white rounded-lg transition-colors hover:bg-accent-teal/90 shadow-button-3d flex items-center justify-center space-x-2"
              >
                <span>Purchase Credits</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center space-x-2 text-gray-800">
                    <Tag className="w-5 h-5 text-accent-teal" />
                    <span>Apply Discount</span>
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter discount code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal"
                    />
                    <button
                      onClick={handleApplyDiscount}
                      disabled={discountStatus === 'applying'}
                      className="px-4 py-2 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors disabled:opacity-50"
                    >
                      {discountStatus === 'applying' ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  {discountStatus === 'success' && (
                    <p className="text-sm text-green-600">15% discount applied successfully!</p>
                  )}
                  {discountStatus === 'error' && (
                    <p className="text-sm text-accent-red">Invalid discount code</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center space-x-2 text-gray-800">
                    <span>Your Portrait Credits</span>
                    <Clock className="w-5 h-5" />
                  </h4>
                  <p className="text-sm text-gray-600">
                    Current balance: {currentBalance} prints
                    <br />
                    Each portrait uses 1 credit. Monthly plans offer the best value with rollover credits.
                  </p>
                  <button 
                    onClick={() => setShowLearnMoreModal(true)}
                    className="text-accent-teal text-sm hover:underline"
                  >
                    LEARN MORE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPlanModal && (
        <PlanModal 
          onClose={() => {
            setShowPlanModal(false);
            setSelectedPackage(null);
          }} 
          selectedCredits={selectedCredits}
          initialPackage={selectedPackage}
        />
      )}

      {showLearnMoreModal && (
        <LearnMoreModal onClose={() => setShowLearnMoreModal(false)} />
      )}
    </div>
  );
};

export default PaymentPlans;