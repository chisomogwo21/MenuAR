import { useState } from 'react';
import { 
  submitImageTo3D, 
  pollTripoTask,
  saveModelToSupabase 
} from '../services/tripo';
import { supabase } from '../lib/supabase';

export function useImageTo3D() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const generateModel = async (imageFile: File, menuItemId: string) => {
    setGenerating(true);
    setStatus('Submitting to Tripo3D...');
    setProgress(10);

    try {
      const taskId = await submitImageTo3D(imageFile);
      setProgress(30);
      setStatus('Generating with Tripo3D... (~1-2 mins)');

      const glbUrl = await pollTripoTask(taskId);
      setProgress(80);
      setStatus('Saving to Supabase...');

      const publicUrl = await saveModelToSupabase(glbUrl, menuItemId, supabase);
      setProgress(100);
      setStatus('Done');
      
      return publicUrl;
    } catch (error: any) {
      console.error('Tripo3D Error:', error);
      
      let userMessage = 'Generation failed. Use a photo with a clean background and single dish centered.';
      
      if (error.message?.includes('402')) {
        userMessage = 'Tripo3D credits low. Visit tripo3d.ai to top up.';
      } else if (error.message?.includes('timeout')) {
        userMessage = 'Taking longer than expected. Check your Tripo3D dashboard for the model status.';
      }
      
      throw new Error(userMessage);
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
        setStatus('');
      }, 2000);
    }
  };

  return {
    generateModel,
    generating,
    progress,
    status
  };
}
