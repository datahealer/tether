import React from 'react';

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  border: string;
  bg: string;
}

interface StatsCardsProps {
  cards: StatCard[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.gradient} backdrop-blur-xl border ${card.border} rounded-2xl p-6`}
        >
          <div className="mb-4">
            <div className={`p-3 ${card.bg} rounded-xl w-fit`}>
              {card.icon}
            </div>
          </div>

          <p className="text-white text-sm mb-1">{card.label}</p>
          <p className="text-3xl font-bold text-[#1F2935]">
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};
