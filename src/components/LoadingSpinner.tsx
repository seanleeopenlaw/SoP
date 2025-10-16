export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>

        {/* Animated spinning arc */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>

        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export function ChronotypeLoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-20 h-20">
        {/* Rotating animals */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl">🦁</div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl">🐻</div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl">🐺</div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl">🐬</div>
        </div>

        {/* Center pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-primary/20 rounded-full animate-ping"></div>
        </div>
      </div>

      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}

export function DotsLoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}
