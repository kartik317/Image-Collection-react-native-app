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

      const oldDir = `${documentDirectory}collections/${collection.name}/`;
      if (collection.name !== name) {
        try {
          const exists = await FS.getInfoAsync(oldDir);
          if (exists.exists) {
            await FS.moveAsync({ from: oldDir, to: collectionDir });
          } else {
            await FS.makeDirectoryAsync(collectionDir, { intermediates: true });
          }
        } catch (e) {
          await FS.makeDirectoryAsync(collectionDir, { intermediates: true });
        }
      } else {
        await FS.makeDirectoryAsync(collectionDir, { intermediates: true });
      }

      let logoPath = collection.logo;
      if (logo && !logo.startsWith(collectionDir)) {
        const ext = logo.split('.').pop();
        logoPath = `${collectionDir}logo.${ext}`;
        await FS.copyAsync({ from: logo, to: logoPath });
      }

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

      try {
        const files = await FS.readDirectoryAsync(collectionDir);
        for (const fileName of files) {
          const fullPath = `${collectionDir}${fileName}`;
          if (!savedPaths.includes(fullPath) && fullPath !== logoPath) {
            try { await FS.deleteAsync(fullPath, { idempotent: true }); } catch (e) { /* ignore */ }
          }
        }
      } catch (e) {
        // ignore cleanup failures
      }

      const data = await AsyncStorage.getItem('collections');
      const arr = data ? JSON.parse(data) as Collection[] : [];
      const updated = arr.map(c => c.id === collection.id ? { ...c, name, logo: logoPath, images: savedPaths } : c);
      await AsyncStorage.setItem('collections', JSON.stringify(updated));

      Alert.alert('Saved', 'Collection updated', [{ text: 'OK', onPress: () => router.push('/collections') }]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  if (!collection) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <Text className="text-gray-400 text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-950">
      <View className="p-6 pt-12">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-5xl font-bold text-white mb-2">
            Edit Collection
          </Text>
          <View className="h-1 w-20 bg-blue-500 rounded-full" />
          <Text className="text-gray-400 mt-3 text-base">
            Update your collection details
          </Text>
        </View>

        {/* Collection Name */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
            COLLECTION NAME
          </Text>
          <View className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <TextInput
              value={name}
              onChangeText={setName}
              className="px-5 py-4 text-white text-lg"
              placeholder="Enter collection name"
              placeholderTextColor="#6b7280"
            />
          </View>
        </View>

        {/* Logo */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
            COLLECTION LOGO
          </Text>
          <TouchableOpacity
            className="bg-blue-600 rounded-2xl p-5 items-center shadow-lg"
            onPress={pickLogo}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">
              {logo ? '✓ Change Logo' : '+ Select Logo'}
            </Text>
          </TouchableOpacity>

          {logo && (
            <View className="mt-6 items-center">
              <View className="bg-gray-900 p-2 rounded-3xl border-2 border-gray-800 shadow-2xl">
                <Image
                  source={{ uri: logo }}
                  className="w-40 h-40 rounded-2xl"
                />
              </View>
            </View>
          )}
        </View>

        {/* Images */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-300 tracking-wide">
              COLLECTION IMAGES
            </Text>
            <View className="bg-gray-800 px-4 py-2 rounded-full">
              <Text className="text-purple-400 font-bold text-sm">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-emerald-600 rounded-2xl p-5 items-center shadow-lg"
            onPress={pickImages}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">+ Add Images</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View className="flex-row flex-wrap mt-6 -mx-1">
              {images.map((img, idx) => (
                <View key={idx} className="w-1/3 p-1">
                  <View className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <Image
                      source={{ uri: img }}
                      className="w-full h-28"
                    />
                    <TouchableOpacity
                      className="absolute top-2 right-2 bg-red-500 rounded-full w-8 h-8 items-center justify-center shadow-lg"
                      onPress={() => removeImage(idx)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white font-bold text-lg">×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="space-y-3 mb-8">
          <TouchableOpacity
            className="bg-purple-600 rounded-2xl p-5 items-center shadow-2xl"
            onPress={save}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text className="text-white font-bold text-xl">
              {loading ? '⏳ Saving...' : '💾 Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-800 border border-gray-700 rounded-2xl p-5 items-center mt-3"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text className="text-gray-300 font-semibold text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}