import { json } from '@sveltejs/kit';
import { extractFaceFeatures, extractVoiceFeatures } from '$lib/services/biometrics.js';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const type = formData.get('type');
    
    if (type === 'face') {
      const photo = formData.get('photo');
      
      if (!photo) {
        return json({ error: 'No photo provided' }, { status: 400 });
      }
      
      const features = await extractFaceFeatures(photo);
      
      return json({
        success: true,
        features
      });
      
    } else if (type === 'voice') {
      const recording = formData.get('recording');
      
      if (!recording) {
        return json({ error: 'No recording provided' }, { status: 400 });
      }
      
      const features = await extractVoiceFeatures(recording);
      
      return json({
        success: true,
        features
      });
      
    } else {
      return json({ error: 'Invalid biometric type' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Biometric processing error:', error);
    return json(
      { error: 'Failed to process biometric data' },
      { status: 500 }
    );
  }
}
