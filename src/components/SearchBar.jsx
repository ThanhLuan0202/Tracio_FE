import React from "react";
import styled from "styled-components";
import logo from "../assets/logo.jpg";
import { IoMdNotifications } from "react-icons/io";
import { FaSearch, FaShoppingCart } from "react-icons/fa";

function SearchBar() {
  return (
    <Container>
      <Logo src={logo} alt="Logo" />
      <SearchContainer>
        <SearchInput type="text" placeholder="Search for products" />
        <SearchButton>
          <FaSearch />
        </SearchButton>
      </SearchContainer>
      <IconContainer>
        <FaShoppingCart />
        <IoMdNotifications />
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
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 90%;
  }
`;

const SearchInput = styled.input`
  padding: 10px;
  border: none;
  flex: 1;
  font-size: 16px;
`;

const SearchButton = styled.button`
  background-color: black;
  padding: 14px;
  border: none;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
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
