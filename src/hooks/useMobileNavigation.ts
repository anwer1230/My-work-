import { useEffect } from 'react';
import { useTelegram } from '../context/TelegramContext';

/**
 * Mobile and Hardware Back Button (Popstate) & History Stack Controller
 * Handles Android hardware back button, mobile browser gestures, and Escape key.
 */
export function useMobileNavigation() {
  const {
    activeChatId,
    setActiveChatId,
    isDrawerOpen,
    setIsDrawerOpen,
    isRightPanelOpen,
    setIsRightPanelOpen,
    activeModal,
    setActiveModal,
    viewerMedia,
    setViewerMedia,
    chatContextMenu,
    setChatContextMenu,
    messageContextMenu,
    setMessageContextMenu,
    selectedMessageIds,
    clearSelectedMessages,
    editingMessage,
    setEditingMessage,
    replyingTo,
    setReplyingTo,
  } = useTelegram();

  // Push history state whenever a view/modal opens so that hardware Back button intercepts it
  useEffect(() => {
    const hasOpenOverlay =
      Boolean(activeChatId) ||
      isDrawerOpen ||
      isRightPanelOpen ||
      activeModal !== 'none' ||
      Boolean(viewerMedia) ||
      Boolean(chatContextMenu) ||
      Boolean(messageContextMenu) ||
      selectedMessageIds.length > 0;

    if (hasOpenOverlay) {
      window.history.pushState({ tgNav: true, timestamp: Date.now() }, '');
    }
  }, [
    activeChatId,
    isDrawerOpen,
    isRightPanelOpen,
    activeModal,
    Boolean(viewerMedia),
    Boolean(chatContextMenu),
    Boolean(messageContextMenu),
    selectedMessageIds.length,
  ]);

  // Handle hardware / browser back button popstate
  useEffect(() => {
    const handlePopState = () => {
      // 1. Close Context menus
      if (chatContextMenu) {
        setChatContextMenu(null);
        return;
      }
      if (messageContextMenu) {
        setMessageContextMenu(null);
        return;
      }

      // 2. Close Media Viewer Lightbox
      if (viewerMedia) {
        setViewerMedia(null);
        return;
      }

      // 3. Clear Multi-select
      if (selectedMessageIds.length > 0) {
        clearSelectedMessages();
        return;
      }

      // 4. Close Active Modals (Settings, Calls, Invites, New chat)
      if (activeModal !== 'none') {
        setActiveModal('none');
        return;
      }

      // 5. Close Drawer
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        return;
      }

      // 6. Close Right Info Panel
      if (isRightPanelOpen) {
        setIsRightPanelOpen(false);
        return;
      }

      // 7. Cancel Editing / Replying
      if (editingMessage) {
        setEditingMessage(null);
        return;
      }
      if (replyingTo) {
        setReplyingTo(null);
        return;
      }

      // 8. Navigate from Chat back to Chat List on Mobile
      if (activeChatId && window.innerWidth < 768) {
        setActiveChatId(null);
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    chatContextMenu,
    messageContextMenu,
    viewerMedia,
    selectedMessageIds,
    activeModal,
    isDrawerOpen,
    isRightPanelOpen,
    editingMessage,
    replyingTo,
    activeChatId,
    setChatContextMenu,
    setMessageContextMenu,
    setViewerMedia,
    clearSelectedMessages,
    setActiveModal,
    setIsDrawerOpen,
    setIsRightPanelOpen,
    setEditingMessage,
    setReplyingTo,
    setActiveChatId,
  ]);

  // Handle Escape keyboard key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (chatContextMenu) setChatContextMenu(null);
        if (messageContextMenu) setMessageContextMenu(null);
        if (viewerMedia) setViewerMedia(null);
        if (selectedMessageIds.length > 0) clearSelectedMessages();
        if (activeModal !== 'none') setActiveModal('none');
        if (isDrawerOpen) setIsDrawerOpen(false);
        if (isRightPanelOpen) setIsRightPanelOpen(false);
        if (editingMessage) setEditingMessage(null);
        if (replyingTo) setReplyingTo(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    chatContextMenu,
    messageContextMenu,
    viewerMedia,
    selectedMessageIds,
    activeModal,
    isDrawerOpen,
    isRightPanelOpen,
    editingMessage,
    replyingTo,
    setChatContextMenu,
    setMessageContextMenu,
    setViewerMedia,
    clearSelectedMessages,
    setActiveModal,
    setIsDrawerOpen,
    setIsRightPanelOpen,
    setEditingMessage,
    setReplyingTo,
  ]);
}
