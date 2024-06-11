import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

function galleryMarkup(images) {
  return images
    .map(
      ({
        previewURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) => {
        return `
      <li class="gallery-card">
        <div class="gallery-img-wrapper">
            <a href="${largeImageURL}">
                <img
                    class="gallery-img"
                    src="${previewURL}"
                    alt="${tags}"
                    width="260"
                    height="160"
                />
             </a>
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
      }
    )
    .join('');
}

async function showLightbox() {
  const lightbox = new SimpleLightbox('.gallery li div a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
  lightbox.on('error.simplelightbox', function (e) {
    console.log(e);
  });
}

export { galleryMarkup, showLightbox };
