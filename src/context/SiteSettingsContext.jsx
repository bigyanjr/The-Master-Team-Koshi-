import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSiteSettings, updateSiteSettings, DEFAULT_SITE_SETTINGS } from '../services/siteSettingsService';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await getSiteSettings();
      if (!cancelled) {
        setSettings(loaded);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveSettings = useCallback(async (partial) => {
    const merged = await updateSiteSettings(partial);
    setSettings(merged);
    return merged;
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ ...settings, loading, saveSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
