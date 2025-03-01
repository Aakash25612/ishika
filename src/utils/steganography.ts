
import { MessageConfig, encryptMessage, decryptMessage, MessageType } from './cryptography';

interface SecureMessage {
  content: string;
  isAnonymous: boolean;
  recipientPublicKeyStr?: string;
  messageType: MessageType;
  tradingInfo?: {
    tradeType: 'buy' | 'sell';
    amount: number;
    paymentMethod: string;
    escrowEnabled: boolean;
    location?: string;
  };
}

// Steganography implementation using LSB (Least Significant Bit) technique
export const hideMessage = async (
  image: File, 
  message: string,
  config?: MessageConfig,
  senderPrivateKey?: CryptoKey
): Promise<string> => {
  let finalMessage: SecureMessage = {
    content: message,
    isAnonymous: config?.isAnonymous ?? true,
    messageType: config?.messageType ?? MessageType.STANDARD,
  };

  // If there's a recipient public key, encrypt the message
  if (config?.recipientPublicKey) {
    finalMessage.content = await encryptMessage(message, config.recipientPublicKey);
    finalMessage.recipientPublicKeyStr = await window.crypto.subtle.exportKey(
      "spki",
      config.recipientPublicKey
    ).then(key => btoa(String.fromCharCode(...new Uint8Array(key))));
  }

  // Trading information for BitPic P2P exchanges
  if (config?.messageType === MessageType.TRANSACTION_REQUEST) {
    try {
      // Parse trading info from message if it's in JSON format
      const tradingData = JSON.parse(message);
      if (tradingData.tradeType && tradingData.amount) {
        finalMessage.tradingInfo = {
          tradeType: tradingData.tradeType,
          amount: tradingData.amount,
          paymentMethod: tradingData.paymentMethod || 'bank_transfer',
          escrowEnabled: tradingData.escrowEnabled !== false,
          location: tradingData.location
        };
      }
    } catch (e) {
      // If message isn't valid JSON, continue without trading info
      console.log("Message isn't in trading format, continuing without trading info");
    }
  }

  // Convert the message object to a string
  const messageStr = JSON.stringify(finalMessage);

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Convert message to binary
        const binary = messageStr.split('').map(char => 
          char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join('');

        // Add message length at the beginning (32 bits)
        const binaryLength = binary.length.toString(2).padStart(32, '0');
        const fullBinary = binaryLength + binary;

        // Embed the binary data
        for (let i = 0; i < fullBinary.length; i++) {
          const pos = i * 4;
          if (pos < pixels.length) {
            pixels[pos] = (pixels[pos] & 254) | parseInt(fullBinary[i]);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(image);
  });
};

export const extractMessage = async (
  image: File,
  privateKey?: CryptoKey
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          // Extract binary data
          let binaryData = '';
          for (let i = 0; i < pixels.length; i += 4) {
            binaryData += pixels[i] & 1;
          }

          // First 32 bits contain the message length
          const messageLength = parseInt(binaryData.slice(0, 32), 2);
          const messageBinary = binaryData.slice(32, 32 + messageLength);

          // Convert binary to text
          let messageStr = '';
          for (let i = 0; i < messageBinary.length; i += 8) {
            const byte = messageBinary.slice(i, i + 8);
            messageStr += String.fromCharCode(parseInt(byte, 2));
          }

          const secureMessage: SecureMessage = JSON.parse(messageStr);

          // If the message is encrypted and we have a private key, decrypt it
          if (secureMessage.recipientPublicKeyStr && privateKey) {
            secureMessage.content = await decryptMessage(
              secureMessage.content,
              privateKey
            );
          }

          resolve(JSON.stringify({
            content: secureMessage.content,
            messageType: secureMessage.messageType,
            tradingInfo: secureMessage.tradingInfo
          }));
        } catch (error) {
          reject(error);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(image);
  });
};

// Export Bitcoin trading proposal to steganographic image
export const createTradingProposal = async (
  image: File,
  tradeType: 'buy' | 'sell',
  amount: number,
  paymentMethod: string,
  location: string,
  escrowEnabled: boolean = true,
  recipientPublicKey?: CryptoKey,
  senderPrivateKey?: CryptoKey
): Promise<string> => {
  const tradingMessage = JSON.stringify({
    tradeType,
    amount,
    paymentMethod,
    location,
    escrowEnabled,
    timestamp: new Date().toISOString()
  });
  
  return hideMessage(
    image,
    tradingMessage,
    {
      isAnonymous: false,
      recipientPublicKey,
      messageType: MessageType.TRANSACTION_REQUEST
    },
    senderPrivateKey
  );
};
