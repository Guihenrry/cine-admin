import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const formUpload = document.getElementById('formUpload')
const inputFile = document.getElementById('inputFile')

const images = document.getElementById('images')

formUpload.addEventListener('submit', async (event) => {
  event.preventDefault()

  const file = inputFile.files[0]

  if (file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (error) {
      console.error(error)
    } else {
      const img = document.createElement('img')
      img.src = `https://kvhwrzkhtauuzeucwqtb.supabase.co/storage/v1/object/public/images/${filePath}`
      images.appendChild(img)
    }
  }
})
