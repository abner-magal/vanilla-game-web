/**
 * File Helpers - Shared File System Utilities
 * Pure JavaScript - Zero Dependencies
 * 
 * Provides common file operations used across test files.
 */

const fs = require('fs');
const path = require('path');

/**
 * Get the game-site root directory
 * @returns {string} Path to game-site root
 */
function getGameSiteRoot() {
  const currentDir = __dirname;
  // Navigate from utils/ to tests/ to game-site/
  if (currentDir.includes('utils')) {
    return path.join(currentDir, '..', '..');
  }
  if (currentDir.includes('tests')) {
    return path.join(currentDir, '..');
  }
  return currentDir;
}

/**
 * Get path to a game's files
 * @param {string} gameName - Name of the game (e.g., 'space-invaders')
 * @returns {Object} Paths to CSS and HTML files
 */
function getGamePaths(gameName) {
  const root = getGameSiteRoot();
  return {
    css: path.join(root, 'src', 'games', gameName, 'style.css'),
    html: path.join(root, 'src', 'games', gameName, 'index.html'),
    js: path.join(root, 'src', 'games', gameName, `${toPascalCase(gameName)}Game.js`)
  };
}

/**
 * Convert kebab-case to PascalCase
 * @param {string} str - Kebab-case string
 * @returns {string} PascalCase string
 */
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Read file content safely
 * @param {string} filePath - Path to file
 * @returns {string|null} File content or null if not found
 */
function readFileSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Get all game directories
 * @returns {string[]} Array of game directory names
 */
function getAllGameDirs() {
  const root = getGameSiteRoot();
  const gamesDir = path.join(root, 'src', 'games');
  
  try {
    return fs.readdirSync(gamesDir).filter(item => {
      const itemPath = path.join(gamesDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
  } catch (error) {
    console.error('Error reading games directory:', error.message);
    return [];
  }
}

/**
 * Get games.json content
 * @returns {Array|null} Games array or null if not found
 */
function getGamesJson() {
  const root = getGameSiteRoot();
  const gamesJsonPath = path.join(root, 'public', 'config', 'games.json');
  
  const content = readFileSafe(gamesJsonPath);
  if (content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing games.json:', error.message);
      return null;
    }
  }
  return null;
}

/**
 * Get path to styles directory
 * @returns {string} Path to styles directory
 */
function getStylesDir() {
  return path.join(getGameSiteRoot(), 'styles');
}

/**
 * Get path to public directory
 * @returns {string} Path to public directory
 */
function getPublicDir() {
  return path.join(getGameSiteRoot(), 'public');
}

module.exports = {
  getGameSiteRoot,
  getGamePaths,
  toPascalCase,
  readFileSafe,
  fileExists,
  getAllGameDirs,
  getGamesJson,
  getStylesDir,
  getPublicDir
};
