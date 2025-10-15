import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';

const FS = FileSystem as any;

interface Collection {
  id: string;
  name: string;
  logo: string;
  images: string[];
  createdAt: string;
}

export default function EditCollection() {
  const params = useLocalSearchParams();
  const id = params.id as string | undefined;
  const router = useRouter();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) loadCollection(id);
  }, [id]);

  const loadCollection = async (collectionId: string) => {
    try {
      const data = await AsyncStorage.getItem('collections');
      if (!data) return;
      const arr = JSON.parse(data) as Collection[];
      const found = arr.find(c => c.id === collectionId);
      if (found) {
        setCollection(found);
        setName(found.name);
        setLogo(found.logo);
        setImages(found.images || []);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load collection');
    }
  };

  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const resultAny = (await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 })) as any;
    if (resultAny.canceled) return;
    if (resultAny.assets && resultAny.assets.length > 0) {
      setLogo(resultAny.assets[0].uri as string);
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const resultAny = (await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 })) as any;
    if (resultAny.canceled) return;
    if (resultAny.assets) {
      const newUris = (resultAny.assets as any[]).map(a => a.uri).filter(Boolean) as string[];
      setImages(prev => [...prev, ...newUris]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!collection) return;
    if (!name.trim()) { Alert.alert('Error', 'Please provide a name'); return; }

    setLoading(true);
    try {
      const documentDirectory = FS.documentDirectory;
      if (!documentDirectory) throw new Error('No FS');
      const collectionDir = `${documentDirectory}collections/${name}/`;

      // If name changed and old folder exists, rename folder
      const oldDir = `${documentDirectory}collections/${collection.name}/`;
      if (collection.name !== name) {
        // Move directory if exists
        try {
          const exists = await FS.getInfoAsync(oldDir);
          if (exists.exists) {
            await FS.moveAsync({ from: oldDir, to: collectionDir });
          } else {
            await FS.makeDirectoryAsync(collectionDir, { intermediates: true });
          }
        } catch (e) {
          // fallback to ensure dir
          await FS.makeDirectoryAsync(collectionDir, { intermediates: true });
        }
      } else {
        await FS.makeDirectoryAsync(collectionDir, { intermediates: true });
      }

      // Save logo if it's a new URI (not already in our collection dir)
      let logoPath = collection.logo;
      if (logo && !logo.startsWith(collectionDir)) {
        const ext = logo.split('.').pop();
        logoPath = `${collectionDir}logo.${ext}`;
        await FS.copyAsync({ from: logo, to: logoPath });
      }

      // Save images: copy any images not already in collectionDir
      const savedPaths: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.startsWith(collectionDir)) {
          savedPaths.push(img);
          continue;
        }
        const ext = img.split('.').pop();
        const dest = `${collectionDir}image_${i}.${ext}`;
        await FS.copyAsync({ from: img, to: dest });
        savedPaths.push(dest);
      }

      // Cleanup: remove files in collectionDir that are not in savedPaths (including old logo if replaced)
      try {
        const files = await FS.readDirectoryAsync(collectionDir);
        for (const fileName of files) {
          const fullPath = `${collectionDir}${fileName}`;
          if (!savedPaths.includes(fullPath) && fullPath !== logoPath) {
            // delete unreferenced file
            try { await FS.deleteAsync(fullPath, { idempotent: true }); } catch (e) { /* ignore */ }
          }
        }
      } catch (e) {
        // ignore cleanup failures
      }

      // Update AsyncStorage
      const data = await AsyncStorage.getItem('collections');
      const arr = data ? JSON.parse(data) as Collection[] : [];
      const updated = arr.map(c => c.id === collection.id ? { ...c, name, logo: logoPath, images: savedPaths } : c);
      await AsyncStorage.setItem('collections', JSON.stringify(updated));

      Alert.alert('Saved', 'Collection updated', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  if (!collection) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <Text className="text-2xl font-bold mb-4">Edit Collection</Text>

      <Text className="text-lg font-semibold">Name</Text>
      <TextInput value={name} onChangeText={setName} className="bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-lg my-2" />

      <Text className="text-lg font-semibold mt-4">Logo</Text>
      <TouchableOpacity className="bg-blue-500 rounded-xl p-3 mt-2 items-center" onPress={pickLogo}>
        <Text className="text-white">Change Logo</Text>
      </TouchableOpacity>
      {logo && (
        <View className="mt-4 items-center">
          <Image source={{ uri: logo }} className="w-32 h-32 rounded-xl" />
        </View>
      )}

      <Text className="text-lg font-semibold mt-4">Images ({images.length})</Text>
      <TouchableOpacity className="bg-green-500 rounded-xl p-3 mt-2 items-center" onPress={pickImages}>
        <Text className="text-white">Add Images</Text>
      </TouchableOpacity>

      <View className="flex-row flex-wrap mt-4">
        {images.map((img, idx) => (
          <View key={idx} className="w-1/3 p-1">
            <Image source={{ uri: img }} className="w-full h-24 rounded-lg" />
            <TouchableOpacity className="absolute top-2 right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center" onPress={() => removeImage(idx)}>
              <Text className="text-white font-bold">×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity className="bg-purple-600 rounded-xl p-4 items-center mt-6" onPress={save}>
        <Text className="text-white font-bold text-xl">{loading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="bg-gray-300 rounded-xl p-4 items-center mt-3" onPress={() => router.back()}>
        <Text className="text-gray-700 font-semibold text-lg">Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
