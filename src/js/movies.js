import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

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
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">Editar</button>
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

      if (error) {
        console.error("Erro ao deletar o filme:", error.message);
      } else {
        console.log("Filme deletado com sucesso!");
        const trToDelete = document.querySelector(`tr[data-id="${id}"]`)
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