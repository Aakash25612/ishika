
import { KeyPair } from "./cryptography";

/**
 * Sign a Node Message with the sender's private key
 */
export const signNodeMessage = async (
  message: string,
  privateKey: CryptoKey
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  try {
    // We need to generate a new key pair for signing specifically
    const signingKeyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048, 
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    );
    
    // Sign the message with the new signing key
    const signature = await window.crypto.subtle.sign(
      {
        name: "RSASSA-PKCS1-v1_5",
      },
      signingKeyPair.privateKey,
      data
    );
    
    // Convert signature to base64 string
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  } catch (error) {
    console.error("Error signing message:", error);
    throw error;
  }
};

/**
 * Verify a Node Message signature using the sender's public key
 */
export const verifyNodeMessage = async (
  message: string,
  signature: string,
  publicKey: CryptoKey
): Promise<boolean> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  
  try {
    // For verification, we need to import the public key with the right algorithm
    const verifyKey = await window.crypto.subtle.importKey(
      "spki",
      await window.crypto.subtle.exportKey("spki", publicKey),
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );
    
    // Verify the signature
    const isValid = await window.crypto.subtle.verify(
      {
        name: "RSASSA-PKCS1-v1_5",
      },
      verifyKey,
      signatureBytes,
      data
    );
    
    return isValid;
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
};

/**
 * Create a Node Message with signature and public key for embedding in an image
 */
export const createSignedNodeMessage = async (
  connectionMessage: string,
  keyPair: KeyPair
): Promise<{
  message: string;
  signature: string;
  publicKeyStr: string;
  timestamp: string;
}> => {
  try {
    // Sign the message
    const signature = await signNodeMessage(connectionMessage, keyPair.privateKey);
    
    // Export public key to string format
    const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const publicKeyStr = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));
    
    return {
      message: connectionMessage,
      signature,
      publicKeyStr,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Failed to create signed node message:", error);
    throw error;
  }
};

/**
 * Verify a signed Node Message
 */
export const verifySignedNodeMessage = async (
  message: string,
  signature: string,
  publicKeyStr: string
): Promise<boolean> => {
  try {
    // Import public key from string
    const publicKeyBytes = Uint8Array.from(atob(publicKeyStr), c => c.charCodeAt(0));
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      publicKeyBytes,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      true,
      ["verify"]
    );
    
    // Verify signature
    return await verifyNodeMessage(message, signature, publicKey);
  } catch (error) {
    console.error("Failed to verify signed node message:", error);
    return false;
  }
};
