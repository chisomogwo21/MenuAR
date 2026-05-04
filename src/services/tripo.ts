const TRIPO_API_KEY = import.meta.env.VITE_TRIPO_API_KEY
const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi'

// STEP 1 — Upload image and create task
export async function submitImageTo3D(
  imageFile: File
): Promise<string> {
  
  // First upload the image to Tripo
  const formData = new FormData()
  formData.append('file', imageFile)
  
  const uploadRes = await fetch(
    `${TRIPO_BASE_URL}/upload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`
      },
      body: formData
    }
  )
  
  if (!uploadRes.ok) {
    const err = await uploadRes.json()
    throw new Error(err.message || 'Image upload failed')
  }
  
  const uploadData = await uploadRes.json()
  const imageToken = uploadData.data.image_token
  
  // Then create the image-to-3D task
  const taskRes = await fetch(
    `${TRIPO_BASE_URL}/task`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'image_to_model',
        file: {
          type: 'jpg',
          file_token: imageToken
        }
      })
    }
  )
  
  if (!taskRes.ok) {
    const err = await taskRes.json()
    throw new Error(err.message || 'Task creation failed')
  }
  
  const taskData = await taskRes.json()
  return taskData.data.task_id
}

// STEP 2 — Poll for task completion
export async function pollTripoTask(
  taskId: string
): Promise<string> {
  const maxAttempts = 40
  const pollInterval = 6000
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => 
      setTimeout(resolve, pollInterval)
    )
    
    const res = await fetch(
      `${TRIPO_BASE_URL}/task/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${TRIPO_API_KEY}`
        }
      }
    )
    
    const data = await res.json()
    const task = data.data
    
    if (task.status === 'success') {
      // Return the GLB model URL
      return task.output.model
    }
    
    if (task.status === 'failed') {
      throw new Error(
        '3D generation failed. Try a photo with ' +
        'a cleaner background.'
      )
    }
    
    // status: queued or running — keep polling
  }
  
  throw new Error(
    '3D generation timed out. Please try again.'
  )
}

// STEP 3 — Download GLB and save to Supabase
export async function saveModelToSupabase(
  glbUrl: string,
  menuItemId: string,
  supabaseClient: any
): Promise<string> {
  const response = await fetch(glbUrl)
  const blob = await response.blob()
  
  const fileName = `${menuItemId}-${Date.now()}.glb`
  
  const { error } = await supabaseClient.storage
    .from('dish-models')
    .upload(fileName, blob, {
      contentType: 'model/gltf-binary',
      upsert: true
    })
  
  if (error) throw error
  
  const { data: urlData } = supabaseClient.storage
    .from('dish-models')
    .getPublicUrl(fileName)
  
  return urlData.publicUrl
}
