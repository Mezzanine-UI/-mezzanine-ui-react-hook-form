import axios from 'axios';
import { Message } from '@mezzanine-ui/react';
import { useCallback } from 'react';
import { FieldValues, Path, UseFormSetValue } from 'react-hook-form';
import { byteToMegaByte, megaByteToByte } from '../utils/file';
import { UploadResponse, UploadStatus } from './../typings/file';

function readFile(file: File) {
  return new Promise<string | ArrayBuffer | null>((resolve) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}

export interface UseUploadHandlersProps<Response extends UploadResponse> {
  url: string,
  bearerToken?: string;
  fileExtensions: string[];
  registerName: Path<any>;
  sizeLimit?: number;
  setCropperOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setImageSrc: React.Dispatch<React.SetStateAction<string>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<UploadStatus>>;
  setValue: UseFormSetValue<FieldValues>;
  resolve: (res: Response) => any,
}

export const useUploadHandlers = <Response extends UploadResponse>({
  url,
  bearerToken,
  fileExtensions,
  registerName,
  sizeLimit,
  resolve,
  setCropperOpen,
  setImageSrc,
  setProgress,
  setStatus,
  setValue,
}: UseUploadHandlersProps<Response>) => {
  const handleFileGuard = useCallback((file: File): boolean => {
    const checkFileSize = () => {
      Message.info?.(`上傳檔案大小：${byteToMegaByte(file.size).toFixed(1)} Mb`);

      if (file.size < megaByteToByte(sizeLimit || Infinity)) return true;

      Message.error?.('檔案大小超過限制');

      return false;
    };

    const checkFileExtension = () => {
      const someFileAcceptExtension = fileExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

      if (someFileAcceptExtension) return true;

      Message.error?.('檔案格式不支援');

      return false;
    };

    return (checkFileSize() && checkFileExtension());
  }, [sizeLimit]);

  const handleResetStatus = useCallback(() => {
    setTimeout(() => {
      setProgress(0);
      setStatus('ready');
    }, 1000);
  }, [setProgress, setStatus]);

  const handleFileToCrop = useCallback(
    async (file: File) => {
      try {
        if (!handleFileGuard(file)) return;
        const imageDataUrl = await readFile(file);

        setCropperOpen(true);
        setStatus('uploading');
        setImageSrc(String(imageDataUrl));
      } catch (e) {
        setStatus('error');
        handleResetStatus();
      }
    },
    [handleFileGuard, handleResetStatus, setCropperOpen, setImageSrc, setStatus],
  );

  const handleCroppedFileUpload = useCallback(
    async (croppedFile: string | Blob) => {
      try {
        const Authorization = bearerToken
          ? `Bearer ${bearerToken}`
          : '';

        const formData = new FormData();

        const uploadFileSize = (new File(
          [croppedFile],
          '',
          { type: 'image/jpeg' },
        )).size;

        Message.info?.(`檔案大小: ${byteToMegaByte(uploadFileSize).toFixed(1)} Mb`);

        formData.append('file', croppedFile);

        const { data } = await axios.post<Response>(
          url,
          formData,
          {
            headers: {
              Authorization,
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: any) => {
              const progressPercentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );

              setProgress(progressPercentage);
            },
          },
        );

        if (data?.id) {
          setValue(registerName, resolve(data));
          setStatus('success');

          Message.success?.('上傳成功');

          handleResetStatus();

          return true;
        }
      } catch (e: any) {
        setValue(registerName, null);
        setStatus('error');
        Message.error(`[${e?.message}] 上傳失敗`);

        return false;
      }
    },
    [handleResetStatus, setValue, setProgress, setStatus],
  );

  return {
    handleFileToCrop,
    handleCroppedFileUpload,
  };
};