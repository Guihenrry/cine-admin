import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const formLogin = document.getElementById('formLogin')
const inputEmail = document.getElementById('email')
const inputPassword = document.getElementById('password')
const errorMessage = document.getElementById('errorMessage')

function resetError() {
  inputEmail.classList.remove('is-invalid')
  inputPassword.classList.remove('is-invalid')
  errorMessage.classList.add('d-none')
}

inputEmail.addEventListener('focus', resetError)
inputPassword.addEventListener('focus', resetError)

formLogin.addEventListener('submit', async (event) => {
  event.preventDefault()
  const email = inputEmail.value
  const password = inputPassword.value

  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (response.error) {
    inputEmail.classList.add('is-invalid')
    inputPassword.classList.add('is-invalid')
    errorMessage.classList.remove('d-none')
  } else {
    window.location.href = 'movies.html'
  }
})
