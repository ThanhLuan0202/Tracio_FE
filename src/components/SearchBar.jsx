import React, { useState, useEffect } from "react";
import styled from "styled-components";
import logo from "../assets/logo.jpg";
import { FaMapLocationDot } from "react-icons/fa6";
import { FaSearch, FaShoppingCart, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("products");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      let endpoint = searchType === "products"
        ? "https://67cec251125cd5af757bdeb7.mockapi.io/product"
        : "https://67cec251125cd5af757bdeb7.mockapi.io/services";

      const response = await fetch(endpoint);
      const data = await response.json();
      const filteredResults = data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredResults);
      setShowDropdown(true);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleItemClick = (item) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (searchType === "products") {
      navigate(`/product/${item.id}`);
    } else {
      navigate(`/service/${item.id}`);
    }
  };

  const handleCartClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate("/cart");
  };

  const handleManageClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate("/route");
  };

  const handleUserClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    // Handle logged in user actions (e.g., show profile menu)
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <Container>
      <Logo src={logo} alt="Logo" onClick={() => navigate("/")} />
      <SearchContainer>
        <SearchTypeSelect value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="products">Products</option>
          <option value="services">Services</option>
        </SearchTypeSelect>
        <SearchInput
          type="text"
          placeholder={`Search for ${searchType === "products" ? "products" : "services"}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <SearchButton onClick={handleSearch}>
          <FaSearch />
        </SearchButton>
      </SearchContainer>
      <IconContainer>
        <IconWrapper onClick={handleCartClick}>
          <FaShoppingCart />
          <IconTooltip>Cart</IconTooltip>
        </IconWrapper>

        <IconWrapper onClick={handleManageClick}>
          <FaMapLocationDot />
          <IconTooltip>Manage Route</IconTooltip>
        </IconWrapper>

        {isLoggedIn ? (
          <>
            <IconWrapper onClick={handleUserClick}>
              <FaUserCircle />
              <IconTooltip>Profile</IconTooltip>
            </IconWrapper>
            <IconWrapper onClick={handleLogout}>
              <FaSignOutAlt />
              <IconTooltip>Logout</IconTooltip>
            </IconWrapper>
          </>
        ) : (
          <LoginText onClick={() => navigate('/login')}>Login</LoginText>
        )}
      </IconContainer>

      {showDropdown && searchResults.length > 0 && (
        <SearchResultsDropdown>
          {searchResults.map((item) => (
            <SearchResultItem key={item.id} onClick={() => handleItemClick(item)}>
              <SearchResultImage src={item.image} alt={item.name} />
              <SearchResultInfo>
                <div className="font-medium">{item.name}</div>
                <SearchResultPrice>{item.price.toLocaleString('vi-VN')}đ</SearchResultPrice>
              </SearchResultInfo>
            </SearchResultItem>
          ))}
        </SearchResultsDropdown>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 5%;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 100px;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 600px;
  margin: 0 24px;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:focus-within {
    border-color: #000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    width: 100%;
    margin: 0;
  }
`;

const SearchTypeSelect = styled.select`
  padding: 12px 16px;
  border: none;
  border-right: 1px solid #eee;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background-color: transparent;
  cursor: pointer;
  outline: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }

  option {
    padding: 8px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: 15px;
  color: #333;
  outline: none;

  &::placeholder {
    color: #aaa;
  }
`;

const SearchButton = styled.button`
  padding: 16px 24px;
  background-color: #000;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: #333;
  }

  svg {
    font-size: 18px;
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  color: #333;

  &:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
    
    > div {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }

  svg {
    font-size: 24px;
  }
`;

const IconTooltip = styled.div`
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;

  &:before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid rgba(0, 0, 0, 0.8);
  }
`;

const SearchResultsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  z-index: 1000;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    width: 90%;
  }
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    transform: translateX(4px);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SearchResultImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const SearchResultInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .font-medium {
    font-weight: 500;
    color: #333;
  }
`;

const SearchResultPrice = styled.div`
  color: #e53e3e;
  font-weight: 600;
  font-size: 14px;
`;

const LoginText = styled.div`
  cursor: pointer;
  font-weight: 500;
  color: #333;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
  }
`;

export default SearchBar;
