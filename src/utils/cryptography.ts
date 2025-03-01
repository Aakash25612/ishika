
// Utility functions for handling cryptographic operations
export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface MessageConfig {
  isAnonymous: boolean;
  recipientPublicKey?: CryptoKey;
  messageType: MessageType;
}

export enum MessageType {
  STANDARD = "standard",
  CONNECTION_UPDATE = "connection_update",
  NODE_MESSAGE = "node_message",
  TRANSACTION_REQUEST = "transaction_request"
}

// Generate a new key pair for a user
export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

// Export public key to string format for sharing
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import public key from string format
export async function importPublicKey(keyStr: string): Promise<CryptoKey> {
  const binaryKey = Uint8Array.from(atob(keyStr), (c) => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "spki",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

// Encrypt a message for a specific recipient
export async function encryptMessage(
  message: string,
  recipientPublicKey: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientPublicKey,
    data
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// Decrypt a message with the recipient's private key
export async function decryptMessage(
  encryptedMessage: string,
  privateKey: CryptoKey
): Promise<string> {
  const data = Uint8Array.from(atob(encryptedMessage), (c) => c.charCodeAt(0));
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    data
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
