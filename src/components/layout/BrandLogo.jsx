import { Link } from 'react-router-dom';
import { PRODUCT_NAME } from '../../config/branding';

const LOGO_SRC = '/logo.png';

/**
 * Logo PNG includes extra white padding — we zoom inside a circular frame
 * so the mark reads clearly in the navbar without oversized layout.
 */
const sizeMap = {
  sm: {
    box: 'h-11 w-11',
    scale: 'scale-[2]',
    width: 44,
    height: 44,
  },
  nav: {
    box: 'h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem]',
    scale: 'scale-[2.05]',
    width: 72,
    height: 72,
  },
  md: {
    box: 'h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem]',
    scale: 'scale-[2.05]',
    width: 72,
    height: 72,
  },
  lg: {
    box: 'h-[5.5rem] w-[5.5rem] sm:h-24 sm:w-24',
    scale: 'scale-[2.05]',
    width: 96,
    height: 96,
  },
};

export default function BrandLogo({ to = '/', size = 'md', className = '' }) {
  const dims = sizeMap[size] || sizeMap.md;

  return (
    <Link
      to={to}
      className={`inline-flex shrink-0 focus-ring transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] ${className}`}
      aria-label={`${PRODUCT_NAME} home`}
    >
      <span
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200/90 shadow-md ${dims.box}`}
      >
        <img
          src={LOGO_SRC}
          alt={PRODUCT_NAME}
          className={`absolute inset-0 m-auto h-full w-full max-w-none object-contain ${dims.scale}`}
          width={dims.width}
          height={dims.height}
          decoding="async"
          fetchPriority="high"
        />
      </span>
    </Link>
  );
}
