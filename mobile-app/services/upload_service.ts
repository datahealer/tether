import Constants from 'expo-constants';
import { getValidAccessToken } from './auth_service';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

export const uploadProfilePhoto = async (imageUri: string): Promise<string> => {
  try {
    // Create form data
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('photo', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    // Get auth token
    const token = await getValidAccessToken();

    // Upload to backend
    const response = await fetch(`${API_URL}/api/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.photoUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

