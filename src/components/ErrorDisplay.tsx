import React from 'react';
import { useError } from '../contexts/ErrorContext';
import { Alert, AlertDescription } from './ui/alert';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from './ui/button';

const ErrorDisplay: React.FC = () => {
  const { errors, removeError } = useError();

  if (errors.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = (type: string) => {
    return type === 'error' ? 'destructive' : 'default';
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {errors.map((error) => (
        <Alert key={error.id} variant={getVariant(error.type)}>
          {getIcon(error.type)}
          <AlertDescription className="flex items-center justify-between">
            <span className="flex-1 pr-2">{error.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeError(error.id)}
              className="h-auto p-1 hover:bg-destructive/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default ErrorDisplay;
