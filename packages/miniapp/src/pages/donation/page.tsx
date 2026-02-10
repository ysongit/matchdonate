import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input, Button, Checkbox, Spin } from 'antd';
import { HeartIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useChainId, useConfig, useReadContract } from 'wagmi';
import { readContract } from "@wagmi/core";
import deployedContracts from "../../contracts/deployedContracts";
import { useWalletAddress } from "../../hooks/useWalletAddress";
import { DonationModal } from './_components';

interface FundDetails {
  value: string;
  label: string;
  isMatching: boolean;
}

interface ProPublicaOrg {
  ein: number;
  strein: string;
  name: string;
  sub_name: string;
  city: string;
  state: string;
  ntee_code: string;
  subseccd: number;
}

interface Charity {
  id: string;
  ein: string;
  name: string;
  description: string;
  location: string;
  category: string;
  nteeCode: string;
  logoBackground: string;
  isFavorite: boolean;
}

interface DropdownState {
  [key: string]: boolean;
}

// NTEE Major Group mapping (1-10) to human-readable labels
const NTEE_MAJOR_GROUPS: Record<number, string> = {
  1: 'Arts, Culture & Humanities',
  2: 'Education',
  3: 'Environment and Animals',
  4: 'Health',
  5: 'Human Services',
  6: 'International, Foreign Affairs',
  7: 'Public, Societal Benefit',
  8: 'Religion Related',
  9: 'Mutual/Membership Benefit',
  10: 'Unknown, Unclassified',
};

// Map NTEE letter prefix to major group ID
const NTEE_LETTER_TO_GROUP: Record<string, number> = {
  A: 1, // Arts, Culture & Humanities
  B: 2, // Education
  C: 3, D: 3, // Environment and Animals
  E: 4, F: 4, G: 4, H: 4, // Health
  I: 5, J: 5, K: 5, L: 5, M: 5, N: 5, O: 5, P: 5, // Human Services
  Q: 6, // International, Foreign Affairs
  R: 7, S: 7, T: 7, U: 7, V: 7, W: 7, // Public, Societal Benefit
  X: 8, // Religion Related
  Y: 9, // Mutual/Membership Benefit
  Z: 10, // Unknown
};

// Background colors for visual variety
const LOGO_BACKGROUNDS = [
  '#FFEB3B', '#FF5252', '#29B6F6', '#66BB6A', '#AB47BC',
  '#FF7043', '#26A69A', '#5C6BC0', '#EC407A', '#FFA726',
];

function getNteeCategory(nteeCode: string | null): string {
  if (!nteeCode || nteeCode.length === 0) return 'Unknown, Unclassified';
  const letter = nteeCode.charAt(0).toUpperCase();
  const groupId = NTEE_LETTER_TO_GROUP[letter];
  return groupId ? NTEE_MAJOR_GROUPS[groupId] : 'Unknown, Unclassified';
}

function getNteeMajorGroupId(nteeCode: string | null): number {
  if (!nteeCode || nteeCode.length === 0) return 10;
  const letter = nteeCode.charAt(0).toUpperCase();
  return NTEE_LETTER_TO_GROUP[letter] ?? 10;
}

function mapOrgToCharity(org: ProPublicaOrg, index: number): Charity {
  const location = [org.city, org.state].filter(Boolean).join(', ');
  return {
    id: String(org.ein),
    ein: org.strein || String(org.ein),
    name: org.name || 'Unknown Organization',
    description: org.sub_name || '',
    location: location || 'United States',
    category: getNteeCategory(org.ntee_code),
    nteeCode: org.ntee_code || '',
    logoBackground: LOGO_BACKGROUNDS[index % LOGO_BACKGROUNDS.length],
    isFavorite: false,
  };
}

const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

