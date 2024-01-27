import Toast from 'bootstrap/js/dist/toast'

import supabase from './services/supabase'

class LoginPage {
  setLoadingState(isLoading) {
    const buttonSubmit = this.$formLogin.querySelector('[type="submit"]')
    buttonSubmit.disabled = isLoading
    buttonSubmit.innerText = isLoading ? 'Carregando...' : 'Entrar'
  }

  async login(credentials) {
    this.setLoadingState(true)
    const response = await supabase.auth.signInWithPassword(credentials)
    this.setLoadingState(false)
    return response
  }

  redirectToMoviesPage() {
    window.location.href = 'index.html'
  }

  async handleFormSubmit(event) {
    event.preventDefault()

    const credentials = {
      email: event.target.elements['email']?.value,
      password: event.target.elements['password']?.value,
    }

    const { error } = await this.login(credentials)

    if (error) {
      console.error(error)
      this.toast.show()
    } else {
      this.redirectToMoviesPage()
    }
  }

  bindEvents() {
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
  }

  addEvents() {
    this.$formLogin.addEventListener('submit', this.handleFormSubmit)
  }

  init() {
    this.bindEvents()
    this.addEvents()
  }

  constructor({ toast, $formLogin }) {
    this.toast = toast
    this.$formLogin = $formLogin
  }
}

const loginPage = new LoginPage({
  toast: Toast.getOrCreateInstance(document.getElementById('toastErrorLogin')),
  $formLogin: document.getElementById('formLogin'),
})

loginPage.init()
