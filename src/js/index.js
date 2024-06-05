import axios from 'axios';

const refs = {
  searchBtn: document.querySelector('.search-btn'),
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
};

const pixabayApiKey = VITE_PIXABAY_API_KEY;
const baseUrl = 'https://pixabay.com/api/';
