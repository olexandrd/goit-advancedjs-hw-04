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
let paginationPage = 1;
const observerOptions = {
  root: null,
  rootMargin: '0px 0px 350px 0px',
};

refs.searchForm.addEventListener('submit', handleSearchFormSubmit);
refs.infinityScrollSwitch.addEventListener('click', handleInfinityScrollSwitch);
refs.loadMoreButton.addEventListener('click', loadMoreHandler);
let observer = new IntersectionObserver(loadMoreHandler, observerOptions);

function handleInfinityScrollSwitch(e) {
  console.log('Infinity scroll switch clicked');
  console.log(e);
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
  const searchQuery = e.target.elements.searchQuery.value;
  const imageArray = await serviceFetchImages(searchQuery);
  if (!imageArray.length) {
    iziToast.warning({
      title: 'No images found',
      message: 'Please enter a more specific query!',
      position: 'center',
      closeOnClick: true,
    });
    return;
  }
  refs.gallery.insertAdjacentHTML('beforeend', galleryMarkup(imageArray));
  if (
    refs.infinityScrollSwitch.classList.contains('infinity-scroll-switch-off')
  ) {
    refs.loadMoreContainer.hidden = false;
  } else {
    observer.observe(refs.infinityScrollGuard);
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
    const images = response.data.hits;
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
  const searchQuery = refs.searchForm.elements.searchQuery.value;
  const imageArray = await serviceFetchImages(searchQuery, paginationPage);
  refs.gallery.insertAdjacentHTML('beforeend', galleryMarkup(imageArray));
}

function galleryMarkup(images) {
  return images
    .map(({ webformatURL, tags, likes, views, comments, downloads }) => {
      return `
      <li class="gallery-card">
        <div class="gallery-img-wrapper">
            <img
            class="gallery-img"
            src="${webformatURL}"
            alt="${tags}"
            width="260"
            height="160"
            />
        </div>
        <ul class="gallery-card-social">
          <li class="gallery-card-social-info">
            <h3>Likes</h3>
            <p>${likes}</p>
          </li>
          <li class="gallery-card-social-info">
            <h3>Views</h3>
            <p>${views}</p>
          </li>
          <li class="gallery-card-social-info">
            <h3>Comments</h3>
            <p>${comments}</p>
          </li>
          <li class="gallery-card-social-info">
            <h3>Downloads</h3>
            <p>${downloads}</p>
          </li>
        </ul>
      </li>
    `;
    })
    .join('');
}
