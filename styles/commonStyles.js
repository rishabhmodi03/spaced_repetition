import { StyleSheet } from 'react-native';

export const Colors = {
  primary: 'tomato',
  primaryDark: '#d35400', // Darker shade of tomato
  secondary: '#3498db', // A nice blue
  lightGray: '#f0f0f0',
  mediumGray: '#bdc3c7',
  darkGray: '#7f8c8d',
  text: '#333333',
  white: '#ffffff',
  black: '#000000',
  success: '#2ecc71', // Green
  danger: '#e74c3c',  // Red
  warning: '#f39c12', // Yellow/Orange
};

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: Colors.lightGray, // Default screen background
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.lightGray,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25, // More rounded buttons
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    marginVertical: 10,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  dangerButton: {
    backgroundColor: Colors.danger,
  },
  input: {
    width: '100%', // Make inputs take full available width by default in their container
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    borderRadius: 8, // Slightly more rounded inputs
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  // List item styling can also be added here or kept screen-specific if very different
  listItem: {
    backgroundColor: Colors.white,
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  listItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  // ... other global styles
});

// Function to get specific button style
export const getButtonStyle = (type) => {
  switch (type) {
    case 'secondary':
      return [GlobalStyles.button, GlobalStyles.secondaryButton];
    case 'danger':
      return [GlobalStyles.button, GlobalStyles.dangerButton];
    default: // primary
      return GlobalStyles.button;
  }
};
