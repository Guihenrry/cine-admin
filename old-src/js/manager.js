import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const BASE_BUCKET_URL =
  'https://kvhwrzkhtauuzeucwqtb.supabase.co/storage/v1/object/public/images/'

const formManager = document.getElementById('formManager')
const inputFile = document.getElementById('inputFile')
const inputTitle = document.getElementById('inputTitle')
const inputYear = document.getElementById('inputYear')
const genresCheckbox = document.querySelectorAll('.form-check-input')
const inputDescription = document.getElementById('inputDescription')
const buttonSubmit = document.getElementById('buttonSubmit')
const fileUploadPreview = document.querySelector('.file-upload-img')

let movieCover = ''

const urlParams = new URLSearchParams(window.location.search)
const id = urlParams.get('id')

async function loadMovieFromSupabase(id) {
  const { data, error } = await supabase.from('movies').select('*').eq('id', id)

  if (error) {
    console.error(error)
  } else {
    const movie = data[0]
    inputTitle.value = movie.title
    inputYear.value = movie.year
    inputDescription.value = movie.description
    fileUploadPreview.src = movie.cover
    movieCover = movie.cover
    inputFile.removeAttribute('required')

    const genderArray = movie.gender.split(', ')
    genderArray.forEach((gender) => {
      const checkbox = document.querySelector(`input[value="${gender}"]`)
      checkbox.checked = true
    })
  }
}

if (id) {
  loadMovieFromSupabase(id)
}

function handleChangeFile(event) {
  const file = event.target.files[0]

  if (file) {
    const reader = new FileReader()
    reader.onloadend = function () {
      fileUploadPreview.src = reader.result
    }
    reader.readAsDataURL(file)
  } else {
    fileUploadPreview.src = movieCover
  }
}

inputFile.addEventListener('change', handleChangeFile)

async function handleSubmit(event) {
  event.preventDefault()
  buttonSubmit.disabled = true
  buttonSubmit.innerText = 'Carregando...'

  const file = inputFile.files[0]
  let cover
  if (file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    if (movieCover) {
      const fileNameMovie = movieCover.replace(BASE_BUCKET_URL, '')
      await supabase.storage.from('images').remove([fileNameMovie])
    }
    await supabase.storage.from('images').upload(fileName, file)
    cover = `${BASE_BUCKET_URL}${fileName}`
  }

  const gender = Array.from(genresCheckbox)
    .filter(function (checkbox) {
      return checkbox.checked
    })
    .map(function (checkbox) {
      return checkbox.value
    })
    .join(', ')

  const movie = {
    id: id ? Number(id) : undefined,
    title: inputTitle.value,
    year: inputYear.value,
    cover: cover,
    gender: gender,
    description: inputDescription.value,
  }

  await supabase.from('movies').upsert(movie).select()

  window.location.href = 'movies.html'
}

formManager.addEventListener('submit', handleSubmit)
