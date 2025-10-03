import '@testing-library/jest-dom';

// Mock window methods that jsdom doesn't implement
global.alert = () => {};
global.confirm = () => true;
