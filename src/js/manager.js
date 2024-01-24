import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const formManager = document.getElementById('formManager')
const inputFile = document.getElementById('inputFile')
const inputTitle = document.getElementById('inputTitle')
const inputYear = document.getElementById('inputYear')
const genresCheckbox = document.querySelectorAll('.form-check-input')
const inputDescription = document.getElementById('inputDescription')
const buttonSubmit = document.getElementById('buttonSubmit')

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

async function loadMovieFromSupabase(id) {
  const { data, error } = await supabase.from('movies').select('*').eq('id', id)

  if (error) {
    console.error(error)
  } else {
    const movie = data[0]
    inputTitle.value = movie.title
    inputYear.value = movie.year
    inputDescription.value = movie.description

    const genderArray = movie.gender.split(', ')
    genderArray.forEach(gender => {
      const checkbox = document.querySelector(`input[value="${gender}"]`)
      checkbox.checked = true
    })
  }
}

if (id) {
  loadMovieFromSupabase(id)
}

formManager.addEventListener('submit', async (event) => {
  event.preventDefault()
  buttonSubmit.disabled = true
  buttonSubmit.innerText = 'Carregando...'

  const file = inputFile.files[0]
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const cover = `https://kvhwrzkhtauuzeucwqtb.supabase.co/storage/v1/object/public/images/${fileName}`
  await supabase.storage.from('images').upload(fileName, file)

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
})
