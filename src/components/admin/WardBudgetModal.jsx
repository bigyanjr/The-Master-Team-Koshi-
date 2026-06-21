import { useState } from 'react';
import { CheckCircle, Wallet } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FieldError, inputClass } from './FormSection';
import { formatWardLabel } from '../../constants/wards';
import { DEFAULT_FISCAL_YEAR } from '../../services/wardBudgetService';

function buildInitialForm(wardNo, existingBudget) {
  return {
    fiscalYear: existingBudget?.fiscalYear || DEFAULT_FISCAL_YEAR,
    totalAllocatedBudget: existingBudget?.totalAllocatedBudget != null
      ? String(existingBudget.totalAllocatedBudget)
      : '',
    budgetTitle: existingBudget?.budgetTitle || '',
    remarks: existingBudget?.remarks || '',
  };
}

export default function WardBudgetModal({
  open, onClose, wardNo, municipalityName, existingBudget, onSave,
}) {
  const [form, setForm] = useState(() => buildInitialForm(wardNo, existingBudget));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Reset the form whenever the modal transitions from closed -> open,
  // following React's "adjust state during render" pattern instead of an
  // effect (so it can't cause a setState-in-effect cascade).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm(buildInitialForm(wardNo, existingBudget));
      setErrors({});
      setSaved(false);
      setSubmitError('');
    }
  }

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (saved) setSaved(false);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fiscalYear?.trim()) nextErrors.fiscalYear = 'Fiscal year is required';

    const amount = Number(form.totalAllocatedBudget);
    if (!form.totalAllocatedBudget?.trim()) {
      nextErrors.totalAllocatedBudget = 'Total ward budget is required';
    } else if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.totalAllocatedBudget = 'Enter an amount greater than 0';
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        municipalityName,
        wardNo,
        fiscalYear: form.fiscalYear.trim(),
        totalAllocatedBudget: Number(form.totalAllocatedBudget),
        budgetTitle: form.budgetTitle,
        remarks: form.remarks,
      });
      setSaved(true);
    } catch (err) {
      setSubmitError(err?.message || 'Could not save the ward budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Ward Budget"
      subtitle={`Set the total budget allocated to ${formatWardLabel(wardNo)} for a fiscal year.`}
    >
      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
          {submitError}
        </div>
      )}

      {saved && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Ward budget saved — visible to citizens now.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="wb-municipality" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
              Municipality
            </label>
            <input
              id="wb-municipality"
              value={municipalityName}
              readOnly
              className={`${inputClass(false)} bg-slate-50 text-slate-600 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400`}
            />
          </div>
          <div>
            <label htmlFor="wb-ward" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
              Ward number
            </label>
            <input
              id="wb-ward"
              value={formatWardLabel(wardNo)}
              readOnly
              className={`${inputClass(false)} bg-slate-50 text-slate-600 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="wb-fiscalYear" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Fiscal year <span className="text-red-500">*</span>
          </label>
          <input
            id="wb-fiscalYear"
            value={form.fiscalYear}
            onChange={(e) => update('fiscalYear', e.target.value)}
            className={inputClass(errors.fiscalYear)}
            placeholder="e.g. 2082/83"
          />
          <FieldError message={errors.fiscalYear} />
        </div>

        <div>
          <label htmlFor="wb-total" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Total ward budget allocated (NPR) <span className="text-red-500">*</span>
          </label>
          <input
            id="wb-total"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={form.totalAllocatedBudget}
            onChange={(e) => update('totalAllocatedBudget', e.target.value)}
            className={inputClass(errors.totalAllocatedBudget)}
            placeholder="e.g. 5000000"
          />
          <FieldError message={errors.totalAllocatedBudget} />
        </div>

        <div>
          <label htmlFor="wb-title" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Budget source/title <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="wb-title"
            value={form.budgetTitle}
            onChange={(e) => update('budgetTitle', e.target.value)}
            className={inputClass(false)}
            placeholder="e.g. Annual Ward Development Budget"
          />
        </div>

        <div>
          <label htmlFor="wb-remarks" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Remarks <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="wb-remarks"
            rows={3}
            value={form.remarks}
            onChange={(e) => update('remarks', e.target.value)}
            className={`${inputClass(false)} resize-none`}
            placeholder="Any notes about this budget allocation"
          />
        </div>

        <Button type="submit" variant="primary" icon={Wallet} className="w-full" disabled={saving}>
          {saving ? 'Saving…' : 'Save Ward Budget'}
        </Button>
      </form>
    </Modal>
  );
}
