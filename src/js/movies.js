import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

async function getMovies() {
  const { data: movies, error } = await supabase.from('movies').select('*')

  console.log(movies)
}

getMovies()
