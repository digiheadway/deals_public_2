import { Home, Search, Share2, Smartphone, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
  isAuthenticated?: boolean;
  onGoToLogin?: () => void;
  onGoToApp?: () => void;
}

export function HomePage({ onGetStarted, isAuthenticated = false, onGoToLogin, onGoToApp }: HomePageProps) {
  const features = [
    {
      icon: Home,
      title: 'Manage your listing easily',
      description: 'Add, edit, and organize your property listings with an intuitive interface designed for efficiency.',
    },
    {
      icon: Search,
      title: 'Find Properties listed by other fellows',
      description: 'Discover properties from other dealers in the network. Search and filter to find exactly what you need.',
    },
    {
      icon: Share2,
      title: 'Broadcast Properties to Whole Network',
      description: 'Share your properties with the entire dealer network instantly. Reach more potential buyers and partners.',
    },
    {
      icon: Smartphone,
      title: 'Access from Anywhere Quickly and easily',
      description: 'Access your listings and the network from any device, anywhere. Responsive design for desktop, tablet, and mobile.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-8 sm:pb-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Dealer Network
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12">
            Connect with fellow dealers, manage your listings, and grow your property business
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 sm:px-10 py-3 sm:py-4 bg-blue-600 text-white text-lg sm:text-xl font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            Start Using
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage and grow your property business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 sm:p-12 lg:p-16 text-center shadow-xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Join the Dealer Network today and start managing your properties more efficiently
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 sm:px-10 py-3 sm:py-4 bg-white text-blue-600 text-lg sm:text-xl font-semibold rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            Start Using
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

    </div>
  );
}

