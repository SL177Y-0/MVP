/**
 * Input validation utilities
 */

/**
 * Validates Twitter username
 * @param username Twitter username to validate
 * @returns Error message if invalid, null if valid
 */
export const validateTwitterUsername = (username: string | null | undefined): string | null => {
  if (!username) {
    return 'Twitter username is required';
  }
  
  if (typeof username !== 'string') {
    return 'Twitter username must be a string';
  }
  
  // Twitter username rules: 4-15 characters, alphanumeric and underscore only
  if (!/^[a-zA-Z0-9_]{4,15}$/.test(username)) {
    return 'Twitter username must be 4-15 characters and contain only letters, numbers, and underscores';
  }
  
  return null;
};

/**
 * Validates wallet address
 * @param address Ethereum wallet address to validate
 * @returns Error message if invalid, null if valid
 */
export const validateWalletAddress = (address: string | null | undefined): string | null => {
  if (!address) {
    return null; // Wallet can be optional in some API calls
  }
  
  if (typeof address !== 'string') {
    return 'Wallet address must be a string';
  }
  
  // Basic Ethereum address validation
  if (!/^(0x)?[0-9a-fA-F]{40}$/.test(address)) {
    return 'Invalid wallet address format';
  }
  
  return null;
};

/**
 * Validates Verida DID
 * @param did Verida DID to validate
 * @returns Error message if invalid, null if valid
 */
export const validateVeridaDid = (did: string | null | undefined): string | null => {
  if (!did) {
    return 'Verida DID is required';
  }
  
  if (typeof did !== 'string') {
    return 'Verida DID must be a string';
  }
  
  // Basic DID validation
  if (!did.startsWith('did:')) {
    return 'Verida DID must start with "did:"';
  }
  
  return null;
};

/**
 * Validates email address
 * @param email Email address to validate
 * @returns Error message if invalid, null if valid
 */
export const validateEmail = (email: string | null | undefined): string | null => {
  if (!email) {
    return 'Email is required';
  }
  
  if (typeof email !== 'string') {
    return 'Email must be a string';
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  
  return null;
};

/**
 * Validates user identifier (privyId, userId, or userDid)
 * @param userId Any user identifier to validate
 * @returns Error message if invalid, null if valid
 */
export const validatePrivyId = (userId: string | null | undefined): string | null => {
  if (!userId) {
    return 'User ID is required';
  }
  
  if (typeof userId !== 'string') {
    return 'User ID must be a string';
  }
  
  // DID format check if it looks like a DID
  if (userId.startsWith('did:') && userId.split(':').length < 3) {
    return 'Invalid DID format';
  }
  
  return null;
};

/**
 * Validates score data before API submission
 * @param data Score data object
 * @returns Error message if invalid, null if valid
 */
export const validateScoreData = (data: any): string | null => {
  if (!data || typeof data !== 'object') {
    return 'Invalid score data';
  }
  
  if (data.twitterUsername) {
    const twitterError = validateTwitterUsername(data.twitterUsername);
    if (twitterError) return twitterError;
  }
  
  if (data.walletAddress) {
    const walletError = validateWalletAddress(data.walletAddress);
    if (walletError) return walletError;
  }
  
  if (data.userDid) {
    const didError = validateVeridaDid(data.userDid);
    if (didError) return didError;
  }
  
  return null;
}; 