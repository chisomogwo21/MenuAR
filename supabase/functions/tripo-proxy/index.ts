import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const TRIPO_API_KEY = Deno.env.get('TRIPO_API_KEY')
    const { action, taskId, imageBase64, fileType } = await req.json()

    if (action === 'upload') {
      // Convert base64 to binary data
      const binaryStr = atob(imageBase64)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'image/' + fileType })
      
      const formData = new FormData()
      formData.append('file', blob, 'dish.' + fileType)
      
      const uploadRes = await fetch('https://api.tripo3d.ai/v2/openapi/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TRIPO_API_KEY}`
        },
        body: formData
      })
      
      const uploadData = await uploadRes.json()
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || 'Upload failed')
      }
      
      // Create the 3D task
      const taskRes = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TRIPO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'image_to_model',
          file: {
            type: fileType,
            file_token: uploadData.data.image_token
          }
        })
      })
      
      const taskData = await taskRes.json()
      
      return new Response(
        JSON.stringify({ task_id: taskData.data.task_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'poll') {
      const pollRes = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${TRIPO_API_KEY}`
        }
      })
      
      const pollData = await pollRes.json()
      
      return new Response(
        JSON.stringify(pollData.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
