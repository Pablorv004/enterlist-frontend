import { ref } from 'vue';

export function useFileUpload() {
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const uploadError = ref<string | null>(null);
  const uploadedFileUrl = ref<string | null>(null);

  const uploadFile = async (
    file: File,
    uploadUrl: string,
    headers: Record<string, string> = {}
  ): Promise<string> => {
    if (!file) {
      throw new Error('No file selected');
    }

    isUploading.value = true;
    uploadProgress.value = 0;
    uploadError.value = null;
    uploadedFileUrl.value = null;

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Create XHR request to track progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            uploadProgress.value = Math.round((event.loaded / event.total) * 100);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.response);
            uploadedFileUrl.value = response.url;
            isUploading.value = false;
            resolve(response.url);
          } else {
            uploadError.value = `Upload failed: ${xhr.statusText}`;
            isUploading.value = false;
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          uploadError.value = 'Upload failed due to network error';
          isUploading.value = false;
          reject(new Error('Upload failed due to network error'));
        });

        xhr.addEventListener('abort', () => {
          uploadError.value = 'Upload aborted';
          isUploading.value = false;
          reject(new Error('Upload aborted'));
        });

        xhr.open('POST', uploadUrl, true);
        
        // Set headers
        Object.keys(headers).forEach(key => {
          xhr.setRequestHeader(key, headers[key]);
        });

        xhr.send(formData);
      });
    } catch (error: any) {
      isUploading.value = false;
      uploadError.value = error.message || 'Upload failed';
      throw error;
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadedFileUrl,
    uploadFile
  };
}
