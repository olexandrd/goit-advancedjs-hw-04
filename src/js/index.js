import axios from 'axios';

const refs = {
  searchBtn: document.querySelector('.search-btn'),
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
};

const pixabayApiKey = import.meta.env.VITE_PIXABAY_API_KEY;
const baseUrl = 'https://pixabay.com/api/';

refs.searchForm.addEventListener('submit', handleSearchFormSubmit);

async function handleSearchFormSubmit(e) {
  e.preventDefault();
  const searchQuery = e.target.elements.searchQuery.value;
  const imageArray = await serviceFetchImages(searchQuery);

  refs.gallery.insertAdjacentHTML('beforeend', galleryMarkup(imageArray));
}

async function serviceFetchImages(searchQuery) {
  try {
    const response = await axios.get(
      `${baseUrl}?key=${pixabayApiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true`
    );
    const images = response.data.hits;
    return images;
  } catch (error) {
    console.log('error', error);
  }
}

function galleryMarkup(images) {
  console.log(images);
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
