import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const BASE_BUCKET_URL =
  'https://kvhwrzkhtauuzeucwqtb.supabase.co/storage/v1/object/public/images/'

async function getMovies() {
  const { data: movies, error } = await supabase.from('movies').select('*');

  if (error) {
    console.error('Erro ao obter os filmes:', error.message);
    return;
  }

  const tableBody = document.querySelector('.table tbody');
  const searchInput = document.getElementById('searchInput');
  searchInput.removeEventListener('input', filterMovies);

  tableBody.innerHTML = '';

  movies.forEach(movie => {
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', movie.id)

    newRow.innerHTML = `
      <td>
        <img src="${movie.cover}" class="img-2" />
      </td>
      <td>${movie.title}</td>
      <td>${movie.description}</td>
      <td>${movie.gender}</td>
      <td>${movie.year}</td>
      <td>
        <a href="./manager.html?id=${movie.id}" class="btn btn-primary">Editar</a>
        <button type="button" class="btn btn-danger button-delete" data-id="${movie.id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(newRow);
  });
  
  const buttonsDelete = document.querySelectorAll('.button-delete');

  buttonsDelete.forEach((button) => {
    button.addEventListener('click', handleDelete)
  })

  searchInput.addEventListener('input', filterMovies);
}

async function handleDelete(event) {
  const id = event.target.dataset.id

  const confirmDelete = confirm("Você realmente deseja deletar o filme?");

  if (confirmDelete) {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);
      
      const trToDelete = document.querySelector(`tr[data-id="${id}"]`)
      const imgToDelete = trToDelete.querySelector('img').src.replace(BASE_BUCKET_URL, '')
      await supabase.storage.from('images').remove([imgToDelete])

      if (error) {
        console.error("Erro ao deletar o filme:", error.message);
      } else {
        console.log("Filme deletado com sucesso!");
        trToDelete.remove()
      }
    } catch (error) {
      console.error("Erro inesperado:", error.message);
    }
  } else {
    console.log("Operação de exclusão cancelada pelo usuário.");
  }
}

function filterMovies() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.toLowerCase();

  const tableRows = document.querySelectorAll('.table tbody tr');

  tableRows.forEach(row => {
    const title = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
    const shouldDisplay = title.includes(searchTerm);
    row.style.display = shouldDisplay ? '' : 'none';
  });
}

getMovies();


"Botão de sair - Logout"

document.getElementById('logout').addEventListener('click', async function() {
  await logoutUser();
});

// Função de fazer logout do usuário
async function logoutUser() {
  try {
      const { error } = await supabase.auth.signOut();
      if (error) {
          console.error('Erro ao fazer logout:', error.message);
          alert('Erro ao fazer logout. Por favor, tente novamente.');
      } else {
          console.log('Usuário desconectado com sucesso.');
          // Redirecionei o usuário para tela de login
          window.location.href = 'http://localhost:8080/login';
      }
  } catch (error) {
      console.error('Erro inesperado ao fazer logout:', error);
      alert('Ocorreu um erro inesperado ao fazer logout. Por favor, tente novamente mais tarde.');
  }
}