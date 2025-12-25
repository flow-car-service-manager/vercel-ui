"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Seçin...",
  disabled = false,
  required = false,
  className = "",
  getOptionLabel = (option) => option.name || option.label || String(option),
  getOptionValue = (option) => option.id || option.value || option,
  searchable = true,
  renderOption,
}) {
  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const filteredOptions = safeOptions.filter((option) => {
    if (!searchTerm) return true;
    const label = getOptionLabel(option).toLowerCase();
    return label.includes(searchTerm.toLowerCase());
  });

  console.log("value: ", typeof value);
  const selectedOption = safeOptions.find(
    (option) => getOptionValue(option).toString() === value.toString()
  );
  console.log("selectedOption. ", selectedOption);
  console.log("option: ", safeOptions.map(o => o));
  safeOptions.map(o => console.log("getOptionValue(o): ", typeof getOptionValue(o)))

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(getOptionValue(option));
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg text-left
          focus:ring-2 focus:ring-red-500 focus:border-red-500
          ${disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:bg-gray-50"
          }
          ${isOpen ? "ring-2 ring-red-500 border-red-500" : ""}
          flex items-center justify-between
        `}
      >
        <span className="truncate">
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>
        <div className="flex items-center space-x-1 ml-2">
          {value && !disabled && (
            <span
              type="button"
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
          />
        </div>
      </button>
      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {/* Search Input */}
          {searchable && (
            <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                {searchTerm ? "Sonuç bulunamadı" : "Seçenek yok"}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = getOptionValue(option) === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={getOptionValue(option)}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-4 py-2 text-left text-sm
                      hover:bg-red-50 hover:text-red-900
                      focus:bg-red-50 focus:text-red-900 focus:outline-none
                      ${isSelected
                        ? "bg-red-100 text-red-900 font-medium"
                        : "text-gray-900"
                      }
                      ${isHighlighted ? "bg-red-50 text-red-900" : ""}
                      transition-colors duration-150
                    `}
                  >
                    {renderOption
                      ? renderOption(option, isSelected)
                      : getOptionLabel(option)}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
