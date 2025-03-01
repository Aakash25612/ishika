
import React from "react";
import { Button } from "@/components/ui/button";
import { ConnectionType } from "@/types/connection";
import { Facebook, Instagram, MessageCircle, Twitter, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionFilterProps {
  selectedType: ConnectionType | null;
  onSelectType: (type: ConnectionType | null) => void;
}

const ConnectionFilter: React.FC<ConnectionFilterProps> = ({ selectedType, onSelectType }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={selectedType === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectType(null)}
      >
        <Filter className="mr-1 h-4 w-4" /> All
      </Button>
      
      <Button
        variant={selectedType === ConnectionType.TELEGRAM ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectType(ConnectionType.TELEGRAM)}
        className={cn(
          selectedType === ConnectionType.TELEGRAM && "bg-blue-600 hover:bg-blue-700"
        )}
      >
        <MessageCircle className="mr-1 h-4 w-4" /> Telegram
      </Button>
      
      <Button
        variant={selectedType === ConnectionType.FACEBOOK ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectType(ConnectionType.FACEBOOK)}
        className={cn(
          selectedType === ConnectionType.FACEBOOK && "bg-blue-500 hover:bg-blue-600"
        )}
      >
        <Facebook className="mr-1 h-4 w-4" /> Facebook
      </Button>
      
      <Button
        variant={selectedType === ConnectionType.INSTAGRAM ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectType(ConnectionType.INSTAGRAM)}
        className={cn(
          selectedType === ConnectionType.INSTAGRAM && "bg-pink-500 hover:bg-pink-600"
        )}
      >
        <Instagram className="mr-1 h-4 w-4" /> Instagram
      </Button>
      
      <Button
        variant={selectedType === ConnectionType.TWITTER ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectType(ConnectionType.TWITTER)}
        className={cn(
          selectedType === ConnectionType.TWITTER && "bg-gray-800 hover:bg-gray-900"
        )}
      >
        <Twitter className="mr-1 h-4 w-4" /> X.com
      </Button>
    </div>
  );
};

export default ConnectionFilter;
