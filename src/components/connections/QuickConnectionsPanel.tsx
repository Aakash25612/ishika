
import React, { useEffect, useState } from "react";
import { Connection, ConnectionType } from "@/types/connection";
import { getConnections } from "@/services/connectionService";
import { Facebook, Instagram, MessageCircle, Twitter, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const QuickConnectionsPanel = () => {
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    // Get active connections only
    const activeConnections = getConnections().filter(conn => conn.isActive);
    setConnections(activeConnections.slice(0, 4)); // Show only the first 4
  }, []);

  const getIcon = (type: ConnectionType) => {
    switch (type) {
      case ConnectionType.TELEGRAM:
        return <MessageCircle className="h-4 w-4" />;
      case ConnectionType.FACEBOOK:
        return <Facebook className="h-4 w-4" />;
      case ConnectionType.INSTAGRAM:
        return <Instagram className="h-4 w-4" />;
      case ConnectionType.TWITTER:
        return <Twitter className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  if (connections.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Active Connections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {connections.map(connection => (
          <a
            key={connection.id}
            href={connection.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-muted transition-colors"
          >
            {getIcon(connection.type)}
            <span className="flex-1 truncate">{connection.name}</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        ))}
        
        <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
          <Link to="/connections">
            Manage Connections
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickConnectionsPanel;
