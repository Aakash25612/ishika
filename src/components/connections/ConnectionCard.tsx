
import React from "react";
import { Connection, ConnectionType } from "@/types/connection";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Trash2, ExternalLink, Twitter, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionCardProps {
  connection: Connection;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, onDelete, onToggleActive }) => {
  const getIcon = () => {
    switch (connection.type) {
      case ConnectionType.TELEGRAM:
        return <MessageCircle className="h-5 w-5" />;
      case ConnectionType.FACEBOOK:
        return <Facebook className="h-5 w-5" />;
      case ConnectionType.INSTAGRAM:
        return <Instagram className="h-5 w-5" />;
      case ConnectionType.TWITTER:
        return <Twitter className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const getTypeName = () => {
    switch (connection.type) {
      case ConnectionType.TELEGRAM:
        return "Telegram";
      case ConnectionType.FACEBOOK:
        return "Facebook";
      case ConnectionType.INSTAGRAM:
        return "Instagram";
      case ConnectionType.TWITTER:
        return "X.com";
      default:
        return "Other";
    }
  };

  return (
    <Card className={cn("transition-all", !connection.isActive && "opacity-60")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getIcon()}
            {connection.name}
          </CardTitle>
          <Badge variant={connection.isActive ? "default" : "outline"}>
            {getTypeName()}
          </Badge>
        </div>
        <CardDescription>{connection.description}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm pb-2">
        <a 
          href={connection.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-500 hover:underline"
        >
          <ExternalLink className="h-3 w-3" /> {connection.url}
        </a>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onToggleActive(connection.id, !connection.isActive)}
        >
          {connection.isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive" 
          onClick={() => onDelete(connection.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Remove
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectionCard;
