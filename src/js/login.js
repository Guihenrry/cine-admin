import Toast from 'bootstrap/js/dist/toast'
import supabase from './services/supabase'

const formLogin = document.getElementById('formLogin')
const buttonSubmit = document.getElementById('buttonSubmit')
const toastErrorLogin = document.getElementById('toastErrorLogin')
const toast = Toast.getOrCreateInstance(toastErrorLogin)

function setLoadingState(isLoading) {
  buttonSubmit.disabled = isLoading
  buttonSubmit.innerText = isLoading ? 'Carregando...' : 'Entrar'
}

async function handleFormSubmit(event) {
  event.preventDefault()
  if (!event.target.checkValidity()) return

  const email = event.target.elements['email']?.value
  const password = event.target.elements['password']?.value

  setLoadingState(true)
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  setLoadingState(false)

  if (error) {
    console.error(error)
    toast.show()
  } else {
    window.location.href = 'index.html'
  }
}

formLogin.addEventListener('submit', handleFormSubmit)
