import React, { useState } from "react";
import styled from "styled-components";
import logo from "../assets/logo.jpg";
import { IoMdNotifications } from "react-icons/io";
import { FaSearch, FaShoppingCart, FaUserCircle, FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("products"); // products or services
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      let endpoint =
        searchType === "products"
          ? "https://67cec251125cd5af757bdeb7.mockapi.io/product"
          : "https://67cec251125cd5af757bdeb7.mockapi.io/services";

      const response = await fetch(endpoint);
      const data = await response.json();

      // Filter results based on search query
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
    navigate("/cart");
  };

  const handleManageClick = () => {
    navigate("/route");
  };

  return (
    <Container>
      <Logo
        src={logo}
        alt="Logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      />
      <SearchContainer>
        <SearchTypeSelect
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="products">Products</option>
          <option value="services">Services</option>
        </SearchTypeSelect>
        <SearchInput
          type="text"
          placeholder={`Search for ${searchType}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <SearchButton onClick={handleSearch}>
          <FaSearch />
        </SearchButton>
      </SearchContainer>
      {showDropdown && searchResults.length > 0 && (
        <SearchResultsDropdown>
          {searchResults.map((item) => (
            <SearchResultItem
              key={item.id}
              onClick={() => handleItemClick(item)}
            >
              <SearchResultImage src={item.image} alt={item.name} />
              <SearchResultInfo>
                <div>{item.name}</div>
                <SearchResultPrice>
                  {item.price.toLocaleString("vi-VN")}đ
                </SearchResultPrice>
              </SearchResultInfo>
            </SearchResultItem>
          ))}
        </SearchResultsDropdown>
      )}
      <IconContainer>
        <FaShoppingCart
          onClick={handleCartClick}
          style={{ cursor: "pointer" }}
        />
        <IoMdNotifications style={{ cursor: "pointer" }} />
        <FaUserCircle style={{ cursor: "pointer" }} />
        <FaCog onClick={handleManageClick} style={{ cursor: "pointer" }} />
      </IconContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 5%;
  background-color: #f8f9fa;
  border-bottom: 2px solid #ddd;
  flex-wrap: wrap;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
  }
`;

const Logo = styled.img`
  width: 100px;
  height: auto;

  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

const SearchContainer = styled.div`
  width: 50%;
  display: flex;
  align-items: center;
  border: 1px solid;
  border-radius: 30px;
  overflow: hidden;
  background: #f5f5f5;
  transition: all 0.3s ease;
  padding: 4px;

  &:focus-within {
    background: white;
    box-shadow: 0 0 0 2px #000;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchTypeSelect = styled.select`
  padding: 10px 16px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  background: white;
  cursor: pointer;
  outline: none;
  color: #333;
  margin-right: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;

  &:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  option {
    font-size: 14px;
    padding: 10px;
  }
`;

const SearchInput = styled.input`
  padding: 10px 16px;
  border: none;
  flex: 1;
  font-size: 15px;
  outline: none;
  color: #333;
  background: transparent;

  &::placeholder {
    color: #999;
    font-weight: 400;
  }
`;

const SearchButton = styled.button`
  background-color: #000;
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #333;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  svg {
    font-size: 16px;
  }
`;

const SearchResultsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;

  @media (max-width: 768px) {
    width: 90%;
  }
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SearchResultImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
`;

const SearchResultInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SearchResultPrice = styled.div`
  color: #e53e3e;
  font-weight: 600;
  font-size: 14px;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 25px;
  color: black;
  cursor: pointer;

  @media (max-width: 768px) {
    margin-top: 10px;
  }
`;

export default SearchBar;
