import { json } from '@sveltejs/kit';
import { generateAIInsights } from '$lib/services/gemini.js';
import { saveUser, saveUserBiometrics } from '$lib/services/database.js';
import { encryptData } from '$lib/services/encryption.js';
import { extractFaceFeatures, extractVoiceFeatures } from '$lib/services/biometrics.js';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    
    const personalInfo = JSON.parse(formData.get('personalInfo'));
    const additionalInfo = JSON.parse(formData.get('additionalInfo'));
    const photo = formData.get('photo');
    const voiceRecording = formData.get('voiceRecording');
    const faceFeatures = JSON.parse(formData.get('faceFeatures') || '{}');
    const voiceFeatures = JSON.parse(formData.get('voiceFeatures') || '{}');
    
    // Validate required fields
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.dateOfBirth) {
      return json({ error: 'Missing required personal information' }, { status: 400 });
    }
    
    if (!photo || !voiceRecording) {
      return json({ error: 'Missing required biometric data' }, { status: 400 });
    }
    
    // Process biometric data
    let processedFaceFeatures = faceFeatures;
    let processedVoiceFeatures = voiceFeatures;
    
    try {
      // Extract additional features if not provided
      if (Object.keys(faceFeatures).length === 0) {
        processedFaceFeatures = await extractFaceFeatures(photo);
      }
      
      if (Object.keys(voiceFeatures).length === 0) {
        processedVoiceFeatures = await extractVoiceFeatures(voiceRecording);
      }
    } catch (error) {
      console.error('Error processing biometric data:', error);
      // Continue with registration even if feature extraction fails
    }
    
    // Generate AI insights
    const aiInsights = await generateAIInsights({
      personalInfo,
      additionalInfo,
      faceFeatures: processedFaceFeatures,
      voiceFeatures: processedVoiceFeatures
    });
    
    // Encrypt sensitive data
    const encryptedBiometrics = {
      photo: await encryptData(photo),
      voiceRecording: await encryptData(voiceRecording),
      faceFeatures: await encryptData(JSON.stringify(processedFaceFeatures)),
      voiceFeatures: await encryptData(JSON.stringify(processedVoiceFeatures))
    };
    
    // Save user data
    const userData = {
      ...personalInfo,
      ...additionalInfo,
      aiInsights,
      registrationDate: new Date().toISOString(),
      status: 'active'
    };
    
    const user = await saveUser(userData);
    await saveUserBiometrics(user.id, encryptedBiometrics);
    
    // Return user data (without sensitive biometric info)
    return json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        registrationDate: user.registrationDate,
        status: user.status
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
