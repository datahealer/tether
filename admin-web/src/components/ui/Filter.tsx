import React from 'react';
import { Search, Download } from 'lucide-react';

interface FiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedGenderFocus: string;
  setSelectedGenderFocus: (focus: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  onExport: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  selectedGenderFocus,
  setSelectedGenderFocus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onExport,
}) => {
  const categories = ['All', 'communication', 'intimacy', 'playfulness', 'trust', 'love_languages', 'future', 'vulnerability', 'conflict', 'erotic', 'gratitude'];
  const types = ['All', 'Published', 'Draft'];
  const genderFocuses = ['All', 'Male', 'Female', 'Neutral'];

  return (
    <div className="bg-white border border-white rounded-2xl p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#626262]"
            size={20}
          />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-[#626262] rounded-xl pl-12 pr-4 py-3 text-[#1F2935] placeholder-[#626262] focus:outline-none focus:ring-2 focus:ring-[#626262]"
          />
        </div>
        <button
          onClick={onExport}
  className="flex items-center cursor-pointer gap-2 bg-[#FF7E3D] text-white px-6 py-3 rounded-xl hover:bg-white/20 hover:border hover:border-[#FF7E3D] hover:text-[#FF7E3D] transition-all"
        >
          <Download size={20} />
          Export
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-[#626262] text-sm mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white/10 border border-[#626262]  rounded-xl px-4 py-2 text-[#1F2935] placeholder-[#828282] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[#626262] text-sm mb-2">Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-white/10 border border-[#626262]  rounded-xl px-4 py-2 text-[#1F2935] placeholder-[#828282] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[#626262] text-sm mb-2">Gender Focus</label>
          <select
            value={selectedGenderFocus}
            onChange={(e) => setSelectedGenderFocus(e.target.value)}
            className="w-full bg-white/10 border border-[#626262]  rounded-xl px-4 py-2 text-[#1F2935] placeholder-[#828282] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
          >
            {genderFocuses.map((focus) => (
              <option key={focus} value={focus}>
                {focus}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[#626262] text-sm mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white/10 border border-[#626262]  rounded-xl px-4 py-2 text-[#1F2935] placeholder-[#828282] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
          >
            <option value="createdAt">Date Added</option>
            <option value="text">Question Text</option>
            <option value="categoryId">Category</option>
          </select>
        </div>

        <div>
          <label className="block text-[#626262] text-sm mb-2">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-white/10 border border-[#626262]  rounded-xl px-4 py-2 text-[#1F2935] placeholder-[#828282] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
};