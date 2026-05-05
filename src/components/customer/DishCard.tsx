import React from 'react';
import type { MenuItem } from '../../types';
import { Camera } from 'lucide-react';
import Card from '../ui/Card';
import { Link, useParams } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

interface DishCardProps {
  dish: MenuItem;
}

const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <Link to={`/${slug}/dish/${dish.id}`}>
      <Card className="mb-4 active:scale-[0.98] transition-transform">
        <div className="relative h-44 w-full">
          <img 
            src={dish.image_url} 
            alt={dish.name} 
            className="w-full h-full object-cover"
          />
          {dish.model_url && (
            <div className="absolute top-3 right-3 bg-[#D4A843] text-white p-1.5 rounded-full shadow-lg">
              <Camera size={18} />
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-bold text-[#191C19] line-clamp-1">{dish.name}</h3>
            <span className="text-primary font-bold">
              {formatPrice(dish.price)}
            </span>
          </div>
          <p className="text-[#707971] text-xs line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        </div>
      </Card>
    </Link>
  );
};

export default DishCard;
