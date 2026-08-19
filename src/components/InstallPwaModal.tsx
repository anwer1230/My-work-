import React from 'react';
import { TelegramApkInstallModal, TelegramApkInstallModalProps } from './TelegramApkInstallModal';

export const InstallPwaModal: React.FC<TelegramApkInstallModalProps> = (props) => {
  return <TelegramApkInstallModal {...props} />;
};

export default InstallPwaModal;
