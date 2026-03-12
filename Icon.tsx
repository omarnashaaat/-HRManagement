import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
    name: string;
    size?: number;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = "" }) => {
    // Convert kebab-case to PascalCase for Lucide icons
    const pascalName = name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const LucideIcon = (LucideIcons as any)[pascalName] || LucideIcons.HelpCircle;

    return <LucideIcon size={size} className={className} />;
};
