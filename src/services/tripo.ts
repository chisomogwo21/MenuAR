import { supabase } from '../lib/supabase'

export async function submitImageTo3D(
  imageFile: File
): Promise<string> {
  // Convert file to base64
  const base64 = await new Promise<string>(
    (resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(imageFile)
    }
  )
  
  const fileType = imageFile.name
    .split('.').pop()?.toLowerCase() || 'jpg'
  
  const { data, error } = await supabase
    .functions.invoke('tripo-proxy', {
      body: { 
        action: 'upload', 
        imageBase64: base64,
        fileType 
      }
    })
  
  if (error) throw error
  if (data.error) throw new Error(data.error)
  
  return data.task_id
}

export async function pollTripoTask(
  taskId: string
): Promise<string> {
  const maxAttempts = 40
  const pollInterval = 6000
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => 
      setTimeout(r, pollInterval)
    )
    
    const { data, error } = await supabase
      .functions.invoke('tripo-proxy', {
        body: { action: 'poll', taskId }
      })
    
    if (error) throw error
    
    if (data.status === 'success') {
      return data.output.model
    }
    
    if (data.status === 'failed') {
      throw new Error(
        'Generation failed: ' + 
        (data.error?.message || 
         'Try a photo with clean background')
      )
    }
  }
  
  throw new Error('Generation timed out')
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
