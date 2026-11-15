// Share an image together with a text caption (prayer preview + app link).
//
// Development / real app build: uses react-native-share, which sends the image AND the
//   caption together in one tap (WhatsApp, Instagram, Facebook, …).
// Expo Go (react-native-share isn't available there): falls back to copying the text and
//   sharing the image only.
import { Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import RNShare from 'react-native-share';

/** Returns true if the fallback was used and the text was copied to the clipboard. */
export async function shareImageWithText(imageUri: string, text: string, title?: string): Promise<boolean> {
  // 1. Image + caption together
  try {
    await RNShare.open({
      url: imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`,
      type: 'image/jpeg',
      message: text,
      title,
      failOnCancel: false,
    });
    return false;
  } catch {
    // Not available (e.g. Expo Go) → fallback below
  }

  // 2. Fallback
  if (Platform.OS === 'ios') {
    await Share.share({ url: imageUri, message: text });
    return false;
  }
  await Clipboard.setStringAsync(text);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(imageUri, { mimeType: 'image/jpeg', dialogTitle: title });
  } else {
    await Share.share({ message: text });
  }
  return true;
}
