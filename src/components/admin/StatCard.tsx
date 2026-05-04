import React, { type ReactNode } from 'react';
import Card from '../ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  isPositive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, isPositive }) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-secondary/10 text-secondary' : 'bg-primary/5 text-primary'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-[#707971] text-sm font-medium mb-1">{label}</p>
      <h2 className="text-2xl font-headline font-bold text-[#191C19]">{value}</h2>
    </Card>
  );
};

export default StatCard;
