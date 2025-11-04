import { MapPin, Globe, Lock, Plus } from 'lucide-react';
import { Property } from '../types/property';

interface PropertyCardProps {
  property: Property;
  isOwned: boolean;
  onViewDetails: (property: Property) => void;
}

export function PropertyCard({
  property,
  isOwned,
  onViewDetails,
}: PropertyCardProps) {
  return (
    <button
      onClick={() => onViewDetails(property)}
      className="w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 border border-gray-200 text-left hover:border-blue-300"
    >
     <div className="flex items-start gap-3 mb-3">
  {isOwned && (
    <div className="flex-shrink-0 mt-1">
      <div
        className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold"
        title="My Property"
      >
        My
      </div>
    </div>
  )}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">{property.type}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4" />
            <span>
              {property.area}, {property.city}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {property.is_public === 1 ? (
            <div className="p-2 bg-green-100 text-green-700 rounded" title="Public">
              <Globe className="w-4 h-4" />
            </div>
          ) : isOwned ? (
            <div className="p-2 bg-blue-100 text-blue-700 rounded" title="Only Me">
              <Lock className="w-4 h-4" />
            </div>
          ) : null}
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{property.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-600 mb-1">Size</p>
          <p className="text-sm font-medium text-gray-900">
            {property.min_size === property.size_max
              ? `${property.min_size} ${property.size_unit}`
              : `${property.min_size}-${property.size_max} ${property.size_unit}`}
          </p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-600 mb-1">Price</p>
          <p className="text-sm font-medium text-gray-900">
            {property.price_min === property.price_max
              ? `₹${property.price_min}L`
              : `₹${property.price_min}-${property.price_max}L`}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {property.highlights && (
          <div className="flex flex-wrap gap-1">
            {property.highlights.split(',').slice(0, 3).map((highlight, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded"
              >
                {highlight.trim()}
              </span>
            ))}
            {property.highlights.split(',').length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                +{property.highlights.split(',').length - 3}
              </span>
            )}
          </div>
        )}

        {isOwned && property.tags && (
          <div className="flex flex-wrap gap-1">
            {property.tags.split(',').slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag.trim()}
              </span>
            ))}
            {property.tags.split(',').length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                +{property.tags.split(',').length - 3}
              </span>
            )}
          </div>
        )}
      </div>

    
    </button>
  );
}
