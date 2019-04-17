export const registerPlugin = jest.fn();

export let onWordClicked: (e: any) => null;
export let onPopupClosed: () => null;
export let onSidebarOpen: () => null;

export const mockSidebarController = {
  close: jest.fn()
};

export const mockPopupController = {
  close: jest.fn()
};

export const decorateContent = jest.fn((_1: any, _2: any, _3: any, listeners: any) => {
  // Save provided listener function.
  onWordClicked = listeners[0].listener;
});

export const addPopup = jest.fn(options => {
  onPopupClosed = options.onClose;
  return mockPopupController;
});

export const addSidebar = jest.fn(options => {
  onSidebarOpen = options.onOpen;
  return mockSidebarController;
});

export const simulateTestWordClick = (word: string) => {
  const event = { srcElement: { textContent: word }};
  onWordClicked(event);
};
