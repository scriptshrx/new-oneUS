import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AlertItem {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  action?: string;
}

interface AlertsSectionProps {
  alerts: AlertItem[];
}

export default function AlertsSection({ alerts }: AlertsSectionProps) {
  const criticalAlerts = alerts.filter((a) => a.type === 'critical');
  const warningAlerts = alerts.filter((a) => a.type === 'warning');
  const infoAlerts = alerts.filter((a) => a.type === 'info');

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20';
      case 'warning':
        return 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20';
      case 'info':
        return 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20';
      default:
        return '';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-lg">🚨</span> Critical Issues
          </h3>
          <div className="space-y-2">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-3 sm:p-4 ${getAlertStyles(alert.type)}`}>
                <p className="font-semibold text-sm sm:text-base text-foreground">{alert.title}</p>
                <p className="text-xs sm:text-sm text-foreground/70 mt-1">{alert.description}</p>
                {alert.action && (
                  <button className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400 hover:underline">
                    {alert.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-lg">⚠️</span> Warnings
          </h3>
          <div className="space-y-2">
            {warningAlerts.map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-3 sm:p-4 ${getAlertStyles(alert.type)}`}>
                <p className="font-semibold text-sm sm:text-base text-foreground">{alert.title}</p>
                <p className="text-xs sm:text-sm text-foreground/70 mt-1">{alert.description}</p>
                {alert.action && (
                  <button className="mt-2 text-xs font-semibold text-yellow-700 dark:text-yellow-400 hover:underline">
                    {alert.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Alerts */}
      {infoAlerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-lg">ℹ️</span> Information
          </h3>
          <div className="space-y-2">
            {infoAlerts.map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-3 sm:p-4 ${getAlertStyles(alert.type)}`}>
                <p className="font-semibold text-sm sm:text-base text-foreground">{alert.title}</p>
                <p className="text-xs sm:text-sm text-foreground/70 mt-1">{alert.description}</p>
                {alert.action && (
                  <button className="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                    {alert.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Alerts */}
      {alerts.length === 0 && (
        <div className="text-center py-8 text-foreground/60">
          <p className="text-sm">✅ No alerts at this time. All systems operating normally.</p>
        </div>
      )}
    </div>
  );
}
