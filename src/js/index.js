import { galleryMarkup, lightbox } from './markup';
import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const refs = {
  searchBtn: document.querySelector('.search-btn'),
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreButton: document.querySelector('.load-more-btn'),
  loadMoreContainer: document.querySelector('.load-more-container'),
  infinityScrollSwitch: document.querySelector('.infinity-scroll-switch'),
  infinityScrollGuard: document.querySelector('.infinity-scroll-guard'),
};

const pixabayApiKey = import.meta.env.VITE_PIXABAY_API_KEY;
const baseUrl = 'https://pixabay.com/api/';
const paginationPerPage = 40;
let paginationPage;
const observerOptions = {
  root: null,
  rootMargin: '0px 0px 350px 0px',
};

refs.searchForm.addEventListener('submit', handleSearchFormSubmit);
refs.infinityScrollSwitch.addEventListener('click', handleInfinityScrollSwitch);
refs.loadMoreButton.addEventListener('click', loadMoreHandler);
let observer = new IntersectionObserver(loadMoreHandler, observerOptions);

function handleInfinityScrollSwitch(e) {
  if (
    refs.infinityScrollSwitch.classList.contains('infinity-scroll-switch-off')
  ) {
    refs.infinityScrollSwitch.classList.replace(
      'infinity-scroll-switch-off',
      'infinity-scroll-switch-on'
    );
    refs.loadMoreContainer.hidden = true;
    refs.loadMoreButton.removeEventListener('click', loadMoreHandler);
    if (refs.gallery.children.length > 0) {
      observer.observe(refs.infinityScrollGuard);
    }
  } else {
    refs.infinityScrollSwitch.classList.replace(
      'infinity-scroll-switch-on',
      'infinity-scroll-switch-off'
    );
    if (refs.gallery.children.length > 0) {
      refs.loadMoreContainer.hidden = false;
    }
    observer.unobserve(refs.infinityScrollGuard);
    refs.loadMoreButton.addEventListener('click', loadMoreHandler);
  }
}

async function handleSearchFormSubmit(e) {
  e.preventDefault();
  paginationPage = 1;
  const searchQuery = e.target.elements.searchQuery.value.trim();
  refs.gallery.innerHTML = '';
  if (!searchQuery) {
    iziToast.warning({
      title: 'Empty request!',
      message: 'Please enter a search query!',
      position: 'center',
      closeOnClick: true,
    });
    return;
  }
  try {
    const apiResponse = await serviceFetchImages(searchQuery, paginationPage);
    if (!apiResponse.hits.length) {
      iziToast.warning({
        title: 'No images found',
        message: 'Please enter a more specific query!',
        position: 'center',
        closeOnClick: true,
      });
      return;
    }

    iziToast.info({
      title: 'Hooray!',
      message: `We found ${apiResponse.totalHits} images.`,
      position: 'topRight',
      closeOnClick: true,
    });
    refs.gallery.insertAdjacentHTML(
      'beforeend',
      galleryMarkup(apiResponse.hits)
    );
    lightbox.refresh();
    if (
      refs.infinityScrollSwitch.classList.contains('infinity-scroll-switch-off')
    ) {
      refs.loadMoreContainer.hidden = false;
      refs.loadMoreButton.addEventListener('click', loadMoreHandler);
    } else {
      observer.observe(refs.infinityScrollGuard);
    }
    if (
      paginationPage * paginationPerPage >=
      Math.min(apiResponse.total, apiResponse.totalHits)
    ) {
      stopLoadMore();
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: `Got an error: ${error.message}`,
      closeOnClick: true,
    });
  }
}

async function serviceFetchImages(searchQuery, paginationPage = 1) {
  const queryString = new URLSearchParams({
    page: paginationPage,
    per_page: paginationPerPage,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    key: pixabayApiKey,
    q: searchQuery,
  });
  try {
    const response = await axios.get(`${baseUrl}?${queryString}`);
    const images = response.data;
    return images;
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: `Got an error: ${error.message}`,
      closeOnClick: true,
    });
  }
}

async function loadMoreHandler(entries = []) {
  if (
    refs.infinityScrollSwitch.classList.contains('infinity-scroll-switch-on') &&
    !entries[0].isIntersecting
  ) {
    return;
  } else {
    await loadMoreImages();
  }
}

async function loadMoreImages() {
  paginationPage++;
  const searchQuery = refs.searchForm.elements.searchQuery.value.trim();
  const apiResponse = await serviceFetchImages(searchQuery, paginationPage);
  if (
    paginationPage * paginationPerPage >=
    Math.min(apiResponse.total, apiResponse.totalHits)
  ) {
    stopLoadMore();
  }
  refs.gallery.insertAdjacentHTML('beforeend', galleryMarkup(apiResponse.hits));
  lightbox.refresh();
}

function stopLoadMore() {
  observer.unobserve(refs.infinityScrollGuard);
  refs.loadMoreContainer.hidden = true;
  refs.loadMoreButton.removeEventListener('click', loadMoreHandler);

  if (refs.gallery.children.length > 0) {
    iziToast.info({
      title: "We're sorry,",
      message: "but you've reached the end of search results.",
      position: 'center',
      closeOnClick: true,
    });
  }
}
