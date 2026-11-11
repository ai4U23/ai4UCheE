// Non-blocking token-expired banner: appears on any 401 from the gated API (che:unauthorized event).
// vi default copy per phase-02 ("Token hết hạn — liên hệ quản trị"), en variant; fixed under the studio bar.
import React, { useEffect, useState } from 'react';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { getShellCopy } from '../../lib/i18n/vi-shell-dictionary';
import { AUTH_ERROR_EVENT } from '../../lib/embed-token-store';

export const TokenExpiredBanner: React.FC = () => {
  const { locale } = usePersonaTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onAuthError = (): void => setVisible(true);
    window.addEventListener(AUTH_ERROR_EVENT, onAuthError);
    return () => window.removeEventListener(AUTH_ERROR_EVENT, onAuthError);
  }, []);

  if (!visible) return null;
  const t = getShellCopy(locale);
  return (
    <div className="token-expired-banner" data-testid="token-expired-banner" role="alert" aria-live="assertive">
      <span>{t.tokenExpiredBanner}</span>
    </div>
  );
};
