import React, { useState, useRef, useEffect } from 'react';
import { Input, Spin, Button, Typography } from 'antd';
import { SearchOutlined, CloseOutlined, CheckOutlined, DownOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Custom Select component yang mobile-friendly.
 * Menggunakan drawer-style dropdown di mobile, popover di desktop.
 *
 * @param {object} props
 * @param {Array} props.options - [{ value, label }]
 * @param {any} props.value - Selected value
 * @param {function} props.onChange - Handler perubahan value
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.allowClear - Tampilkan tombol clear
 * @param {string} props.notFoundContent - Teks jika tidak ada data
 * @param {boolean} props.showSearch - Aktifkan pencarian
 * @param {function} props.onSearch - Handler pencarian (untuk server-side)
 * @param {boolean} props.hasMore - Masih ada data lagi
 * @param {function} props.onLoadMore - Handler load more
 * @param {boolean} props.loadingMore - Loading saat load more
 * @param {string} props.size - 'large' | 'middle' | 'small'
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.error - Error text
 */
const SearchSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Pilih...',
  disabled = false,
  loading = false,
  allowClear = false,
  notFoundContent = 'Tidak ada data',
  showSearch = false,
  onSearch,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  size = 'large',
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const selectedLabel = options.find(o => o.value === value)?.label || '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && showSearch && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open, showSearch]);

  const filteredOptions = showSearch && search
    ? options.filter(o => (o.label || '').toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (val) => {
    onChange?.(val === value ? undefined : val);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(undefined);
    setSearch('');
  };

  const sizeStyles = {
    large: { height: 44, fontSize: 14, padding: '0 12px' },
    middle: { height: 36, fontSize: 13, padding: '0 10px' },
    small: { height: 28, fontSize: 12, padding: '0 8px' },
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setOpen(!open)}
        style={{
          ...sizeStyles[size],
          border: `1px solid ${error ? '#ef4444' : open ? '#3b82f6' : '#e2e8f0'}`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: disabled ? '#f5f5f5' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: open ? '0 0 0 2px rgba(59,130,246,0.1)' : 'none',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Text
          style={{
            fontSize: sizeStyles[size].fontSize,
            color: selectedLabel ? '#1e293b' : '#94a3b8',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {loading ? 'Memuat...' : selectedLabel || placeholder}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8 }}>
          {allowClear && selectedLabel && !disabled && (
            <CloseOutlined
              onClick={handleClear}
              style={{ fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}
            />
          )}
          <DownOutlined style={{ fontSize: 10, color: '#94a3b8', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
        </div>
      </div>

      {/* Error text */}
      {error && <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{error}</Text>}

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 1000,
            maxHeight: 280,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search input */}
          {showSearch && (
            <div style={{ padding: '8px 8px 4px', borderBottom: '1px solid #f0f0f0' }}>
              <Input
                ref={searchRef}
                placeholder="Cari..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  onSearch?.(e.target.value);
                }}
                allowClear
                size="small"
                style={{ borderRadius: 8 }}
              />
            </div>
          )}

          {/* Options list */}
          <div style={{ overflowY: 'auto', maxHeight: showSearch ? 220 : 280, padding: '4px 0' }}>
            {loading && options.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <Spin size="small" />
                <Text style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginTop: 8 }}>Memuat data...</Text>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <Text style={{ fontSize: 13, color: '#94a3b8' }}>{notFoundContent}</Text>
              </div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: opt.value === value ? '#f0f7ff' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Text style={{ fontSize: 13, color: opt.value === value ? '#3b82f6' : '#1e293b', fontWeight: opt.value === value ? 600 : 400 }}>
                    {opt.label}
                  </Text>
                  {opt.value === value && <CheckOutlined style={{ fontSize: 12, color: '#3b82f6' }} />}
                </div>
              ))
            )}

            {/* Load more button */}
            {hasMore && (
              <div style={{ padding: '8px 12px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                <Button type="link" size="small" loading={loadingMore} onClick={(e) => { e.stopPropagation(); onLoadMore?.(); }}>
                  Muat Lainnya...
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSelect;
