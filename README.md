# Expense Tracker App

A simplified version of a Splitwise-style Expense Tracker app built with React Native and Expo.

## Features

- Create and manage expense groups
- Add expenses with detailed information
- Split expenses equally or with custom amounts
- Track balances within groups
- View overall financial summary
- Persistent data storage

## Tech Stack

- React Native with Expo
- TypeScript
- Zustand for state management
- AsyncStorage for persistent data
- React Navigation for routing
- React Native Paper for UI components

## Installation

1. Clone the repository:
    git clone https://github.com/yourusername/expense-tracker.git
    cd expense-tracker

2. Install dependencies:
    npm install

3. Start the development server:
    npx expo start

## Project Structure

- `src/assets`: Static assets like images and fonts
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks
- `src/navigation`: Navigation setup
- `src/screens`: App screens
- `src/store`: Zustand state management
- `src/types`: TypeScript types and interfaces
- `src/utils`: Utility functions

## Bonus Features Implemented

1. View all members in a group
2. Summary of amount owed/received per group and overall
3. User profile management

## Usage

- Create a new group from the home screen
- Add members to your group
- Add expenses within the group
- View balances and settle up with group members