const Donation: React.FC = () => {
  const chainId = useChainId();
  const config = useConfig();
  const { address } = useWalletAddress();

  const contracts = deployedContracts[chainId as keyof typeof deployedContracts];

  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [openDropdown, setOpenDropdown] = useState<DropdownState>({});
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [bespokeFundsDetails, setBespokeFundsDetails] = useState<FundDetails[]>([]);
  const [matchingFundsDetails, setMatchingFundsDetails] = useState<FundDetails[]>([]);

  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Available states derived from search results for filtering
  const [availableStates, setAvailableStates] = useState<string[]>([
    'NY', 'CA', 'DC', 'TX', 'FL', 'IL', 'PA', 'MA',
  ]);

  const categories = Object.entries(NTEE_MAJOR_GROUPS).map(([id, label]) => ({
    id: Number(id),
    label,
  }));

  // --- Contract reads ---
  const { data: bespokeFundTokenAddresses } = useReadContract({
    address: contracts.BespokeFundTokenFactory.address,
    abi: contracts.BespokeFundTokenFactory.abi,
    functionName: "getUserFunds",
    args: [address as `0x${string}`],
  });

  const { data: matchingFundTokenAddresses } = useReadContract({
    address: contracts.MatchingFundTokenFactory.address,
    abi: contracts.MatchingFundTokenFactory.abi,
    functionName: "getUserFunds",
    args: [address as `0x${string}`],
  });

  useEffect(() => {
    if (!bespokeFundTokenAddresses || bespokeFundTokenAddresses.length === 0) {
      setBespokeFundsDetails([]);
      return;
    }

    const fetchAllFundDetails = async () => {
      try {
        const details: FundDetails[] = [];
        for (const fundAddress of bespokeFundTokenAddresses) {
          const response = await readContract(config, {
            abi: deployedContracts[chainId].BespokeFundTokenFactory.abi,
            address: deployedContracts[chainId].BespokeFundTokenFactory.address as `0x${string}`,
            functionName: "getFundInfo",
            args: [fundAddress as `0x${string}`],
          });
          details.push({ value: fundAddress, label: response[1], isMatching: false });
        }
        setBespokeFundsDetails(details);
      } catch (error) {
        console.error("Error fetching fund details:", error);
      }
    };

    fetchAllFundDetails();
  }, [bespokeFundTokenAddresses, address]);

  useEffect(() => {
    if (!matchingFundTokenAddresses || matchingFundTokenAddresses.length === 0) {
      setMatchingFundsDetails([]);
      return;
    }

    const fetchAllMatchingFundDetails = async () => {
      try {
        const details: FundDetails[] = [];
        for (const fundAddress of matchingFundTokenAddresses) {
          const response = await readContract(config, {
            abi: deployedContracts[chainId].MatchingFundTokenFactory.abi,
            address: deployedContracts[chainId].MatchingFundTokenFactory.address as `0x${string}`,
            functionName: "getFundInfo",
            args: [fundAddress as `0x${string}`],
          });
          details.push({ value: fundAddress, label: response[1], isMatching: true });
        }
        setMatchingFundsDetails(details);
      } catch (error) {
        console.error("Error fetching fund details:", error);
      }
    };

    fetchAllMatchingFundDetails();
  }, [matchingFundTokenAddresses, address]);

  // --- ProPublica API ---
  const fetchNonprofits = useCallback(async (query: string, page: number, stateFilter?: string, nteeFilter?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('page', String(page));
      if (stateFilter) params.set('state[id]', stateFilter);
      if (nteeFilter) params.set('ntee[id]', String(nteeFilter));

      const response = await fetch(
        `/api/nonprofits/search.json?${params.toString()}`
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      const orgs: ProPublicaOrg[] = data.organizations || [];
      const mapped = orgs.map((org, i) => {
        const charity = mapOrgToCharity(org, i + page * 25);
        // Preserve favorite status
        if (favorites.has(charity.id)) {
          charity.isFavorite = true;
        }
        return charity;
      });

      setCharities(mapped);
      setCurrentPage(data.cur_page ?? 0);
      setTotalPages(data.num_pages ?? 0);
      setTotalResults(data.total_results ?? 0);
      setHasSearched(true);

      // Collect unique states from results for the filter sidebar
      const states = new Set<string>(availableStates);
      orgs.forEach((org) => {
        if (org.state && org.state.length === 2) states.add(org.state);
      });
      setAvailableStates(Array.from(states).sort());
    } catch (error) {
      console.error('Error fetching nonprofits:', error);
    } finally {
      setLoading(false);
    }
  }, [favorites, availableStates]);

  // Initial load — fetch some default results
  useEffect(() => {
    fetchNonprofits('', 0);
  }, []);

  const handleSearch = () => {
    // Build the API call with filters
    const stateParam = selectedStates.length === 1 ? selectedStates[0] : undefined;
    const nteeParam = selectedCategories.length === 1 ? selectedCategories[0] : undefined;
    fetchNonprofits(searchValue, 0, stateParam, nteeParam);
  };

  const handleViewMore = () => {
    if (currentPage < totalPages - 1) {
      const stateParam = selectedStates.length === 1 ? selectedStates[0] : undefined;
      const nteeParam = selectedCategories.length === 1 ? selectedCategories[0] : undefined;
      fetchNonprofits(searchValue, currentPage + 1, stateParam, nteeParam);
    }
  };

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
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const handleStateChange = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  const handleDonateClick = (charity: Charity) => {
    setSelectedCharity(charity);
    setIsDonationModalOpen(true);
    setOpenDropdown({});
  };

  // Client-side filtering for multi-select (API only supports single state/ntee at a time)
  const filteredCharities = charities.filter((charity) => {
    const matchesState =
      selectedStates.length === 0 ||
      selectedStates.some((st) => charity.location.includes(st));

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((catId) => getNteeMajorGroupId(charity.nteeCode) === catId);

    return matchesState && matchesCategory;
  });

  // Generate initials for logo placeholder
  const getInitials = (name: string) => {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase();
  };

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
              onPressEnter={handleSearch}
              className="flex-1 h-12 rounded-full border-gray-200"
              style={{ borderRadius: '24px' }}
            />
            <Button
              type="primary"
              size="large"
              className="h-12 px-10 rounded-full font-semibold"
              onClick={handleSearch}
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #e879a8 0%, #d4a5ff 100%)',
                border: 'none',
                borderRadius: '24px',
              }}
            >
              Search
            </Button>
          </div>

          {/* Results count */}
          {hasSearched && (
            <div className="mb-4 text-sm text-gray-500">
              {totalResults.toLocaleString()} nonprofits found
              {searchValue && <> for &quot;{searchValue}&quot;</>}
              {' · '}Showing page {currentPage + 1} of {totalPages}
            </div>
          )}

          {/* Content Grid */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar */}
            <div
              className="w-full lg:w-64 flex-shrink-0 border border-gray-200 rounded-lg p-4"
              style={{ minHeight: '400px' }}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">Filter</h2>

              {/* State Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">State</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableStates.map((state) => (
                    <div key={state} className="flex items-center">
                      <Checkbox
                        checked={selectedStates.includes(state)}
                        onChange={() => handleStateChange(state)}
                        className="custom-checkbox"
                      >
                        <span className="text-sm text-gray-600">
                          {US_STATES[state] || state} ({state})
                        </span>
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories Filter (NTEE) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-2">Select</p>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center">
                        <Checkbox
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => handleCategoryChange(cat.id)}
                          className="custom-checkbox"
                        >
                          <span className="text-sm text-gray-600">{cat.label}</span>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply filters button */}
              <Button
                type="default"
                className="w-full mt-4 rounded-full"
                style={{ borderRadius: '24px' }}
                onClick={handleSearch}
              >
                Apply Filters
              </Button>
            </div>

            {/* Charity Cards Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Spin size="large" />
                </div>
              ) : filteredCharities.length === 0 ? (
                <div className="flex justify-center items-center py-20 text-gray-400">
                  {hasSearched ? 'No nonprofits found. Try a different search.' : 'Search for nonprofits to get started.'}
                </div>
              ) : (
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
                        <div className="text-white font-bold text-3xl opacity-80">
                          {getInitials(charity.name)}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={() => toggleFavorite(charity.id)}
                          className="absolute top-3 right-3 p-1 hover:scale-110 transition-transform"
                        >
                          {charity.isFavorite ? (
                            <HeartSolidIcon className="w-6 h-6 text-red-500" />
                          ) : (
                            <HeartIcon className="w-6 h-6 text-white drop-shadow" />
                          )}
                        </button>

                        {/* EIN Badge */}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-30 text-white text-xs px-2 py-0.5 rounded">
                          EIN: {charity.ein}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{charity.name}</h3>
                        {charity.description && (
                          <p className="text-gray-500 text-xs leading-relaxed mb-2 line-clamp-2">
                            {charity.description}
                          </p>
                        )}
                        {charity.category !== 'Unknown, Unclassified' && (
                          <span className="inline-block text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full mb-2">
                            {charity.category}
                          </span>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-1">
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
              )}

              {/* View More Button */}
              {!loading && filteredCharities.length > 0 && currentPage < totalPages - 1 && (
                <div className="flex justify-center mt-8">
                  <Button
                    type="primary"
                    size="large"
                    className="h-12 px-12 rounded-full font-semibold"
                    onClick={handleViewMore}
                    style={{
                      background: 'linear-gradient(135deg, #e879a8 0%, #d4a5ff 100%)',
                      border: 'none',
                      borderRadius: '24px',
                    }}
                  >
                    View More (Page {currentPage + 2} of {totalPages})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        nonprofitName={selectedCharity?.name || 'Nonprofit XYZ'}
        bespokeFundsDetails={bespokeFundsDetails}
        matchingFundsDetails={matchingFundsDetails}
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
