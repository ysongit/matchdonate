import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Checkbox } from 'antd';
import { HeartIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { DonationModal } from './_components';

interface Charity {
  id: string;
  name: string;
  description: string;
  location: string;
  logoUrl: string;
  logoBackground: string;
  isFavorite: boolean;
}

interface DropdownState {
  [key: string]: boolean;
}

const Donation: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<DropdownState>({});
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [charities, setCharities] = useState<Charity[]>([
    {
      id: '1',
      name: 'Amnesty International USA INC',
      description:
        'Amnesty International is a global movement of ordinary people committed to an extraordinary mission: to mobilize millions of...',
      location: 'New York, NY, United States',
      logoUrl: '',
      logoBackground: '#FFEB3B',
      isFavorite: false,
    },
    {
      id: '2',
      name: 'Amnesty International USA INC',
      description:
        'Amnesty International is a global movement of ordinary people committed to an extraordinary mission: to mobilize millions of...',
      location: 'New York, NY, United States',
      logoUrl: '',
      logoBackground: '#FFEB3B',
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Red Cross International',
      description:
        'The International Red Cross provides humanitarian aid and disaster relief to communities worldwide, supporting those in need...',
      location: 'Washington, DC, United States',
      logoUrl: '',
      logoBackground: '#FF5252',
      isFavorite: false,
    },
    {
      id: '4',
      name: 'UNICEF Foundation',
      description:
        'UNICEF works in over 190 countries and territories to save children\'s lives, defend their rights, and help them fulfill their potential...',
      location: 'London, United Kingdom',
      logoUrl: '',
      logoBackground: '#29B6F6',
      isFavorite: false,
    },
  ]);

  const countries = ['United States', 'United Kingdom'];
  const categories = ['Arts, Cultures, and humanities', 'United Kingdom', 'Education', 'Health', 'Environment'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = Object.keys(dropdownRefs.current).every((key) => {
        const ref = dropdownRefs.current[key];
        return !ref || !ref.contains(event.target as Node);
      });
      if (isOutside) {
        setOpenDropdown({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFavorite = (id: string) => {
    setCharities((prev) =>
      prev.map((charity) =>
        charity.id === id ? { ...charity, isFavorite: !charity.isFavorite } : charity
      )
    );
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleDonateClick = (charity: Charity) => {
    setSelectedCharity(charity);
    setIsDonationModalOpen(true);
    setOpenDropdown({});
  };

  const filteredCharities = charities.filter((charity) => {
    const matchesSearch =
      searchValue === '' ||
      charity.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      charity.location.toLowerCase().includes(searchValue.toLowerCase());

    const matchesCountry =
      selectedCountries.length === 0 ||
      selectedCountries.some((country) => charity.location.includes(country));

    return matchesSearch && matchesCountry;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Donate</h1>
        <Button
          size="large"
          className="rounded-full border-gray-300 hover:border-purple-400 font-medium"
          style={{ borderRadius: '24px' }}
        >
          My Favorites
        </Button>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        <div
          className="bg-white rounded-2xl p-6 md:p-8"
          style={{
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Keyword, Location, Charity Name, or EIN"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 h-12 rounded-full border-gray-200"
              style={{ borderRadius: '24px' }}
            />
            <Button
              type="primary"
              size="large"
              className="h-12 px-10 rounded-full font-semibold"
              style={{
                background: 'linear-gradient(135deg, #e879a8 0%, #d4a5ff 100%)',
                border: 'none',
                borderRadius: '24px',
              }}
            >
              Search
            </Button>
          </div>

          {/* Content Grid */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar */}
            <div
              className="w-full lg:w-64 flex-shrink-0 border border-gray-200 rounded-lg p-4"
              style={{ minHeight: '400px' }}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">Filter</h2>

              {/* Country/Location Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Country/Location</h3>
                <div className="space-y-2">
                  {countries.map((country) => (
                    <div key={country} className="flex items-center">
                      <Checkbox
                        checked={selectedCountries.includes(country)}
                        onChange={() => handleCountryChange(country)}
                        className="custom-checkbox"
                      >
                        <span className="text-sm text-gray-600">{country}</span>
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-2">Select</p>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="custom-checkbox"
                        >
                          <span className="text-sm text-gray-600">{category}</span>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Charity Cards Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCharities.map((charity) => (
                  <div
                    key={charity.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    style={{
                      border: '1px dashed #d1d5db',
                      borderRadius: '12px',
                    }}
                  >
                    {/* Logo Section */}
                    <div
                      className="relative h-32 flex items-center justify-center"
                      style={{ backgroundColor: charity.logoBackground }}
                    >
                      {/* Amnesty International Logo Placeholder */}
                      <div className="flex items-center gap-2">
                        <div className="text-purple-900 font-bold">
                          <div className="text-lg leading-tight">AMNESTY</div>
                          <div className="text-xs">INTERNATIONAL</div>
                        </div>
                        <div className="text-purple-900">
                          <svg
                            width="32"
                            height="40"
                            viewBox="0 0 32 40"
                            fill="currentColor"
                          >
                            <path d="M16 0C16 0 8 8 8 20C8 28 12 36 16 40C20 36 24 28 24 20C24 8 16 0 16 0ZM16 24C14 24 12 22 12 20C12 18 14 16 16 16C18 16 20 18 20 20C20 22 18 24 16 24Z" />
                          </svg>
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(charity.id)}
                        className="absolute top-3 right-3 p-1 hover:scale-110 transition-transform"
                      >
                        {charity.isFavorite ? (
                          <HeartSolidIcon className="w-6 h-6 text-red-500" />
                        ) : (
                          <HeartIcon className="w-6 h-6 text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-sm mb-2">{charity.name}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-3">
                        {charity.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{charity.location}</span>
                        <div
                          className="relative"
                          ref={(el) => (dropdownRefs.current[charity.id] = el)}
                        >
                          <button
                            onClick={() => toggleDropdown(charity.id)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <EllipsisHorizontalIcon className="w-5 h-5 text-purple-400" />
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdown[charity.id] && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10 min-w-[100px]">
                              <button className="w-full px-4 py-2 text-left text-sm text-white bg-purple-500 hover:bg-purple-600 transition-colors">
                                View
                              </button>
                              <button
                                onClick={() => handleDonateClick(charity)}
                                className="w-full px-4 py-2 text-left text-sm text-purple-500 hover:bg-gray-50 transition-colors"
                              >
                                Donate
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View More Button */}
              <div className="flex justify-center mt-8">
                <Button
                  type="primary"
                  size="large"
                  className="h-12 px-12 rounded-full font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #e879a8 0%, #d4a5ff 100%)',
                    border: 'none',
                    borderRadius: '24px',
                  }}
                >
                  View More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        nonprofitName={selectedCharity?.name || 'Nonprofit XYZ'}
      />

      {/* Custom Styles */}
      <style>{`
        .ant-input {
          border-radius: 24px !important;
        }
        
        .ant-input:hover,
        .ant-input:focus {
          border-color: #d4a5ff !important;
          box-shadow: 0 0 0 2px rgba(212, 165, 255, 0.1) !important;
        }
        
        .ant-checkbox-inner {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1.5px solid #d1d5db;
        }
        
        .ant-checkbox-checked .ant-checkbox-inner {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border-color: transparent;
        }
        
        .ant-checkbox-checked .ant-checkbox-inner::after {
          border-color: white;
        }
        
        .ant-checkbox-wrapper:hover .ant-checkbox-inner {
          border-color: #a855f7;
        }
        
        .ant-btn-primary:hover {
          opacity: 0.9;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .custom-checkbox .ant-checkbox + span {
          padding-left: 8px;
        }
      `}</style>
    </div>
  );
};

export default Donation;