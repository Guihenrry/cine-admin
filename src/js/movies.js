import supabase from './services/supabase'

class MoviesPage {
  constructor({
    $buttonLogout,
    $modalEditMovie,
    $modalDeleteMovie,
    $modalDeleteMovieConfirm,
    $tableBody,
    $searchInput,
  }) {
    this.movies = []
    this.$buttonLogout = $buttonLogout
    this.$modalEditMovie = $modalEditMovie
    this.$modalDeleteMovie = $modalDeleteMovie
    this.$modalDeleteMovieConfirm = $modalDeleteMovieConfirm
    this.$tableBody = $tableBody
    this.$searchInput = $searchInput
  }

  redirectToLogin() {
    window.location.href = 'login.html'
  }

  async checkIsLoggedIn() {
    const { data } = await supabase.auth.getSession()
    if (!data.session) this.redirectToLogin()
  }

  async logout() {
    await supabase.auth.signOut()
    this.redirectToLogin()
  }

  async deleteStorageImage(image) {
    return await supabase.storage.from('images').remove([image])
  }

  async deleteMovieById(id) {
    const imageToDelete = this.movies.find(
      (movie) => Number(movie.id) === Number(id)
    ).cover
    this.movies = this.movies.filter((movie) => Number(id) !== Number(movie.id))
    this.render(this.movies)

    await supabase.from('movies').delete().eq('id', id)
    await this.deleteStorageImage(imageToDelete)
  }

  async handleClickButtonLogout() {
    this.$buttonLogout.innerText = 'Saindo...'
    this.$buttonLogout.disabled = true
    this.logout()
  }

  async handleClickDeleteMovieConfirm(event) {
    const movieId = Number(event.target.getAttribute('data-movie-id'))
    this.deleteMovieById(movieId)
  }

  handleShowModalEditMovie(event) {
    const movieId = event.relatedTarget.getAttribute('data-movie-id')
  }

  handleShowModalDeleteMovie(event) {
    const movieId = event.relatedTarget.getAttribute('data-movie-id')
    this.$modalDeleteMovieConfirm.setAttribute('data-movie-id', movieId)
  }

  handleFilterMovies(event) {
    const searchTerm = event.target.value.toLowerCase()
    const moviesFiltered = this.movies.filter((movie) =>
      movie.title.toLowerCase().includes(searchTerm)
    )
    this.render(moviesFiltered)
  }

  async getMovies() {
    const { data } = await supabase.from('movies').select('*')
    this.movies = data
    this.render(this.movies)
  }

  getSupabaseImageUrl(image) {
    const { data } = supabase.storage.from('images').getPublicUrl(image)
    return data.publicUrl
  }

  createMovieTableRowElement(movie) {
    const tr = document.createElement('tr')
    tr.setAttribute('data-movie-id', movie.id)
    tr.innerHTML = `
<td style="min-width: 120px;">
  <div class="ratio ratio-16x9">
    <img class="object-fit-cover border rounded" src="${this.getSupabaseImageUrl(
      movie.cover
    )}" alt="${movie.title}">
  </div>
</td>
<td>${movie.title}</td>
<td class="text-truncate" style="max-width: 150px;">${movie.description}</td>
<td class="text-truncate" style="max-width: 100px;">${movie.gender}</td>
<td>${movie.year}</td>
<td>
  <button class="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Abrir menu">
    <i class="bi bi-three-dots-vertical"></i>
  </button>
  <ul class="dropdown-menu">
    <li>
      <button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#modalEditMovie" data-movie-id="${
        movie.id
      }">Editar</button>
    </li>
    <li>
      <button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#modalDeleteMovie" data-movie-id="${
        movie.id
      }">Deletar</button>
    </li>
  </ul>
</td>
    `

    return tr
  }

  createNoResultTableRow() {
    return `
    <tr>
      <td class="text-center py-5" colspan="6">
        <p class="text-secondary">Sem resultados para essa busca</p>
      </td>
    </tr>
    `
  }

  render(movies) {
    if (movies.length) {
      tableBody.innerHTML = ''
      movies.forEach((movie) => {
        const tableRow = this.createMovieTableRowElement(movie)
        tableBody.appendChild(tableRow)
      })
    } else {
      tableBody.innerHTML = this.createNoResultTableRow()
    }
  }

  bindEvents() {
    this.handleClickButtonLogout = this.handleClickButtonLogout.bind(this)
    this.handleShowModalEditMovie = this.handleShowModalEditMovie.bind(this)
    this.handleShowModalDeleteMovie = this.handleShowModalDeleteMovie.bind(this)
    this.handleClickDeleteMovieConfirm =
      this.handleClickDeleteMovieConfirm.bind(this)
    this.handleFilterMovies = this.handleFilterMovies.bind(this)
  }

  addEvents() {
    this.$buttonLogout.addEventListener('click', this.handleClickButtonLogout)
    this.$modalEditMovie.addEventListener(
      'show.bs.modal',
      this.handleShowModalEditMovie
    )
    this.$modalDeleteMovie.addEventListener(
      'show.bs.modal',
      this.handleShowModalDeleteMovie
    )
    this.$modalDeleteMovieConfirm.addEventListener(
      'click',
      this.handleClickDeleteMovieConfirm
    )
    this.$searchInput.addEventListener('input', this.handleFilterMovies)
  }

  init() {
    this.checkIsLoggedIn()
    this.bindEvents()
    this.addEvents()
    this.getMovies()
  }
}

const moviesPage = new MoviesPage({
  $buttonLogout: document.getElementById('buttonLogout'),
  $modalEditMovie: document.getElementById('modalEditMovie'),
  $modalDeleteMovie: document.getElementById('modalDeleteMovie'),
  $modalDeleteMovieConfirm: document.getElementById('modalDeleteMovieConfirm'),
  $tableBody: document.getElementById('tableBody'),
  $searchInput: document.getElementById('searchInput'),
})

moviesPage.init()
