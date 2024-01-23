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

  tableBody.innerHTML = '';

  movies.forEach(movie => {
    const newRow = document.createElement('tr');

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
        <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#exampleModal">Delete</button>
      </td>
    `;

    tableBody.appendChild(newRow);
  });

  searchInput.addEventListener('input', filterMovies);
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