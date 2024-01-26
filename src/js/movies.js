import Modal from 'bootstrap/js/dist/modal'

import supabase from './services/supabase'

class MoviesPage {
  constructor({
    modalAddMovie,
    modalEditMovie,
    $buttonLogout,
    $modalDeleteMovie,
    $modalDeleteMovieConfirm,
    $tableBody,
    $searchInput,
    $formAddMovie,
    $formEditMovie,
  }) {
    this.movies = []
    this.modalAddMovie = modalAddMovie
    this.modalEditMovie = modalEditMovie
    this.$buttonLogout = $buttonLogout
    this.$modalDeleteMovie = $modalDeleteMovie
    this.$modalDeleteMovieConfirm = $modalDeleteMovieConfirm
    this.$tableBody = $tableBody
    this.$searchInput = $searchInput
    this.$formAddMovie = $formAddMovie
    this.$formEditMovie = $formEditMovie
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

  getMovieById(id) {
    return this.movies.find((movie) => Number(movie.id) === Number(id))
  }

  async deleteMovieById(id) {
    const imageToDelete = this.getMovieById(id).cover
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

  generateRandomFileName(file) {
    const fileExt = file.name.split('.').pop()
    const randomNumber = Math.random().toString().replace('0.', '')
    const fileName = `${randomNumber}.${fileExt}`
    return fileName
  }

  async uploadFile(file) {
    const fileName = this.generateRandomFileName(file)
    await supabase.storage.from('images').upload(fileName, file)
    return fileName
  }

  async createMovie(movie) {
    const { data } = await supabase.from('movies').insert([movie]).select()
    const newMovie = data[0]
    this.movies = [...this.movies, newMovie]
    this.render(this.movies)
  }

  async updateMovie(movie) {
    const { data } = await supabase.from('movies').upsert(movie).select()
    const updatedMovie = data[0]
    this.movies = this.movies.map((item) => {
      if (item.id === updatedMovie.id) return updatedMovie
      return item
    })
    this.render(this.movies)
  }

  handleHideModalAddMovie() {
    this.$formAddMovie.reset()
  }

  async handleSubmitFormAddMovie(event) {
    event.preventDefault()

    const $buttonSubmit = this.$formAddMovie.querySelector(
      'button[type="submit"]'
    )
    $buttonSubmit.innerText = 'Adicionando...'
    $buttonSubmit.disabled = true

    const file = event.target.elements['cover'].files[0]
    const cover = await this.uploadFile(file)
    const title = event.target.elements['title']?.value
    const year = event.target.elements['year']?.value
    const gender = event.target.elements['gender']?.value
    const description = event.target.elements['description']?.value

    await this.createMovie({
      cover,
      title,
      year,
      gender,
      description,
    })
    $buttonSubmit.disabled = false
    $buttonSubmit.innerText = 'Adicionar'
    this.modalAddMovie.hide()
  }

  handleShowModalEditMovie(event) {
    const movieId = event.relatedTarget.getAttribute('data-movie-id')
    const movie = this.getMovieById(movieId)
    this.$formEditMovie.elements['title'].value = movie.title
    this.$formEditMovie.elements['year'].value = movie.year
    this.$formEditMovie.elements['gender'].value = movie.gender
    this.$formEditMovie.elements['description'].value = movie.description

    const $buttonSubmit = this.$formEditMovie.querySelector('[type="submit"]')
    $buttonSubmit.setAttribute('data-movie-id', movieId)
  }

  handleHideModalEditMovie() {
    this.$formEditMovie.reset()
  }

  async handleSubmitFormEditMovie(event) {
    event.preventDefault()

    const $buttonSubmit = this.$formEditMovie.querySelector('[type="submit"]')
    $buttonSubmit.innerText = 'Salvando...'
    $buttonSubmit.disabled = true
    const movieId = $buttonSubmit.getAttribute('data-movie-id')
    const movie = this.getMovieById(movieId)

    const file = event.target.elements['cover'].files[0]
    let cover

    if (file) {
      await this.deleteStorageImage(movie.cover)
      cover = await this.uploadFile(file)
    }
    const title = event.target.elements['title']?.value
    const year = event.target.elements['year']?.value
    const gender = event.target.elements['gender']?.value
    const description = event.target.elements['description']?.value

    await this.updateMovie({
      id: Number(movieId),
      cover,
      title,
      year,
      gender,
      description,
    })

    $buttonSubmit.innerText = 'Salvar'
    $buttonSubmit.disabled = false
    this.modalEditMovie.hide()
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
    this.handleHideModalAddMovie = this.handleHideModalAddMovie.bind(this)
    this.handleShowModalEditMovie = this.handleShowModalEditMovie.bind(this)
    this.handleHideModalEditMovie = this.handleHideModalEditMovie.bind(this)
    this.handleShowModalDeleteMovie = this.handleShowModalDeleteMovie.bind(this)
    this.handleClickDeleteMovieConfirm =
      this.handleClickDeleteMovieConfirm.bind(this)
    this.handleFilterMovies = this.handleFilterMovies.bind(this)
    this.handleSubmitFormAddMovie = this.handleSubmitFormAddMovie.bind(this)
    this.handleSubmitFormEditMovie = this.handleSubmitFormEditMovie.bind(this)
  }

  addEvents() {
    this.$buttonLogout.addEventListener('click', this.handleClickButtonLogout)
    this.modalAddMovie._element.addEventListener(
      'hide.bs.modal',
      this.handleHideModalAddMovie
    )
    this.modalEditMovie._element.addEventListener(
      'show.bs.modal',
      this.handleShowModalEditMovie
    )
    this.modalEditMovie._element.addEventListener(
      'hide.bs.modal',
      this.handleHideModalEditMovie
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
    this.$formAddMovie.addEventListener('submit', this.handleSubmitFormAddMovie)
    this.$formEditMovie.addEventListener(
      'submit',
      this.handleSubmitFormEditMovie
    )
  }

  init() {
    this.checkIsLoggedIn()
    this.bindEvents()
    this.addEvents()
    this.getMovies()
  }
}

const moviesPage = new MoviesPage({
  modalAddMovie: new Modal('#modalAddMovie'),
  modalEditMovie: new Modal('#modalEditMovie'),
  $buttonLogout: document.getElementById('buttonLogout'),
  $modalDeleteMovie: document.getElementById('modalDeleteMovie'),
  $modalDeleteMovieConfirm: document.getElementById('modalDeleteMovieConfirm'),
  $tableBody: document.getElementById('tableBody'),
  $searchInput: document.getElementById('searchInput'),
  $formAddMovie: document.getElementById('formAddMovie'),
  $formEditMovie: document.getElementById('formEditMovie'),
})

moviesPage.init()
