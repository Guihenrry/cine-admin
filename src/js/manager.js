import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const formManager = document.getElementById('formManager')
const inputFile = document.getElementById('inputFile')
const inputTitle = document.getElementById('inputTitle')
const genresCheckbox = document.querySelectorAll('.form-check-input')
const inputDescription = document.getElementById('inputDescription')
const buttonSubmit = document.getElementById('buttonSubmit')

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
    title: inputTitle.value,
    year: inputYear.value,
    cover: cover,
    gender: gender,
    description: inputDescription.value,
  }

  await supabase.from('movies').insert([movie]).select()

  window.location.href = 'movies.html'
})
