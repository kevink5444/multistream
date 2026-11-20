/* =========================================================
   STAT CARD
   ========================================================= */

const accentStyles = {
  violet: {
    iconBackground: "bg-violet-500/10",
    iconColor: "text-violet-400",
    borderColor: "border-violet-500/10",
  },

  blue: {
    iconBackground: "bg-blue-500/10",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/10",
  },

  emerald: {
    iconBackground: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/10",
  },

  amber: {
    iconBackground: "bg-amber-500/10",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/10",
  },

  red: {
    iconBackground: "bg-red-500/10",
    iconColor: "text-red-400",
    borderColor: "border-red-500/10",
  },
};

/* =========================================================
   TREND STYLES
   ========================================================= */

const trendStyles = {
  positive: "text-emerald-400 bg-emerald-500/10",

  warning: "text-amber-400 bg-amber-500/10",

  negative: "text-red-400 bg-red-500/10",

  neutral: "text-slate-400 bg-white/[0.04]",
};

/* =========================================================
   STAT CARD COMPONENT
   ========================================================= */

function StatCard({
  title,
  value,
  description,
  trend,
  trendType = "neutral",
  icon: StatIcon,
  accent = "violet",
  footer,
}) {
  const accentStyle =
    accentStyles[accent] ?? accentStyles.violet;

  const trendStyle =
    trendStyles[trendType] ?? trendStyles.neutral;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border
        border-white/[0.06] bg-[#12121a] p-5
        transition-all duration-200
        hover:border-white/[0.10]
        hover:bg-[#15151e]
      `}
    >

      {/* ===================================================
          CARD HEADER
      =================================================== */}

      <div className="flex items-start justify-between">

        {/* Card Information */}
        <div className="min-w-0">

          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </h3>

        </div>

        {/* Statistic Icon */}
        {StatIcon && (
          <div
            className={`
              flex h-11 w-11 shrink-0 items-center
              justify-center rounded-xl
              ${accentStyle.iconBackground}
            `}
          >
            <StatIcon
              className={accentStyle.iconColor}
              size={20}
            />
          </div>
        )}

      </div>

      {/* ===================================================
          DESCRIPTION
      =================================================== */}

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

      {/* ===================================================
          TREND
      =================================================== */}

      {trend && (
        <div className="mt-4">

          <span
            className={`
              inline-flex items-center rounded-md
              px-2 py-1 text-xs font-medium
              ${trendStyle}
            `}
          >
            {trend}
          </span>

        </div>
      )}

      {/* ===================================================
          CARD FOOTER
      =================================================== */}

      {footer && (
        <div className="mt-4 border-t border-white/[0.05] pt-3">

          <p className="text-xs text-slate-500">
            {footer}
          </p>

        </div>
      )}

      {/* ===================================================
          DECORATIVE ACCENT
      =================================================== */}

      <div
        className={`
          pointer-events-none absolute -right-8 -top-8
          h-24 w-24 rounded-full blur-3xl opacity-[0.04]
          ${accentStyle.iconBackground}
        `}
      />

    </div>
  );
}

/* =========================================================
   EXPORT
   ========================================================= */

export default StatCard;