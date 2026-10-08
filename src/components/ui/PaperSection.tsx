import React from 'react';

interface PaperSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  sectionNumber?: string;
  fieldStamp?: string;
  className?: string;
  ruled?: boolean;
  action?: React.ReactNode;
}

export function PaperSection({
  children,
  title,
  subtitle,
  sectionNumber,
  fieldStamp,
  className = '',
  ruled = false,
  action,
}: PaperSectionProps) {
  return (
    <section 
      className={`paper-card ${ruled ? 'paper-card-ruled' : ''} ${className}`}
      style={{
        padding: '1.75rem',
        marginBottom: '2rem',
        border: '1px solid var(--paper-border-dark)',
      }}
    >
      {(title || sectionNumber || fieldStamp) && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--paper-border)',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              {sectionNumber && (
                <span className="field-stamp green">
                  SEC // {sectionNumber}
                </span>
              )}
              {fieldStamp && (
                <span className="field-stamp">
                  {fieldStamp}
                </span>
              )}
            </div>
            {title && (
              <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.45rem' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
