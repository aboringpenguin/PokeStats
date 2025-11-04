import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
    suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, suffix }) => {
    return (
        <div className="bg-poke-gray-dark/50 p-6 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-white">
                {value}<span className="text-2xl text-gray-300">{suffix}</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
    );
};

export default StatCard;
