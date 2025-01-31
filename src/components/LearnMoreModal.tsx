import React from 'react';
import { X, Camera, CreditCard, Clock } from 'lucide-react';

interface LearnMoreModalProps {
  onClose: () => void;
}

const LearnMoreModal: React.FC<LearnMoreModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">How Picasso Credits Work</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Camera className="w-6 h-6 text-accent-teal" />
                <h3 className="text-lg font-semibold">Print Credits</h3>
              </div>
              <p className="text-gray-600">
                Each portrait transformation uses 1 credit from your balance. Credits are deducted 
                immediately upon successful transformation, regardless of whether you choose to print 
                the image or not.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-accent-teal" />
                <h3 className="text-lg font-semibold">Pricing Structure</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">
                  We offer three ways to purchase credits:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Monthly Basic ($249.95/month) - 2,500 prints/month</li>
                  <li>Monthly Premium ($499.95/month) - 6,000 prints/month</li>
                  <li>One-Off Events:
                    <ul className="list-disc list-inside ml-4">
                      <li>100 prints for $25</li>
                      <li>300 prints for $75</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-accent-teal" />
                <h3 className="text-lg font-semibold">Credit Rollover & Expiration</h3>
              </div>
              <p className="text-gray-600">
                Monthly plan credits roll over as long as your subscription remains active. For example, 
                if you have 400 credits left from your 2,500 monthly allocation, you'll receive 2,900 
                credits on your next billing cycle (2,500 new + 400 rollover). One-off event credits 
                never expire and can be used alongside your monthly credits.
              </p>
            </section>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors shadow-button-3d mt-6"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnMoreModal;