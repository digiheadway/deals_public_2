import { useState, useEffect, useRef } from 'react';
import { X, Copy, Share2, Trash2, MessageCircle, Edit2, Plus, Ruler, IndianRupee, MapPin, FileText, Sparkles, Tag, Lock, Globe, ChevronDown, Star, Building, CornerDownRight, Navigation, Shield, Wifi, Calendar, AlertCircle, TreePine, Home, TrendingUp, DollarSign, Info, Satellite, Map as MapIcon, Search } from 'lucide-react';
import { Property } from '../types/property';
import { formatPrice, formatPriceWithLabel } from '../utils/priceFormatter';
import { HIGHLIGHT_OPTIONS, TAG_OPTIONS } from '../utils/filterOptions';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../contexts/AuthContext';
import type { LeafletMouseEvent } from 'leaflet';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface PropertyDetailsModalProps {
  property: Property;
  isOwned: boolean;
  onClose: () => void;
  onEdit?: (property: Property) => void;
  onDelete?: (id: number) => void;
  onTogglePublic?: (id: number, isPublic: boolean) => void;
  onShare?: (property: Property) => void;
  onAskQuestion?: (property: Property) => void;
  onUpdateHighlightsAndTags?: (id: number, highlights: string, tags: string) => void;
  onUpdateLocation?: (id: number, location: string, locationAccuracy: string) => void;
}

// Map highlight text to icons
const getHighlightIcon = (highlight: string) => {
  const iconMap: Record<string, any> = {
    'Corner': CornerDownRight,
    'Urgent Sale': AlertCircle,
    'On 12 Meter': Navigation,
    'On 18 Meter': Navigation,
    'On 24 Meter': Navigation,
    'On Wide Road': Navigation,
    'Prime Location': MapPin,
    'Two Side Open': CornerDownRight,
    'Park Facing': TreePine,
    'East Facing': Navigation,
    'South Facing': Navigation,
    '3 Side Open': CornerDownRight,
    'Gated Society': Shield,
    'Good Connectivity': Wifi,
    'Multipurpose': Building,
    'Green Belt': TreePine,
    'Extra Space': Home,
    'Luxury Builtup': Star,
    'Very Less Price': DollarSign,
    'Great Investment': TrendingUp,
  };
  return iconMap[highlight] || Sparkles;
};

// Convert highlight options to format with icons
const HIGHLIGHT_OPTIONS_WITH_ICONS = HIGHLIGHT_OPTIONS.map(text => ({
  text,
  icon: getHighlightIcon(text),
}));

// Helper function to check if location has lat/long format
function hasLocationCoordinates(location: string | undefined): boolean {
  if (!location) return false;
  // Check if location is in "lat,long" format (e.g., "28.7041,77.1025")
  const latLongPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
  return latLongPattern.test(location.trim());
}

// Get type-specific styling for highlights
function getHighlightStyles(type: string) {
  const typeLower = type.toLowerCase();
  const isPlot = typeLower.includes('plot');
  
  if (isPlot) {
    // Plot - gray color
    return {
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
    };
  } else {
    // Other - orange color
    return {
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    };
  }
}

