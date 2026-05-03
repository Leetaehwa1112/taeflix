const API_KEY  = '1e07b344b9981c152cdeed9f1a185c9d';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_W500 = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIG = 'https://image.tmdb.org/t/p/original';

let movies = [];
let heroMovie = null;

/* ── 유틸 ── */
function fmt(score) { return score ? `★ ${score.toFixed(1)}` : ''; }
function fmtDate(d) { return d ? d.replace(/-/g, '.') : ''; }

/* ── 헤더 스크롤 효과 ── */
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 60);
});

/* ── API 호출 ── */
async function fetchMovies() {
  const url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ko-KR&page=1`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

/* ── 히어로 설정 ── */
function setHero(movie) {
  heroMovie = movie;
  const backdrop = document.getElementById('hero-backdrop');
  if (movie.backdrop_path) {
    backdrop.style.backgroundImage = `url(${IMG_ORIG}${movie.backdrop_path})`;
  }
  document.getElementById('hero-title').textContent  = movie.title || movie.original_title;
  document.getElementById('hero-overview').textContent = movie.overview || '줄거리 정보 없음';
  document.getElementById('hero-rating').textContent  = fmt(movie.vote_average);
  document.getElementById('hero-date').textContent   = fmtDate(movie.release_date);
  document.getElementById('hero-btn').onclick = () => openModal(movie);
}

/* ── 카드 렌더 ── */
function renderCards(list) {
  const grid = document.getElementById('movie-grid');
  grid.innerHTML = '';
  list.forEach(m => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = m.poster_path
      ? `<img src="${IMG_W500}${m.poster_path}" alt="${m.title}" loading="lazy" />`
      : `<div class="no-poster">${m.title}</div>`;
    card.innerHTML += `
      <div class="movie-info">
        <div class="movie-card-title">${m.title || m.original_title}</div>
        ${m.vote_average ? `<span class="movie-card-rating">${fmt(m.vote_average)}</span>` : ''}
      </div>`;
    card.addEventListener('click', () => openModal(m));
    grid.appendChild(card);
  });
}

/* ── 모달 ── */
function openModal(m) {
  document.getElementById('modal-backdrop').src =
    m.backdrop_path ? `${IMG_ORIG}${m.backdrop_path}` : '';
  document.getElementById('modal-title').textContent = m.title || m.original_title;
  document.getElementById('modal-overview').textContent = m.overview || '줄거리 정보 없음';
  document.getElementById('modal-meta').innerHTML = `
    ${m.vote_average ? `<span class="tag">${fmt(m.vote_average)}</span>` : ''}
    ${m.release_date ? `<span>개봉일: <span>${fmtDate(m.release_date)}</span></span>` : ''}
    ${m.original_title && m.original_title !== m.title
      ? `<span>원제: <span>${m.original_title}</span></span>` : ''}
  `;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── 초기화 ── */
async function init() {
  try {
    movies = await fetchMovies();
    if (!movies.length) throw new Error('영화 데이터가 없습니다.');

    /* 배경이 있는 영화를 히어로로 우선 선택 */
    const withBackdrop = movies.filter(m => m.backdrop_path && m.overview);
    setHero(withBackdrop.length ? withBackdrop[0] : movies[0]);

    document.getElementById('loading').style.display = 'none';
    document.getElementById('movies-section').style.display = 'block';
    renderCards(movies);
  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-msg').style.display = 'block';
    document.getElementById('error-detail').textContent = err.message;
    console.error(err);
  }
}

init();
