
import { Connection, ConnectionType } from "@/types/connection";
import { v4 as uuidv4 } from "uuid";

// In a real app, this would be stored in a database or localStorage
let connections: Connection[] = [
  {
    id: "1",
    name: "Secure Messaging Group",
    type: ConnectionType.TELEGRAM,
    url: "https://t.me/securemessaging",
    description: "Main channel for secure communication updates",
    isActive: true,
    createdAt: new Date("2023-01-15")
  },
  {
    id: "2",
    name: "Privacy Tech",
    type: ConnectionType.FACEBOOK,
    url: "https://facebook.com/privacytech",
    description: "Facebook group discussing privacy technologies",
    isActive: true,
    createdAt: new Date("2023-02-20")
  },
  {
    id: "3",
    name: "#securecommunication",
    type: ConnectionType.INSTAGRAM,
    url: "https://instagram.com/explore/tags/securecommunication",
    description: "Instagram hashtag for secure communication topics",
    isActive: true,
    createdAt: new Date("2023-03-10")
  },
  {
    id: "4",
    name: "Cryptography Channel",
    type: ConnectionType.TWITTER,
    url: "https://x.com/cryptography",
    description: "X.com account sharing cryptography news",
    isActive: true,
    createdAt: new Date("2023-04-25")
  }
];

export const getConnections = (): Connection[] => {
  return [...connections];
};

export const getConnectionsByType = (type: ConnectionType): Connection[] => {
  return connections.filter(connection => connection.type === type);
};

export const addConnection = (connection: Omit<Connection, "id" | "createdAt">): Connection => {
  const newConnection = {
    ...connection,
    id: uuidv4(),
    createdAt: new Date()
  };
  
  connections.push(newConnection);
  return newConnection;
};

export const updateConnection = (id: string, updates: Partial<Omit<Connection, "id" | "createdAt">>): Connection | null => {
  const index = connections.findIndex(conn => conn.id === id);
  if (index === -1) return null;
  
  connections[index] = { ...connections[index], ...updates };
  return connections[index];
};

export const removeConnection = (id: string): boolean => {
  const initialLength = connections.length;
  connections = connections.filter(conn => conn.id !== id);
  return connections.length < initialLength;
};

export const importConnectionsFromMessage = (connectionData: any): Connection[] => {
  // This would parse connection data from an extracted message
  // For now, it's just a placeholder
  const newConnections: Connection[] = [];
  
  if (Array.isArray(connectionData)) {
    connectionData.forEach((conn: any) => {
      if (conn.name && conn.type && conn.url) {
        const newConnection = {
          id: uuidv4(),
          name: conn.name,
          type: conn.type as ConnectionType,
          url: conn.url,
          description: conn.description || "",
          isActive: true,
          createdAt: new Date()
        };
        
        connections.push(newConnection);
        newConnections.push(newConnection);
      }
    });
  }
  
  return newConnections;
};
