import { useState } from 'react';
import { Image as ImageIcon, CheckCircle } from 'lucide-react';
import FormSection from '../components/admin/FormSection';
import FileUpload from '../components/ui/FileUpload';
import Button from '../components/ui/Button';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function AdminSettings() {
  const { heroImageUrl, loading, saveSettings } = useSiteSettings();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentValue = draft !== null
    ? draft
    : (heroImageUrl ? { fileUrl: heroImageUrl, fileName: 'Current home page image' } : null);

  const handleChange = (value) => {
    setDraft(value);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings({ heroImageUrl: draft ? draft.fileUrl : null });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-slate-50">Site Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          These settings apply to the public home page for everyone, across all wards.
        </p>
      </div>

      <FormSection
        icon={ImageIcon}
        title="Home page hero image"
        subtitle="Replace the default green background with a photo or banner. Recommended: a wide image, at least 1600px across."
      >
        {loading ? (
          <p className="text-sm text-slate-500">Loading current settings…</p>
        ) : (
          <div className="space-y-4">
            <FileUpload
              id="hero-image-upload"
              hint="Drop an image here for the home page hero"
              value={currentValue}
              onChange={handleChange}
              storageFolder="site"
            />
            <div className="flex items-center gap-3">
              <Button variant="emerald" size="md" onClick={handleSave} disabled={saving || draft === null}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
              {saved && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  Saved — visible to all visitors now
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Leave empty to use the default green gradient hero instead of a photo.
            </p>
          </div>
        )}
      </FormSection>
    </div>
  );
}