export function PropertyDetailsModal({
  property,
  isOwned,
  onClose,
  onEdit,
  onDelete,
  onTogglePublic,
  onShare,
  onAskQuestion,
  onUpdateHighlightsAndTags,
  onUpdateLocation,
}: PropertyDetailsModalProps) {
  const highlightStyles = getHighlightStyles(property.type);
  const [copied, setCopied] = useState(false);
  const [copiedLocation, setCopiedLocation] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLocationViewModal, setShowLocationViewModal] = useState(false);
  const [showNoteTooltip, setShowNoteTooltip] = useState(false);
  const [showLocationLockTooltip, setShowLocationLockTooltip] = useState(false);
  const [showPrivacyInfoTooltip, setShowPrivacyInfoTooltip] = useState(false);
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>(
    property.highlights ? property.highlights.split(',').map(h => h.trim()).filter(Boolean) : []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    property.tags ? property.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  );

  // Parse location coordinates
  const parseLocation = (location: string | undefined): { lat: number; lng: number } | null => {
    if (!hasLocationCoordinates(location || '')) return null;
    const parts = (location || '').split(',');
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  };

  const locationCoords = parseLocation(property.location);
  const hasLocation = hasLocationCoordinates(property.location);

  // Open location in map modal
  const handleOpenInMap = () => {
    if (!locationCoords) return;
    setShowLocationViewModal(true);
  };

  // Open location in Google Maps
  const handleOpenInGoogleMaps = () => {
    if (!locationCoords) return;
    const { lat, lng } = locationCoords;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Copy location Google Maps link
  const handleCopyLocation = () => {
    if (!locationCoords) return;
    const { lat, lng } = locationCoords;
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    navigator.clipboard.writeText(googleMapsUrl);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2000);
  };

  // Update local state when property changes
  useEffect(() => {
    setSelectedHighlights(
      property.highlights ? property.highlights.split(',').map(h => h.trim()).filter(Boolean) : []
    );
    setSelectedTags(
      property.tags ? property.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    );
  }, [property]);

  const handleCopy = () => {
    const sizeText = property.min_size === property.size_max
      ? `${property.min_size} ${property.size_unit}`
      : `${property.min_size}-${property.size_max} ${property.size_unit}`;
    const priceText = formatPriceWithLabel(property.price_min, property.price_max);
    const text = `${property.type} in ${property.area}, ${property.city}\n${property.description}\nSize: ${sizeText}\nPrice: ${priceText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleHighlight = (highlight: string) => {
    setSelectedHighlights(prev =>
      prev.includes(highlight)
        ? prev.filter(h => h !== highlight)
        : [...prev, highlight]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSaveHighlights = () => {
    if (onUpdateHighlightsAndTags) {
      // Use current selectedTags state (which may have been updated) instead of property.tags
      onUpdateHighlightsAndTags(
        property.id,
        selectedHighlights.join(', '),
        selectedTags.join(', ')
      );
    }
    setShowHighlightModal(false);
  };

  const handleSaveTags = () => {
    if (onUpdateHighlightsAndTags) {
      // Use current selectedHighlights state (which may have been updated) instead of property.highlights
      onUpdateHighlightsAndTags(
        property.id,
        selectedHighlights.join(', '),
        selectedTags.join(', ')
      );
    }
    setShowTagModal(false);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 mobile-modal-container">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl mobile-modal-content sm:max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{property.type} #{property.id}</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-gray-500" />
                <span className="text-sm sm:text-base text-gray-600">Size</span>
              </div>
              <div className="text-right">
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  {property.min_size === property.size_max
                    ? property.min_size
                    : `${property.min_size}-${property.size_max}`}
                  <span className="text-sm sm:text-base text-gray-700"> {property.size_unit}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-500" />
                <span className="text-sm sm:text-base text-gray-600">Price</span>
              </div>
              <div className="text-right">
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  {formatPrice(property.price_min, property.price_max, true)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-sm sm:text-base text-gray-600" >Area</span>
              </div>
              <div className="text-right">
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  {property.area}, {property.city}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm sm:text-base text-gray-600" >Location</span>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowLocationLockTooltip(true)}
                    onMouseLeave={() => setShowLocationLockTooltip(false)}
                    onClick={() => setShowLocationLockTooltip(!showLocationLockTooltip)}
                    className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {showLocationLockTooltip && (
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded z-50 pointer-events-none min-w-[200px] sm:min-w-[250px] max-w-[280px] sm:max-w-[320px]">
                      Location is only visible to you. Others cannot see the exact coordinates.
                      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right flex items-center gap-2 flex-wrap justify-end">
                {hasLocation ? (
                  <>
                    <button
                      onClick={handleOpenInMap}
                      className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Navigation className="w-4 h-4" />
                      Open {property.location_accuracy && `(${property.location_accuracy}m)`}
                    </button>
                    {isOwned && (
                      <button
                        onClick={() => setShowLocationModal(true)}
                        className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {isOwned && (
                      <button
                        onClick={() => setShowLocationModal(true)}
                        className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Location
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm sm:text-base text-gray-600" >Created on</span>
              </div>
              <div className="text-right">
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  {new Date(property.created_on).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {property.description && (
            <div>
              <h3 className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                Description
              </h3>
              <p className="text-sm sm:text-base font-semibold text-gray-900 leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                Highlights
              </h3>
              {isOwned && (
                <button
                  onClick={() => setShowHighlightModal(true)}
                  className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  {selectedHighlights.length > 0 ? (
                    "Manage"
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 inline" /> Add
                    </>
                  )}
                </button>
              )}
            </div>
            {selectedHighlights.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedHighlights.map((highlight, idx) => {
                  const Icon = getHighlightIcon(highlight);
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 ${highlightStyles.bgColor} ${highlightStyles.textColor} rounded-lg text-xs font-medium flex items-center gap-1.5`}
                    >
                      <Icon className="w-3 h-3" />
                      {highlight}
                    </span>
                  );
                })}
              </div>
            ) : (
              isOwned && (
                <p className="text-xs text-gray-500">Add key features of property</p>
              )
            )}
          </div>

          {isOwned && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">Privacy</span>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setShowPrivacyInfoTooltip(true)}
                        onMouseLeave={() => setShowPrivacyInfoTooltip(false)}
                        onClick={() => setShowPrivacyInfoTooltip(!showPrivacyInfoTooltip)}
                        className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      {showPrivacyInfoTooltip && (
                        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded z-50 pointer-events-none min-w-[200px] sm:min-w-[250px] max-w-[280px] sm:max-w-[320px]">
                          {property.is_public === 1 
                            ? 'Public properties can be viewed by anyone and shared via link. Private properties are only visible to you.' 
                            : 'Private properties are only visible to you. Make it public to allow others to view and share it.'}
                          <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                    {property.is_public === 1 
                      ? 'This property is visible to everyone' 
                      : 'This property is only visible to you'}
                  </p>
                </div>
                <button
                  onClick={() => onTogglePublic?.(property.id, property.is_public === 0)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    property.is_public === 1 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label={property.is_public === 1 ? 'Make private' : 'Make public'}
                >
                  <div className="flex items-center gap-1">
                    {property.is_public === 1 ? (
                      <>
                        <Globe className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Only me</span>
                      </>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {isOwned && property.note_private && (
            <div className="pt-2 sm:pt-2 border-t border-gray-200">
              <h3 className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                Note{' '}
                <span 
                  className="relative inline-flex items-center border-b border-dotted border-gray-400 cursor-help pb-0.5" 
                  style={{ borderBottomWidth: '1px' }}
                  onMouseEnter={() => setShowNoteTooltip(true)}
                  onMouseLeave={() => setShowNoteTooltip(false)}
                >
                  <Lock className="w-3 h-3 text-gray-400" />
                  {showNoteTooltip && (
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded z-50 pointer-events-none min-w-[200px] sm:min-w-[250px] max-w-[280px] sm:max-w-[320px]">
                      This note is visible only to you even if you share the property to public
                      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </span>
              </h3>
              <p className="text-sm sm:text-base font-semibold text-gray-900 leading-relaxed">
                {property.note_private}
              </p>
            </div>
          )}

          {isOwned && selectedTags.length > 0 && (
            <div className="pt-1">
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => setShowTagModal(true)}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

     <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Share</p>
                  <div className={`grid gap-2 sm:gap-3 ${hasLocation ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <button
                      onClick={handleCopy}
                      className="px-2 sm:px-3 py-2 sm:py-3 flex items-center justify-center gap-1 sm:gap-1.5 bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    {hasLocation && (
                      <button
                        onClick={handleCopyLocation}
                        className="px-2 sm:px-3 py-2 sm:py-3 flex items-center justify-center gap-1 sm:gap-1.5 bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                        title="Copy location coordinates"
                      >
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{copiedLocation ? 'Copied' : 'Location'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onShare?.(property);
                        onClose();
                      }}
                      className="px-2 sm:px-3 py-2 sm:py-3 flex items-center justify-center gap-1 sm:gap-1.5 bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </div>
                </div>
          <div className="pt-4 sm:pt-6 border-t border-gray-200 space-y-2 sm:space-y-3">
            {isOwned ? (
              <>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      if (confirm('Delete this property?')) {
                        onDelete?.(property.id);
                      }
                    }}
                    className="px-2 sm:px-3 py-2 sm:py-3 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200 flex-shrink-0"
                    title="Delete property"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => onEdit?.(property)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowTagModal(true)}
                    className="px-2 sm:px-3 py-2 sm:py-3 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
                    title={selectedTags.length > 0 ? "Manage tags" : "Add tags"}
                  >
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onAskQuestion?.(property);
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Ask a Question
                </button>
              
              </>
            )}
          </div>
        </div>
      </div>

      {showHighlightModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 mobile-modal-container">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md mobile-modal-content sm:max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Select Highlights</h3>
              <button
                onClick={() => setShowHighlightModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <input
                type="text"
                placeholder="Add custom highlights"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    toggleHighlight(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
              />

              <div className="flex flex-wrap gap-2">
                {HIGHLIGHT_OPTIONS_WITH_ICONS.map((highlight) => {
                  const Icon = highlight.icon;
                  return (
                    <button
                      key={highlight.text}
                      type="button"
                      onClick={() => toggleHighlight(highlight.text)}
                      className={`px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2 ${
                        selectedHighlights.includes(highlight.text)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {highlight.text}
                    </button>
                  );
                })}
              </div>

              {selectedHighlights.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Selected</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedHighlights.map((highlight) => {
                      const Icon = getHighlightIcon(highlight);
                      return (
                        <span
                          key={highlight}
                          className={`px-3 py-1.5 ${highlightStyles.bgColor} ${highlightStyles.textColor} rounded-lg text-sm font-medium flex items-center gap-2`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {highlight}
                          <button
                            type="button"
                            onClick={() => toggleHighlight(highlight)}
                            className={`hover:opacity-80 rounded-full p-0.5`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSaveHighlights}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowHighlightModal(false)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTagModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 mobile-modal-container">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md mobile-modal-content sm:max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Select Tags</h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <input
                type="text"
                placeholder="Add custom tags"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    toggleTag(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
              />

              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-xl transition-colors text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {selectedTags.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Selected</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="hover:bg-blue-100 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSaveTags}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowTagModal(false)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLocationModal && (
        <LocationModal
          property={property}
          onClose={() => setShowLocationModal(false)}
          onSave={(location, locationAccuracy) => {
            if (onUpdateLocation) {
              onUpdateLocation(property.id, location, locationAccuracy);
            }
            setShowLocationModal(false);
          }}
        />
      )}

      {showLocationViewModal && locationCoords && (
        <LocationViewModal
          propertyLocation={locationCoords}
          property={property}
          onClose={() => setShowLocationViewModal(false)}
          onOpenInGoogleMaps={handleOpenInGoogleMaps}
        />
      )}
    </div>
  );
}

// Location Modal Component
interface LocationModalProps {
  property: Property;
  onClose: () => void;
  onSave: (location: string, locationAccuracy: string) => void;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

// Component to update map center
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Component to handle tile layer switching
function TileLayerSwitcher({ isSatelliteView }: { isSatelliteView: boolean }) {
  // Use key prop to force remount when switching views for smoother transition
  return isSatelliteView ? (
    <TileLayer
      key="satellite"
      attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.esri.com/en-us/legal/terms/full-master-agreement">Esri Terms of Use</a>'
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      maxZoom={19}
    />
  ) : (
    <TileLayer
      key="map"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
    />
  );
}

// Geocode city name to coordinates using CORS proxy
async function geocodeCity(cityName: string): Promise<[number, number] | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName + ', Haryana, India')}&limit=1`;
    
    // Try CORS proxy services
    const proxyServices = [
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];
    
    for (const getProxyUrl of proxyServices) {
      try {
        const proxyUrl = getProxyUrl(url);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(proxyUrl, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
          if (jsonData && jsonData.length > 0) {
            return [parseFloat(jsonData[0].lat), parseFloat(jsonData[0].lon)];
          }
        }
      } catch (error) {
        continue; // Try next proxy
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

// Search for places using multiple CORS proxy services as fallback
async function searchPlaces(query: string): Promise<Array<{ display_name: string; lat: string; lon: string }>> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const searchQuery = query.trim();
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', India')}&limit=5&addressdetails=1`;
    
    // List of CORS proxy services to try (in order of preference)
    const proxyServices = [
      // Service 1: allorigins.win (reliable, free)
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      // Service 2: corsproxy.io (backup)
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      // Service 3: cors-anywhere (may require setup, but trying anyway)
      (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
    ];
    
    // Try each proxy service
    for (const getProxyUrl of proxyServices) {
      try {
        const proxyUrl = getProxyUrl(nominatimUrl);
        console.log('Trying proxy:', proxyUrl.substring(0, 50) + '...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          
          // Handle case where proxy returns wrapped response
          const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
          
          if (Array.isArray(jsonData)) {
            const results = jsonData.map((item: any) => ({
              display_name: item.display_name || item.name || `${item.lat}, ${item.lon}`,
              lat: item.lat?.toString() || '',
              lon: item.lon?.toString() || '',
            })).filter((item: any) => item.lat && item.lon && item.display_name);
            
            if (results.length > 0) {
              console.log('Search successful with proxy, found', results.length, 'results');
              return results;
            }
          }
        } else {
          console.log('Proxy returned error:', response.status, response.statusText);
        }
      } catch (proxyError: any) {
        if (proxyError.name === 'AbortError') {
          console.log('Request timed out, trying next proxy...');
        } else {
          console.log('Proxy failed:', proxyError.message);
        }
        // Continue to next proxy
        continue;
      }
    }
    
    console.warn('All proxy services failed. Search is not available due to CORS restrictions.');
    return [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Extract coordinates from various URL formats
function extractCoordsFromUrl(url: string): [number, number] | null {
  try {
    // Try to extract from Google Maps long URL patterns
    // Pattern 1: @lat,lng or @lat,lng,z
    const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const atMatch = url.match(atPattern);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [lat, lng];
      }
    }

    // Pattern 2: ?q=lat,lng or ?q=lat+lng
    const qPattern = /[?&]q=(-?\d+\.?\d*)[,+](-?\d+\.?\d*)/;
    const qMatch = url.match(qPattern);
    if (qMatch) {
      const lat = parseFloat(qMatch[1]);
      const lng = parseFloat(qMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [lat, lng];
      }
    }

    // Pattern 3: ll=lat,lng
    const llPattern = /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const llMatch = url.match(llPattern);
    if (llMatch) {
      const lat = parseFloat(llMatch[1]);
      const lng = parseFloat(llMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [lat, lng];
      }
    }

    // Pattern 4: center=lat,lng
    const centerPattern = /[?&]center=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const centerMatch = url.match(centerPattern);
    if (centerMatch) {
      const lat = parseFloat(centerMatch[1]);
      const lng = parseFloat(centerMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [lat, lng];
      }
    }

    // Pattern 5: /@lat,lng or /lat,lng
    const slashPattern = /\/([-]?\d+\.?\d*),([-]?\d+\.?\d*)/;
    const slashMatch = url.match(slashPattern);
    if (slashMatch) {
      const lat = parseFloat(slashMatch[1]);
      const lng = parseFloat(slashMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [lat, lng];
      }
    }
  } catch (error) {
    console.error('Error extracting coordinates from URL:', error);
  }
  return null;
}

// Resolve short Google Maps URL and extract coordinates
async function resolveGoogleMapsUrl(shortUrl: string): Promise<[number, number] | null> {
  try {
    // First, try to extract coordinates directly from URL (works for long URLs)
    const directCoords = extractCoordsFromUrl(shortUrl);
    if (directCoords) {
      return directCoords;
    }

    // For short URLs (maps.app.goo.gl or goo.gl), we need to resolve them
    // However, due to CORS, we can't easily do this from the browser
    // We'll try using a CORS proxy, but this may not always work
    try {
      // Try to fetch with redirect following
      // Some browsers will follow redirects and give us the final URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(shortUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Try to extract from the final URL
      const finalUrl = response.url || shortUrl;
      const urlCoords = extractCoordsFromUrl(finalUrl);
      if (urlCoords) {
        return urlCoords;
      }

      // If URL doesn't have coordinates, try to extract from HTML
      // This works if the server allows it (may be blocked by CORS)
      try {
        const html = await response.text();
        const htmlCoords = extractCoordsFromUrl(html);
        if (htmlCoords) {
          return htmlCoords;
        }
      } catch (htmlError) {
        // Can't read HTML, that's okay
        console.log('Could not read HTML response');
      }
    } catch (fetchError: any) {
      // CORS or network error - this is expected for cross-origin requests
      if (fetchError.name === 'AbortError') {
        console.log('Request timed out');
      } else {
        console.log('Could not resolve short URL. Please use the full Google Maps URL with coordinates, or paste coordinates directly.');
      }
    }
  } catch (error) {
    console.error('Error resolving Google Maps URL:', error);
  }
  return null;
}

// Parse input to determine if it's a URL, lat/long, or search query
async function parseLocationInput(input: string): Promise<[number, number] | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Check if it's a lat/long pair
  const latLongPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
  if (latLongPattern.test(trimmed)) {
    const parts = trimmed.split(',').map(c => parseFloat(c.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const lat = parts[0];
      const lng = parts[1];
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [lat, lng];
      }
    }
  }

  // Check if it's a URL
  try {
    const url = new URL(trimmed);
    // Check if it's a Google Maps URL
    if (url.hostname.includes('google.com') || url.hostname.includes('maps.app.goo.gl') || url.hostname.includes('goo.gl')) {
      const coords = await resolveGoogleMapsUrl(trimmed);
      if (coords) {
        return coords;
      }
    } else {
      // Try to extract coordinates from any URL
      const coords = extractCoordsFromUrl(trimmed);
      if (coords) {
        return coords;
      }
    }
  } catch (e) {
    // Not a valid URL, treat as search query
  }

  // If it's not a URL or coordinates, treat as search query and geocode it
  const searchResults = await searchPlaces(trimmed);
  if (searchResults && searchResults.length > 0) {
    const firstResult = searchResults[0];
    return [parseFloat(firstResult.lat), parseFloat(firstResult.lon)];
  }

  return null;
}

function LocationModal({ property, onClose, onSave }: LocationModalProps) {
  const { user } = useAuth();
  
  // Lock body scroll when modal is open (nested modal, so this increments the counter)
  useEffect(() => {
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, []);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(() => {
    // Check if property has location coordinates
    const hasCoords = /^-?\d+\.?\d*,-?\d+\.?\d*$/.test((property.location || '').trim());
    if (hasCoords) {
      const parts = property.location.split(',').map(c => parseFloat(c.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return [parts[0], parts[1]];
      }
    }
    return null;
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([29.3909, 76.9635]); // Default: Panipat
  const [isLoadingCity, setIsLoadingCity] = useState(true);
  const [radius, setRadius] = useState(() => {
    return property.location_accuracy ? parseFloat(property.location_accuracy) || 0 : 0;
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  // Load saved map view preference from localStorage, default to map view
  const [isSatelliteView, setIsSatelliteView] = useState(() => {
    const saved = localStorage.getItem('mapViewPreference');
    return saved === 'satellite';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been attempted
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize map center based on user's default city or property city
  useEffect(() => {
    const initializeMapCenter = async () => {
      setIsLoadingCity(true);
      const cityName = user?.default_city || property.city || 'Panipat';
      
      // Check if property already has location
      const hasCoords = /^-?\d+\.?\d*,-?\d+\.?\d*$/.test((property.location || '').trim());
      if (hasCoords) {
        const parts = property.location.split(',').map(c => parseFloat(c.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          setMapCenter([parts[0], parts[1]]);
          // selectedPosition is already set in the useState initializer
          setIsLoadingCity(false);
          return;
        }
      }
      
      // Center map on city but don't select a location by default
      // User must explicitly click on the map or search for a location
      const coords = await geocodeCity(cityName);
      if (coords) {
        setMapCenter(coords);
      } else {
        // Fallback to default coordinates (Panipat) for map center only
        const defaultCoords: [number, number] = [29.3909, 76.9635];
        setMapCenter(defaultCoords);
      }
      // Don't set selectedPosition - let user select it explicitly
      setIsLoadingCity(false);
    };

    initializeMapCenter();
  }, [user?.default_city, property.city, property.location]); // Run when user or property changes

  // Update state when property changes
  useEffect(() => {
    const hasCoords = /^-?\d+\.?\d*,-?\d+\.?\d*$/.test((property.location || '').trim());
    if (hasCoords) {
      const parts = property.location.split(',').map(c => parseFloat(c.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setSelectedPosition([parts[0], parts[1]]);
      }
    }
    setRadius(property.location_accuracy ? parseFloat(property.location_accuracy) || 0 : 0);
  }, [property.location, property.location_accuracy]);

  // Handle search input with debouncing
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // If query is too short, clear suggestions
    if (searchQuery.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    // Set loading state
    setIsSearching(true);
    setShowSuggestions(false);

    // Debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(searchQuery);
        console.log('Search results:', results); // Debug log
        setSearchSuggestions(results);
        setShowSuggestions(results.length > 0);
        setHasSearched(true); // Mark that we've completed a search
      } catch (error) {
        console.error('Search error in useEffect:', error);
        setSearchSuggestions([]);
        setShowSuggestions(false);
        setHasSearched(true); // Mark that we've completed a search (even if it failed)
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce - increased for better performance

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [searchQuery]);

  // Handle search query change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle search submission (when user presses Enter or clicks search)
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const coords = await parseLocationInput(searchQuery);
      if (coords) {
        setSelectedPosition(coords);
        setMapCenter(coords);
        setSearchQuery(''); // Clear search after successful search
      } else {
        alert('Location not found. Please try a different search term or enter coordinates directly.');
      }
    } catch (error) {
      console.error('Search submit error:', error);
      alert('Error searching for location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setSelectedPosition([lat, lng]);
    setMapCenter([lat, lng]);
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
  };

  // Handle clicking outside suggestions to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Radius steps: 0, 20, 50, 100, 200, 300, 500, 700, 900, 1100, 1300, 1500, 2000, 5000, 10000, 25000
  const radiusSteps = [0, 20, 50, 100, 200, 300, 500, 700, 900, 1100, 1300, 1500, 2000, 5000, 10000, 25000];
  
  // Find the closest radius step
  const getClosestRadiusStep = (value: number): number => {
    return radiusSteps.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };

  // Handle radius change with custom steps
  const handleRadiusChange = (value: number) => {
    const closestStep = getClosestRadiusStep(value);
    setRadius(closestStep);
  };

  // Format radius for display
  const formatRadius = (value: number): string => {
    if (value === 0) return '0 m';
    if (value < 1000) return `${value} m`;
    return `${(value / 1000).toFixed(1)} km`;
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
  };


  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setSelectedPosition([lat, lng]);
        setMapCenter([lat, lng]);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Failed to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSave = () => {
    if (!selectedPosition) {
      alert('Please select a location on the map or search for a place');
      return;
    }

    // Use selectedPosition directly to create the location string
    const locationString = `${selectedPosition[0].toFixed(6)},${selectedPosition[1].toFixed(6)}`;
    onSave(locationString, radius.toString());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 mobile-modal-container">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl mobile-modal-content sm:max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {hasLocationCoordinates(property.location) ? 'Edit Location' : 'Add Location'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Search Section - First field above map */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Location
            </label>
            <div className="relative" ref={searchInputRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  onPaste={async (e) => {
                    const pastedText = e.clipboardData.getData('text');
                    // If it looks like a URL or coordinates, process it immediately
                    if (pastedText.includes('http') || /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(pastedText.trim())) {
                      e.preventDefault();
                      setSearchQuery(pastedText);
                      // Process immediately without waiting for debounce
                      setIsSearching(true);
                      setShowSuggestions(false);
                      try {
                        const coords = await parseLocationInput(pastedText);
                        if (coords) {
                          setSelectedPosition(coords);
                          setMapCenter(coords);
                          setSearchQuery(''); // Clear search after successful search
                        } else {
                          // If it's a URL but we couldn't extract coords, try showing it as search
                          setSearchQuery(pastedText);
                        }
                      } catch (error) {
                        console.error('Paste error:', error);
                        setSearchQuery(pastedText);
                      } finally {
                        setIsSearching(false);
                      }
                    }
                  }}
                  placeholder="Search for a place, paste coordinates (lat,long), or paste a Google Maps URL"
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {/* Suggestions dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}-${suggestion.lat}-${suggestion.lon}`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionSelect(suggestion);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{suggestion.display_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {/* Show message when searching */}
              {isSearching && searchQuery.trim().length >= 2 && !showSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Searching...</span>
                  </div>
                </div>
              )}
              {/* Show message when no results found after search completes */}
              {!isSearching && hasSearched && searchQuery.trim().length >= 2 && searchSuggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">No results found for "{searchQuery}"</div>
                  <div className="text-xs text-gray-400">Try clicking on the map or pasting coordinates directly (e.g., 28.7041,77.1025)</div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Search for places, paste coordinates (e.g., 28.7041,77.1025), or paste Google Maps URLs. 
              If search doesn't work, click on the map to select location directly.
            </p>
          </div>

          {/* Map Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Click on the map to select location
            </label>
            <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-gray-300">
              {isLoadingCity ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading map...</p>
                  </div>
                </div>
              ) : (
                <>
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    className="h-full w-full"
                    scrollWheelZoom={true}
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    <MapCenterUpdater center={mapCenter} />
                    <TileLayerSwitcher isSatelliteView={isSatelliteView} />
                    <MapClickHandler onMapClick={handleMapClick} />
                    {selectedPosition && (
                      <>
                        {/* Location Accuracy Radius Circle - Only show if radius > 0 */}
                        {radius > 0 && (
                          <Circle
                            center={selectedPosition}
                            radius={radius}
                            pathOptions={{
                              color: '#3b82f6',
                              fillColor: '#3b82f6',
                              fillOpacity: 0.1,
                              weight: 2,
                              opacity: 0.5,
                            }}
                          />
                        )}
                        <Marker position={selectedPosition}>
                          <Popup>
                            Selected Location<br />
                            {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                            <br />
                            Accuracy: {formatRadius(radius)}
                          </Popup>
                        </Marker>
                      </>
                    )}
                  </MapContainer>
                  
                  {/* Map Control Buttons Container */}
                  <div className="absolute inset-0 pointer-events-none z-[2]">
                    {/* Satellite View Toggle Button - Top Right */}
                    <button
                      type="button"
                      onClick={() => {
                        const newView = !isSatelliteView;
                        setIsSatelliteView(newView);
                        // Save preference immediately
                        localStorage.setItem('mapViewPreference', newView ? 'satellite' : 'map');
                      }}
                      className={`absolute top-2 right-2 pointer-events-auto flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg shadow-lg transition-colors ${
                        isSatelliteView
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                      title={isSatelliteView ? 'Switch to Map View' : 'Switch to Satellite View'}
                    >
                      <Satellite 
                        className="w-4 h-4 flex-shrink-0" 
                        strokeWidth={2.5}
                      />
                      <span className="hidden sm:inline">{isSatelliteView ? 'Satellite' : 'Map'}</span>
                    </button>

                    {/* Current Location Button - Bottom Right */}
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isGettingLocation}
                      className="absolute bottom-2 right-2 pointer-events-auto flex items-center justify-center w-10 h-10 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                      title="Get Current Location"
                    >
                      <Navigation 
                        className={`w-5 h-5 flex-shrink-0 ${isGettingLocation ? 'animate-spin' : ''}`} 
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {selectedPosition ? (
                <>Selected Location: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}</>
              ) : (
                <>Click anywhere on the map to set the location. The map is centered on {user?.default_city || property.city || 'Panipat'}.</>
              )}
            </p>
          </div>

          {/* Radius Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location Accuracy Radius: {formatRadius(radius)}
            </label>
            <input
              type="range"
              min="0"
              max="25000"
              step="1"
              value={radius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1 flex-wrap gap-1">
              <span>0 m</span>
              <span>100 m</span>
              <span>500 m</span>
              <span>1.5 km</span>
              <span>2 km</span>
              <span>10 km</span>
              <span>25 km</span>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              This radius indicates the accuracy of the location. A smaller radius means more precise location. Steps: 0, 20, 50, 100, 200, 300, 500, 700, 900, 1100, 1300, 1500, 2 km, 5 km, 10 km, 25 km
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Location View Modal Component - Shows property location in map with satellite view
interface LocationViewModalProps {
  propertyLocation: { lat: number; lng: number };
  property: Property;
  onClose: () => void;
  onOpenInGoogleMaps: () => void;
}

// Component to update map bounds to show both property and user location
function MapBoundsUpdater({ propertyLocation, userLocation, hasUserLocation, isInitialLoad }: { propertyLocation: [number, number]; userLocation: [number, number] | null; hasUserLocation: boolean; isInitialLoad: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate map size multiple times to ensure it renders correctly in modal
    const invalidateSize = () => {
      try {
        map.invalidateSize();
      } catch (e) {
        console.log('Map invalidateSize error:', e);
      }
    };

    // Initial invalidation
    invalidateSize();
    
    // Multiple invalidations to handle modal animation
    const timers = [
      setTimeout(invalidateSize, 100),
      setTimeout(invalidateSize, 300),
      setTimeout(invalidateSize, 500),
    ];
    
    // Only update bounds on initial load
    if (isInitialLoad) {
      const updateBounds = () => {
        try {
          if (hasUserLocation && userLocation) {
            // Create bounds that include both locations
            const bounds = L.latLngBounds([propertyLocation, userLocation]);
            map.fitBounds(bounds, { padding: [50, 50] });
          } else {
            // Just center on property location
            map.setView(propertyLocation, 15);
          }
          invalidateSize();
        } catch (e) {
          console.log('Map bounds update error:', e);
        }
      };
      
      setTimeout(updateBounds, 400);
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [propertyLocation, userLocation, hasUserLocation, isInitialLoad, map]);
  
  return null;
}

function LocationViewModal({ propertyLocation, property, onClose, onOpenInGoogleMaps }: LocationViewModalProps) {
  // Load saved map view preference from localStorage, default to map view (false = map, true = satellite)
  const [isSatelliteView, setIsSatelliteView] = useState(() => {
    const saved = localStorage.getItem('mapViewPreference');
    return saved === 'satellite';
  });
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const mapCenter: [number, number] = userLocation 
    ? [(propertyLocation.lat + userLocation[0]) / 2, (propertyLocation.lng + userLocation[1]) / 2]
    : [propertyLocation.lat, propertyLocation.lng];

  // Save view preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mapViewPreference', isSatelliteView ? 'satellite' : 'map');
  }, [isSatelliteView]);

  // Lock body scroll when modal is open
  useEffect(() => {
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, []);

  // Invalidate map size when modal becomes visible (important for Leaflet in modals)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Find the map container and invalidate its size
      const mapElements = document.querySelectorAll('.leaflet-container');
      mapElements.forEach((element) => {
        const leafletElement = element as any;
        if (leafletElement._leaflet_id) {
          // Get the map instance from Leaflet's internal registry
          const allMaps = (L as any).map._instances || {};
          const mapInstance = Object.values(allMaps).find((map: any) => 
            map.getContainer() === element
          ) as any;
          if (mapInstance) {
            mapInstance.invalidateSize();
          }
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Get user's current location (non-blocking - map will render immediately)
  useEffect(() => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      setIsGettingLocation(false);
      setIsInitialLoad(false);
      return;
    }

    // Set timeout to mark as not getting location after initial delay
    const timeoutId = setTimeout(() => {
      setIsGettingLocation(false);
    }, 2000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);
        setIsGettingLocation(false);
        // Wait a bit before marking initial load as complete to allow map to fit bounds
        setTimeout(() => setIsInitialLoad(false), 500);
      },
      (error) => {
        clearTimeout(timeoutId);
        setIsGettingLocation(false);
        setIsInitialLoad(false);
        // Silently fail - user location is optional
        console.log('Could not get user location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => clearTimeout(timeoutId);
  }, []);


  // Create custom icons for markers
  const propertyIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Create a blue circle marker icon for user location
  const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #3b82f6;
      border: 4px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 mobile-modal-container">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-4xl mobile-modal-content sm:max-h-[90vh] h-[90vh] sm:h-auto overflow-hidden flex flex-col animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapIcon className="w-5 h-5" />
            Property Location
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 relative overflow-hidden" style={{ minHeight: '400px' }}>
          <div className="w-full h-full relative" style={{ height: '100%', minHeight: '400px' }}>
            {/* Loading overlay - shows while getting location but map renders underneath */}
            {isGettingLocation && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Getting your location...</p>
                </div>
              </div>
            )}
            
            <MapContainer
              center={mapCenter}
              zoom={userLocation ? 13 : 15}
              className="h-full w-full"
              scrollWheelZoom={true}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, height: '100%', width: '100%' }}
            >
                <MapBoundsUpdater 
                  propertyLocation={[propertyLocation.lat, propertyLocation.lng]} 
                  userLocation={userLocation}
                  hasUserLocation={!!userLocation}
                  isInitialLoad={isInitialLoad}
                />
                <TileLayerSwitcher isSatelliteView={isSatelliteView} />
                
                {/* Property Location Radius Circle */}
                {property.location_accuracy && (
                  <Circle
                    center={[propertyLocation.lat, propertyLocation.lng]}
                    radius={parseFloat(property.location_accuracy) || 500}
                    pathOptions={{
                      color: '#3b82f6',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.1,
                      weight: 2,
                      opacity: 0.5,
                    }}
                  />
                )}
                
                {/* Property Location Marker */}
                <Marker 
                  position={[propertyLocation.lat, propertyLocation.lng]}
                  icon={propertyIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-sm mb-1">{property.type} #{property.id}</h3>
                      <p className="text-xs text-gray-600 mb-1">
                        {property.area}, {property.city}
                      </p>
                      <p className="text-xs text-gray-500">
                        {propertyLocation.lat.toFixed(6)}, {propertyLocation.lng.toFixed(6)}
                      </p>
                      {property.location_accuracy && (
                        <p className="text-xs text-blue-600 mt-1">
                          Accuracy: {property.location_accuracy}m
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>

                {/* User Location Marker */}
                {userLocation && (
                  <Marker 
                    position={userLocation}
                    icon={userIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm mb-1">Your Location</h3>
                        <p className="text-xs text-gray-500">
                          {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}
            </MapContainer>
            
            {/* Map Control Buttons Container */}
            <div className="absolute inset-0 pointer-events-none z-[10]" style={{ pointerEvents: 'none' }}>
              {/* Satellite View Toggle Button - Top Right */}
              <button
                type="button"
                onClick={() => {
                  const newView = !isSatelliteView;
                  setIsSatelliteView(newView);
                  // Save preference immediately
                  localStorage.setItem('mapViewPreference', newView ? 'satellite' : 'map');
                  // Invalidate map size after view change
                  setTimeout(() => {
                    const mapElement = document.querySelector('.leaflet-container') as any;
                    if (mapElement && mapElement._leaflet_id) {
                      const mapInstance = (window as any).L?.maps?.[mapElement._leaflet_id];
                      if (mapInstance) {
                        mapInstance.invalidateSize();
                      }
                    }
                  }, 100);
                }}
                className={`absolute top-2 right-2 pointer-events-auto flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg shadow-lg transition-colors ${
                  isSatelliteView
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
                title={isSatelliteView ? 'Switch to Map View' : 'Switch to Satellite View'}
              >
                <Satellite 
                  className="w-4 h-4 flex-shrink-0" 
                  strokeWidth={2.5}
                />
                <span className="hidden sm:inline">{isSatelliteView ? 'Satellite' : 'Map'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full Width Button to Open in Google Maps */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-white">
          <button
            onClick={onOpenInGoogleMaps}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            <MapIcon className="w-5 h-5" />
            Open in Google Maps
          </button>
        </div>
      </div>
    </div>
  );
}
