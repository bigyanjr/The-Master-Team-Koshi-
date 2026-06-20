import { ITAHARI_WARD_NUMBERS, formatWardLabel } from '../../constants/wards';
import { inputClass } from '../admin/FormSection';

/**
 * Simple ward dropdown — options are "Ward 1" … "Ward 5", values are numeric strings.
 */
export default function WardSelect({
  id = 'wardNo',
  value,
  onChange,
  includeAllOption = false,
  allOptionLabel = 'All wards',
  includeEmptyOption = true,
  emptyLabel = 'Select ward',
  disabled = false,
  className,
  selectClassName,
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={selectClassName ?? className ?? inputClass(false)}
    >
      {includeAllOption && (
        <option value="all">{allOptionLabel}</option>
      )}
      {includeEmptyOption && !includeAllOption && (
        <option value="">{emptyLabel}</option>
      )}
      {ITAHARI_WARD_NUMBERS.map((n) => (
        <option key={n} value={n}>
          {formatWardLabel(n)}
        </option>
      ))}
    </select>
  );
}

/** Read-only ward label for ward admin forms (no dropdown). */
export function WardReadOnlyField({ wardNo, id = 'wardNo', hint }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        Ward
      </label>
      <input
        id={id}
        value={formatWardLabel(wardNo)}
        readOnly
        className={`${inputClass(false)} bg-slate-50 text-slate-700 cursor-not-allowed`}
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
