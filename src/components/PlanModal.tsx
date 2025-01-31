import React, { useState } from 'react';
import { X, ArrowUp, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface PlanModalProps {
  onClose: () => void;
  selectedCredits: number;
  initialPackage: 'basic' | 'premium' | null;
}

const PlanModal: React.FC<PlanModalProps> = ({ onClose, selectedCredits, initialPackage }) => {
  const [planType, setPlanType] = useState<'monthly' | 'onetime'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>(initialPackage || 'basic');
  
  const basePlanFeatures = [
    '2,500 prints per month',
    'All AI portrait styles',
    'Basic editing tools',
    'Email support',
    'Print history & analytics',
    'Credit rollover'
  ];

  const premiumPlanFeatures = [
    '6,000 prints per month',
    'Everything in Basic, plus:',
    'Priority support',
    'Custom branding',
    'Multi-location support',
    'Advanced analytics',
    'Credit rollover'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setPlanType('monthly')}
              className={cn(
                "pb-4 px-4 relative",
                planType === 'monthly' && "text-accent-teal"
              )}
            >
              <span className="flex items-center gap-2">
                MONTHLY PLAN
                <span className="px-2 py-1 bg-accent-teal/20 text-accent-teal text-xs rounded-full">
                  MOST POPULAR
                </span>
              </span>
              {planType === 'monthly' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal" />
              )}
            </button>
            <button
              onClick={() => setPlanType('onetime')}
              className={cn(
                "pb-4 px-4 relative",
                planType === 'onetime' && "text-accent-teal"
              )}
            >
              <span>ONE-OFF EVENT</span>
              {planType === 'onetime' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal" />
              )}
            </button>
          </div>

          <div className="space-y-6">
            {planType === 'onetime' && (
              <div>
                <h3 className="text-sm text-gray-600 mb-4">Select print amount</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { amount: 100, price: 25 },
                    { amount: 300, price: 75 }
                  ].map(({ amount, price }) => (
                    <button
                      key={amount}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-colors",
                        amount === selectedCredits
                          ? "border-accent-teal bg-accent-teal/10"
                          : "border-gray-200 hover:border-accent-teal/50"
                      )}
                    >
                      <div className="text-left">
                        <div className="font-bold">${price}</div>
                        <div className="text-sm text-gray-600">{amount} prints</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {planType === 'monthly' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div 
                  onClick={() => setSelectedPlan('basic')}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all cursor-pointer",
                    selectedPlan === 'basic'
                      ? "border-accent-teal bg-accent-teal/5"
                      : "border-gray-200 hover:border-accent-teal/50"
                  )}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <ArrowUp className="w-5 h-5" />
                        Monthly Basic
                      </h3>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">$249.95<span className="text-sm font-normal">/mo</span></div>
                      </div>
                    </div>
                    
                    <ul className="space-y-3">
                      {basePlanFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-accent-teal" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div 
                  onClick={() => setSelectedPlan('premium')}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all cursor-pointer",
                    selectedPlan === 'premium'
                      ? "border-accent-teal bg-accent-teal/5"
                      : "border-gray-200 hover:border-accent-teal/50"
                  )}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <ArrowUp className="w-5 h-5" />
                        Monthly Premium
                      </h3>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">$499.95<span className="text-sm font-normal">/mo</span></div>
                      </div>
                    </div>
                    
                    <ul className="space-y-3">
                      {premiumPlanFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-accent-teal" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <button className="w-full py-3 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors shadow-button-3d">
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;