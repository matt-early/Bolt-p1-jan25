import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessNotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  message,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
          <div className="flex-1">
            {message.split('\n').map((line, i) => (
              <p key={i} className={`text-green-800 ${i === 0 ? 'font-medium' : 'mt-1'}`}>
                {line}
              </p>
            ))}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}