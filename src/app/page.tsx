import Link from 'next/link';
import { 
  Leaf, 
  Users, 
  Wrench, 
  ClipboardList,
  ArrowRight,
  Smartphone,
  Wifi,
  Shield
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Mwembeshi Farm
            </span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link 
              href="/dashboard"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Simple Farm Management for{' '}
            <span className="text-green-600">Zambian Farmers</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Track your livestock, manage crops, coordinate workers, and maintain equipment - 
            all in one easy-to-use application designed for farms in Mwembeshi and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="#features"
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Everything You Need to Manage Your Farm
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Livestock */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🐐</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Livestock Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track goats, cows, sheep, and chickens. Record births, treatments, 
              breeding history, and production data.
            </p>
          </div>

          {/* Crops */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Crop Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Plan and monitor tomatoes, onions, maize, and more. Track planting, 
              inputs, activities, and harvests.
            </p>
          </div>

          {/* Workers */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Worker Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Record attendance, assign tasks, and manage payroll for permanent, 
              casual, and seasonal workers.
            </p>
          </div>

          {/* Equipment */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Equipment Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Maintain inventory of tools and machinery. Schedule maintenance 
              and track usage records.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-green-600 dark:bg-green-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Built for Zambian Farms
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mobile-First</h3>
              <p className="text-green-100">
                Works perfectly on phones. Install as an app for quick access in the field.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Works Offline</h3>
              <p className="text-green-100">
                Continue working without internet. Data syncs automatically when connected.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure & Simple</h3>
              <p className="text-green-100">
                Your data is protected. Simple interface anyone can learn quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Start managing your farm more efficiently today. No complicated setup required.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg"
          >
            <ClipboardList className="w-5 h-5" />
            Open Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 Mwembeshi Farm Management System</p>
          <p className="text-sm mt-2">Built for farmers in Zambia 🇿🇲</p>
        </div>
      </footer>
    </div>
  );
}
