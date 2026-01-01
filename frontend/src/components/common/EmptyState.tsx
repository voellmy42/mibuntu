import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    iconColor?: string;
    bgColor?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
    iconColor = 'var(--color-brand)',
    bgColor = 'var(--color-bg-secondary)'
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            height: '100%',
            minHeight: '300px'
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
            }}>
                <Icon size={40} color={iconColor} strokeWidth={1.5} />
            </div>

            <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--color-text-primary)'
            }}>
                {title}
            </h3>

            <p style={{
                margin: '0 0 32px 0',
                color: 'var(--color-text-secondary)',
                maxWidth: '400px',
                lineHeight: 1.6
            }}>
                {description}
            </p>

            {action && (
                <button
                    className="btn-primary"
                    onClick={action.onClick}
                    style={{ padding: '12px 24px', fontSize: '16px' }}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
